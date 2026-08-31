// Thin provider-abstraction layer described in the payments architecture:
//   PaymentService -> provider -> initiate -> provider response -> verify -> status
import { cashOnDeliveryProvider } from './payments/cashOnDeliveryProvider.js';
import { telebirrProvider } from './payments/telebirrProvider.js';
import { ApiError } from '../utils/ApiError.js';

const providers = {
  cash_on_delivery: cashOnDeliveryProvider,
  telebirr: telebirrProvider,
};

export function listProviders() {
  return Object.values(providers).map((p) => ({
    id: p.name,
    name: p.name,
    configured: p.isConfigured(),
  }));
}

export function getProvider(id) {
  const provider = providers[id];
  if (!provider) throw new ApiError(400, `Unknown payment provider: ${id}`);
  return provider;
}
