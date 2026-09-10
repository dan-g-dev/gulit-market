// Maps backend API shapes (see backend/src/utils/serializeListing.js etc.)
// onto the frontend's existing Product / Order / Review types, so the rest
// of the UI (ProductCard, ProductDetailModal, CartDrawer, ...) doesn't need
// to change.
import { Product, ProductCategory, ItemCondition, Review, Order, CartItem } from '../types';
import { assetUrl } from './assetUrl';

// Backend prices are ETB-only; the frontend also displays USD, so we derive
// a display-only USD figure from a reference rate. This is NOT used for any
// real charge — all money handling happens in ETB against the backend.
export const ETB_PER_USD = 145;
export const toUSD = (etb: number) => Math.round((etb / ETB_PER_USD) * 100) / 100;

function mapCategorySlug(slug: string | undefined): ProductCategory {
  if (!slug) return 'crafts';
  if (slug.includes('habesha-kemis') || slug.includes('netela')) return 'womenswear';
  if (slug.includes('fashion-shoes') || slug === 'fashion-shoes') return 'shoes';
  if (slug.startsWith('fashion')) return 'clothing';
  if (slug.includes('coffee')) return 'coffee';
  if (slug.includes('spice')) return 'spices';
  if (slug.startsWith('phones')) return 'phones';
  if (slug === 'electronics') return 'electronics';
  if (slug.startsWith('vehicles')) return 'vehicles';
  if (slug === 'property') return 'property';
  if (slug === 'furniture' || slug === 'home-garden') return 'homeware';
  if (slug === 'beauty') return 'beauty';
  if (slug === 'services' || slug === 'jobs') return 'services';
  if (slug === 'sports' || slug === 'kids-baby' || slug === 'books' || slug === 'agriculture' || slug === 'construction') return 'hobbies';
  return 'crafts';
}

function mapCondition(condition: string | undefined): ItemCondition {
  switch (condition) {
    case 'new': return 'new';
    case 'like_new': return 'like_new';
    case 'good': return 'good';
    case 'fair': return 'good';
    case 'for_parts': return 'vintage';
    default: return 'good';
  }
}

// A backend listing as returned by GET /api/listings, /api/listings/:id, etc.
export interface ApiListing {
  id: number;
  title: string;
  titleAm?: string;
  description?: string;
  descriptionAm?: string;
  priceETB: number;
  condition: string;
  isNegotiable: boolean;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  images: string[];
  category: { id: number; name: string; slug: string };
  location: { id: number; name: string; nameAm?: string };
  seller: { id: number; fullName: string; storeName: string; storeNameAm?: string; verified: boolean; rating: number | null };
  createdAt: string;
  updatedAt: string;
}

export function listingToProduct(listing: ApiListing): Product {
  return {
    id: String(listing.id),
    nameEn: listing.title,
    nameAm: listing.titleAm || listing.title,
    subtitleEn: listing.category?.name || '',
    subtitleAm: listing.category?.name || '',
    category: mapCategorySlug(listing.category?.slug),
    priceETB: listing.priceETB,
    priceUSD: toUSD(listing.priceETB),
    rating: listing.seller?.rating ?? 4.5,
    reviewCount: 0,
    inStock: listing.status === 'active',
    isFeatured: listing.isFeatured,
    isUserListed: true,
    condition: mapCondition(listing.condition),
    sellerName: listing.seller?.storeName,
    sellerNameAm: listing.seller?.storeNameAm,
    sellerLocation: listing.location?.name,
    sellerLocationAm: listing.location?.nameAm,
    originRegion: listing.location?.name || '',
    originRegionAm: listing.location?.nameAm || '',
    artisanName: listing.seller?.storeName || listing.seller?.fullName || '',
    artisanNameAm: listing.seller?.storeNameAm || '',
    descriptionEn: listing.description || '',
    descriptionAm: listing.descriptionAm || listing.description || '',
    featuresEn: [],
    featuresAm: [],
    images: (listing.images?.length ? listing.images : ['/placeholder-images/gulit_market_placeholder.jpg']).map(assetUrl),
  };
}

export function apiReviewToReview(r: any): Review {
  return {
    id: String(r.id),
    author: r.reviewerName,
    date: r.createdAt,
    rating: r.rating,
    commentEn: r.comment || '',
    location: '',
    verified: true,
  };
}

// Maps a backend order (see orders.controller.js's serializeOrder) into the
// frontend's Order type. Some frontend-only display fields (trackingNumber,
// estimatedDelivery) don't exist in the backend schema, so they're derived
// here purely for display — they are not authoritative tracking data.
export function apiOrderToOrder(apiOrder: any, cartItemsSnapshot: CartItem[]): Order {
  const deliveryFeeETB = apiOrder.deliveryFeeETB ?? 0;
  return {
    id: String(apiOrder.id),
    orderNumber: apiOrder.orderNumber,
    date: new Date(apiOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    items: cartItemsSnapshot,
    subtotalETB: apiOrder.subtotalETB,
    subtotalUSD: toUSD(apiOrder.subtotalETB),
    shippingFeeETB: deliveryFeeETB,
    shippingFeeUSD: toUSD(deliveryFeeETB),
    discountETB: 0,
    discountUSD: 0,
    totalETB: apiOrder.totalETB,
    totalUSD: toUSD(apiOrder.totalETB),
    currency: 'ETB',
    deliveryAddress: {
      fullName: apiOrder.delivery.fullName,
      phone: apiOrder.delivery.phone,
      email: '',
      destinationType: 'ethiopia',
      city: apiOrder.delivery.city,
      subCityOrWoreda: apiOrder.delivery.subcity || '',
      specificHouseOrLandmark: apiOrder.delivery.address || '',
      country: 'Ethiopia',
    },
    shippingMethod: 'sheger_express',
    paymentMethod: apiOrder.paymentProvider === 'cash_on_delivery' ? 'cod' : 'telebirr',
    paymentStatus: apiOrder.paymentStatus === 'paid' ? 'paid' : apiOrder.paymentProvider === 'cash_on_delivery' ? 'cash_on_delivery' : 'pending_verification',
    orderStatus: apiOrder.status === 'confirmed' ? 'confirmed'
      : apiOrder.status === 'processing' ? 'crafting'
      : apiOrder.status === 'shipped' ? 'shipped'
      : apiOrder.status === 'delivered' ? 'delivered'
      : 'confirmed',
    trackingNumber: `GLT-${apiOrder.orderNumber.split('-').pop()}`,
    estimatedDelivery: '3-5 business days',
  };
}
