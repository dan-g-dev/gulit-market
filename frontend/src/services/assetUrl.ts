// services/assetUrl.ts
// ------------------------------------------------------------
// Listing image paths from the backend are relative, e.g.
// "/placeholder-images/x.jpg". Locally this resolves fine against
// the backend's own dev server, but in production the frontend
// (Vercel) and backend (Render) are different origins — a
// relative path would resolve against the FRONTEND's domain,
// where no such file exists, causing broken images.
//
// This resolves any "/placeholder-images/..." (or other relative)
// path to the backend's real origin, derived from VITE_API_URL.
// Already-absolute URLs (http/https) are returned unchanged.
// ------------------------------------------------------------

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

// Turn "https://gulit-market-api.onrender.com/api" into "https://gulit-market-api.onrender.com"
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function assetUrl(path: string | undefined | null): string {
  if (!path) return path ?? '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_ORIGIN}${path}`;
}
