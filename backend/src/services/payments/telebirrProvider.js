// TeleBirr integration.
//
// IMPORTANT: this is intentionally NOT faked. Without real merchant
// credentials (TELEBIRR_APP_ID / TELEBIRR_APP_KEY / TELEBIRR_MERCHANT_CODE /
// TELEBIRR_SHORT_CODE) there is no way to actually charge anyone through
// TeleBirr, so this provider reports itself as "not configured" rather than
// pretending a payment succeeded.
//
// To go live:
//   1. Register as a TeleBirr merchant and obtain the credentials above.
//   2. Fill them into .env.
//   3. Implement `initiate` to call TeleBirr's "create order" API
//      (their webinit / applyfold endpoint) and return the resulting
//      payment URL.
//   4. Implement `verify` to call TeleBirr's "query order" API, or handle
//      their async callback at TELEBIRR_CALLBACK_URL.
import { ApiError } from '../../utils/ApiError.js';

function credentials() {
  return {
    appId: process.env.TELEBIRR_APP_ID,
    appKey: process.env.TELEBIRR_APP_KEY,
    merchantCode: process.env.TELEBIRR_MERCHANT_CODE,
    shortCode: process.env.TELEBIRR_SHORT_CODE,
  };
}

export const telebirrProvider = {
  name: 'telebirr',

  isConfigured() {
    const c = credentials();
    return Boolean(c.appId && c.appKey && c.merchantCode && c.shortCode);
  },

  async initiate({ orderId, amount }) {
    if (!this.isConfigured()) {
      throw new ApiError(
        501,
        'TeleBirr is ready for configuration but no merchant credentials are set. ' +
          'Add TELEBIRR_APP_ID, TELEBIRR_APP_KEY, TELEBIRR_MERCHANT_CODE and ' +
          'TELEBIRR_SHORT_CODE to backend/.env to enable it.'
      );
    }

    // TODO (real integration): call TeleBirr's create-order API here with
    // `credentials()` and `amount`, then return the redirect URL it gives
    // back, e.g.:
    //   const res = await fetch('https://196.188.120.3:38443/.../toTradeWebPay', {...});
    //   return { status: 'processing', transactionReference: res.outTradeNo, redirectUrl: res.toPayUrl };
    throw new ApiError(501, 'TeleBirr live integration is not implemented yet');
  },

  async verify({ transactionReference }) {
    if (!this.isConfigured()) {
      throw new ApiError(501, 'TeleBirr is not configured');
    }
    // TODO (real integration): call TeleBirr's query-order API with
    // transactionReference and map its status to 'paid' | 'failed' | 'processing'.
    throw new ApiError(501, 'TeleBirr live integration is not implemented yet');
  },
};
