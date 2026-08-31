// Thin fetch client for the Gulit Market backend (see /backend).
// Reads the API base URL from VITE_API_URL, defaulting to localhost:4000
// for local development.

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'gulit_market_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiRequestError(res.status, data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ---- Auth ------------------------------------------------------------
export interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'seller' | 'admin';
  avatarUrl?: string;
  createdAt: string;
}

export const authApi = {
  register: (body: { fullName: string; email: string; password: string; phone?: string; role?: 'customer' | 'seller' }) =>
    request<{ user: ApiUser; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ user: ApiUser; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: ApiUser }>('/auth/me'),
};

// ---- Categories / Locations -------------------------------------------
export const catalogApi = {
  categories: () => request<{ categories: any[] }>('/categories'),
  locations: () => request<{ locations: any[] }>('/locations'),
};

// ---- Listings -----------------------------------------------------------
export interface ListingQuery {
  q?: string;
  category?: number | string;
  location?: number | string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

function toQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const listingsApi = {
  list: (query: ListingQuery = {}) => request<{ listings: any[]; pagination: any }>(`/listings${toQueryString(query)}`),
  get: (id: number | string) => request<{ listing: any }>(`/listings/${id}`),
  create: (body: any) => request<{ listing: any }>('/listings', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number | string, body: any) => request<{ listing: any }>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number | string) => request<void>(`/listings/${id}`, { method: 'DELETE' }),
  reviews: (id: number | string) => request<{ reviews: any[] }>(`/listings/${id}/reviews`),
  addReview: (id: number | string, body: { orderId: number; rating: number; comment?: string }) =>
    request<{ created: boolean }>(`/listings/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

// ---- Cart -----------------------------------------------------------------
export const cartApi = {
  get: () => request<{ items: any[] }>('/cart'),
  add: (listingId: number, quantity = 1) =>
    request<{ items: any[] }>('/cart/items', { method: 'POST', body: JSON.stringify({ listingId, quantity }) }),
  update: (cartItemId: number, quantity: number) =>
    request<{ items: any[] }>(`/cart/items/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (cartItemId: number) => request<{ items: any[] }>(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clear: () => request<{ items: any[] }>('/cart', { method: 'DELETE' }),
};

// ---- Wishlist ---------------------------------------------------------
export const wishlistApi = {
  get: () => request<{ listings: any[] }>('/wishlist'),
  add: (listingId: number) => request<{ added: boolean }>('/wishlist', { method: 'POST', body: JSON.stringify({ listingId }) }),
  remove: (listingId: number) => request<void>(`/wishlist/${listingId}`, { method: 'DELETE' }),
};

// ---- Orders -------------------------------------------------------------
export interface CreateOrderBody {
  delivery: {
    fullName: string;
    phone: string;
    region: string;
    city: string;
    subcity?: string;
    woreda?: string;
    address?: string;
    instructions?: string;
  };
  paymentProvider: 'cash_on_delivery' | 'telebirr';
}

export const ordersApi = {
  create: (body: CreateOrderBody) => request<{ order: any; payment: any }>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  listMine: () => request<{ orders: any[] }>('/orders'),
  get: (id: number | string) => request<{ order: any }>(`/orders/${id}`),
  updateStatus: (id: number | string, status: string) =>
    request<{ order: any }>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ---- Offers ---------------------------------------------------------------
export const offersApi = {
  create: (body: { listingId: number; amountETB: number; message?: string }) =>
    request<{ offer: any }>('/offers', { method: 'POST', body: JSON.stringify(body) }),
  listMine: () => request<{ offers: any[] }>('/offers'),
  respond: (id: number, body: { status: 'accepted' | 'rejected' | 'countered'; counterAmountETB?: number }) =>
    request<{ offer: any }>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ---- Sellers ----------------------------------------------------------
export const sellersApi = {
  getProfile: (id: number | string) => request<{ seller: any; listings: any[] }>(`/sellers/${id}`),
  getMyProfile: () => request<{ seller: any }>('/sellers/me'),
  updateMyProfile: (body: any) => request<{ seller: any }>('/sellers/me', { method: 'PUT', body: JSON.stringify(body) }),
  myListings: () => request<{ listings: any[] }>('/sellers/me/listings'),
  myOrders: () => request<{ orders: any[] }>('/sellers/me/orders'),
};

// ---- Payments -----------------------------------------------------------
export const paymentsApi = {
  providers: () => request<{ providers: { id: string; name: string; configured: boolean }[] }>('/payments/providers'),
  verify: (orderId: number | string) => request<{ status: string }>(`/payments/${orderId}/verify`, { method: 'POST' }),
};

// ---- Admin ------------------------------------------------------------
export const adminApi = {
  reports: () => request<any>('/admin/reports'),
  users: () => request<{ users: any[] }>('/admin/users'),
  updateUser: (id: number, body: { isActive?: boolean; role?: string }) =>
    request<{ updated: boolean }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  listings: () => request<{ listings: any[] }>('/admin/listings'),
  moderateListing: (id: number, body: { status?: string; isFeatured?: boolean }) =>
    request<{ updated: boolean }>(`/admin/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  orders: () => request<{ orders: any[] }>('/admin/orders'),
  createCategory: (body: any) => request<{ id: number }>('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  deleteCategory: (id: number) => request<void>(`/admin/categories/${id}`, { method: 'DELETE' }),
};

export { ApiRequestError as ApiError };
