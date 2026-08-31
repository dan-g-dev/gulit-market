import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { getProvider } from '../services/paymentService.js';
import { getOrCreateCart } from './cart.controller.js';
import { ROLES } from '../utils/roles.js';

const FLAT_DELIVERY_FEE_ETB = 150; // simple flat rate; could be made distance-based later

function serializeOrder(order, items) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    subtotalETB: Number(order.subtotal_etb),
    deliveryFeeETB: Number(order.delivery_fee_etb),
    totalETB: Number(order.total_etb),
    delivery: {
      fullName: order.delivery_full_name,
      phone: order.delivery_phone,
      region: order.delivery_region,
      city: order.delivery_city,
      subcity: order.delivery_subcity,
      woreda: order.delivery_woreda,
      address: order.delivery_address,
      instructions: order.delivery_instructions,
    },
    paymentProvider: order.payment_provider,
    paymentStatus: order.payment_status,
    transactionReference: order.transaction_reference,
    paidAt: order.paid_at,
    items: items.map((i) => ({
      id: i.id,
      listingId: i.listing_id,
      sellerId: i.seller_id,
      title: i.title,
      unitPriceETB: Number(i.unit_price_etb),
      quantity: i.quantity,
    })),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

async function loadOrder(orderId) {
  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = :id', { id: orderId });
  const order = orderRows[0];
  if (!order) return null;
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = :id', { id: orderId });
  return serializeOrder(order, items);
}

// POST /api/orders  — checkout from the current cart
// body: { delivery: {...}, paymentProvider: 'cash_on_delivery' | 'telebirr' }
export const createOrder = asyncHandler(async (req, res) => {
  const { delivery, paymentProvider } = req.body;

  if (!delivery || !delivery.fullName || !delivery.phone || !delivery.region || !delivery.city) {
    throw new ApiError(400, 'delivery.fullName, phone, region and city are required');
  }
  const provider = getProvider(paymentProvider);

  const cart = await getOrCreateCart(req.user.id);
  const [cartItems] = await pool.query('SELECT * FROM cart_items WHERE cart_id = :cartId', {
    cartId: cart.id,
  });
  if (!cartItems.length) throw new ApiError(400, 'Your cart is empty');

  // Recompute totals from the DB — never trust client-sent prices.
  let subtotal = 0;
  const lineItems = [];
  for (const item of cartItems) {
    const [listingRows] = await pool.query('SELECT * FROM listings WHERE id = :id', {
      id: item.listing_id,
    });
    const listing = listingRows[0];
    if (!listing) throw new ApiError(400, 'A listing in your cart no longer exists');
    if (listing.status !== 'active') throw new ApiError(400, `"${listing.title}" is no longer available`);

    subtotal += Number(listing.price_etb) * item.quantity;
    lineItems.push({
      listingId: listing.id,
      sellerId: listing.seller_id,
      title: listing.title,
      unitPriceETB: listing.price_etb,
      quantity: item.quantity,
    });
  }

  const deliveryFee = FLAT_DELIVERY_FEE_ETB;
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  const [orderResult] = await pool.query(
    `INSERT INTO orders (
      order_number, buyer_id, status, subtotal_etb, delivery_fee_etb, total_etb,
      delivery_full_name, delivery_phone, delivery_region, delivery_city,
      delivery_subcity, delivery_woreda, delivery_address, delivery_instructions,
      payment_provider, payment_status
    ) VALUES (
      :orderNumber, :buyerId, 'pending', :subtotal, :deliveryFee, :total,
      :fullName, :phone, :region, :city, :subcity, :woreda, :address, :instructions,
      :paymentProvider, 'pending'
    )`,
    {
      orderNumber,
      buyerId: req.user.id,
      subtotal,
      deliveryFee,
      total,
      fullName: delivery.fullName,
      phone: delivery.phone,
      region: delivery.region,
      city: delivery.city,
      subcity: delivery.subcity ?? null,
      woreda: delivery.woreda ?? null,
      address: delivery.address ?? null,
      instructions: delivery.instructions ?? null,
      paymentProvider,
    }
  );
  const orderId = orderResult.insertId;

  for (const item of lineItems) {
    await pool.query(
      `INSERT INTO order_items (order_id, listing_id, seller_id, title, unit_price_etb, quantity)
       VALUES (:orderId, :listingId, :sellerId, :title, :unitPriceETB, :quantity)`,
      { orderId, ...item }
    );
  }

  // Initiate payment via the provider abstraction. COD always succeeds
  // (pending until delivery); TeleBirr throws a clear 501 if unconfigured
  // rather than faking success — see services/payments/telebirrProvider.js
  let paymentResult;
  try {
    paymentResult = await provider.initiate({ orderId, amount: total });
  } catch (err) {
    // Roll the order back to 'cancelled' rather than leaving a paid-nothing
    // order dangling if the payment step fails immediately.
    await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = :id", { id: orderId });
    throw err;
  }

  await pool.query(
    `INSERT INTO payments (order_id, provider, status, amount_etb, transaction_reference)
     VALUES (:orderId, :provider, :status, :amount, :ref)`,
    {
      orderId,
      provider: paymentProvider,
      status: paymentResult.status,
      amount: total,
      ref: paymentResult.transactionReference ?? null,
    }
  );
  await pool.query(
    `UPDATE orders SET status = 'confirmed', payment_status = :status, transaction_reference = :ref WHERE id = :id`,
    { id: orderId, status: paymentResult.status, ref: paymentResult.transactionReference ?? null }
  );

  // Empty the cart now that the order has been placed.
  await pool.query('DELETE FROM cart_items WHERE cart_id = :cartId', { cartId: cart.id });

  res.status(201).json({ order: await loadOrder(orderId), payment: paymentResult });
});

// GET /api/orders — current user's orders (as buyer)
export const listMyOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id FROM orders WHERE buyer_id = :buyerId ORDER BY created_at DESC',
    { buyerId: req.user.id }
  );
  const orders = await Promise.all(rows.map((r) => loadOrder(r.id)));
  res.json({ orders });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = :id', { id: req.params.id });
  const orderRow = rows[0];
  if (!orderRow) throw new ApiError(404, 'Order not found');

  const isBuyer = orderRow.buyer_id === req.user.id;
  const isAdmin = req.user.role_id === ROLES.ADMIN;
  let isSeller = false;
  if (!isBuyer && !isAdmin) {
    const [itemRows] = await pool.query(
      'SELECT 1 FROM order_items WHERE order_id = :id AND seller_id = :sellerId LIMIT 1',
      { id: orderRow.id, sellerId: req.user.id }
    );
    isSeller = !!itemRows[0];
  }
  if (!isBuyer && !isAdmin && !isSeller) throw new ApiError(403, 'You do not have access to this order');

  res.json({ order: await loadOrder(orderRow.id) });
});

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// PUT /api/orders/:id/status  { status }  (seller of an item in the order, or admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  const [rows] = await pool.query('SELECT * FROM orders WHERE id = :id', { id: req.params.id });
  const orderRow = rows[0];
  if (!orderRow) throw new ApiError(404, 'Order not found');

  if (req.user.role_id !== ROLES.ADMIN) {
    const [itemRows] = await pool.query(
      'SELECT 1 FROM order_items WHERE order_id = :id AND seller_id = :sellerId LIMIT 1',
      { id: orderRow.id, sellerId: req.user.id }
    );
    if (!itemRows[0]) throw new ApiError(403, 'You do not have access to this order');
  }

  await pool.query('UPDATE orders SET status = :status WHERE id = :id', { status, id: orderRow.id });

  // Cash-on-delivery orders are marked paid once delivered.
  if (status === 'delivered' && orderRow.payment_provider === 'cash_on_delivery') {
    await pool.query(
      "UPDATE orders SET payment_status = 'paid', paid_at = NOW() WHERE id = :id",
      { id: orderRow.id }
    );
    await pool.query(
      "UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = :id",
      { id: orderRow.id }
    );
  }

  res.json({ order: await loadOrder(orderRow.id) });
});

export { loadOrder };
