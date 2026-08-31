// Cash on Delivery needs no external API — the "payment" is just an
// agreement that the buyer pays the courier at the door. It always
// succeeds at the initiation step; the order stays payment_status =
// 'pending' until a seller/admin marks it paid on delivery.
export const cashOnDeliveryProvider = {
  name: 'cash_on_delivery',

  isConfigured() {
    return true;
  },

  async initiate({ orderId, amount }) {
    return {
      status: 'pending',
      transactionReference: `COD-${orderId}`,
      message: 'Cash on Delivery selected. Pay the courier when your order arrives.',
    };
  },

  // COD has no provider to poll — "verification" happens manually when a
  // seller/admin marks the order delivered and paid.
  async verify() {
    return { status: 'pending' };
  },
};
