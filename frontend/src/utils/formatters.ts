import { Currency, Language } from '../types';

export function formatPrice(priceETB: number, priceUSD: number, currency: Currency, _lang: Language): string {
  if (currency === 'ETB') {
    return `${priceETB.toLocaleString()} ብር`;
  }
  return `$${priceUSD.toFixed(2)}`;
}

export function calculateCartTotals(
  items: { product: { priceETB: number; priceUSD: number }; quantity: number; selectedOption?: string }[],
  shippingMethod: 'sheger_express' | 'ethiopian_post' | 'dhl_express',
  couponDiscountPercent: number = 0
) {
  let subtotalETB = 0;
  let subtotalUSD = 0;

  for (const item of items) {
    subtotalETB += item.product.priceETB * item.quantity;
    subtotalUSD += item.product.priceUSD * item.quantity;
  }

  const discountETB = Math.round(subtotalETB * (couponDiscountPercent / 100));
  const discountUSD = Number((subtotalUSD * (couponDiscountPercent / 100)).toFixed(2));

  let shippingFeeETB = 150;
  let shippingFeeUSD = 5.0;

  if (shippingMethod === 'sheger_express') {
    // Free in Addis if subtotal > 1500 ETB
    if (subtotalETB >= 1500) {
      shippingFeeETB = 0;
      shippingFeeUSD = 0;
    } else {
      shippingFeeETB = 150;
      shippingFeeUSD = 2.50;
    }
  } else if (shippingMethod === 'ethiopian_post') {
    shippingFeeETB = 250;
    shippingFeeUSD = 4.00;
  } else if (shippingMethod === 'dhl_express') {
    shippingFeeETB = 3500;
    shippingFeeUSD = 28.00;
  }

  const totalETB = Math.max(0, subtotalETB - discountETB + shippingFeeETB);
  const totalUSD = Number(Math.max(0, subtotalUSD - discountUSD + shippingFeeUSD).toFixed(2));

  return {
    subtotalETB,
    subtotalUSD,
    discountETB,
    discountUSD,
    shippingFeeETB,
    shippingFeeUSD,
    totalETB,
    totalUSD
  };
}
