export type Language = 'en' | 'am';
export type Currency = 'ETB' | 'USD';

export type ProductCategory = 
  | 'all'
  | 'womenswear'
  | 'menswear'
  | 'kidswear'
  | 'beauty'
  | 'hobbies'
  | 'homeware'
  | 'clothing'
  | 'coffee'
  | 'shoes'
  | 'spices'
  | 'pottery'
  | 'crafts'
  | 'art'
  | 'vintage'
  | 'electronics'
  | 'vehicles'
  | 'phones'
  | 'property'
  | 'services';

export type ItemCondition = 'new' | 'handcrafted' | 'like_new' | 'good' | 'vintage';

export interface Product {
  id: string;
  nameEn: string;
  nameAm: string;
  subtitleEn: string;
  subtitleAm: string;
  category: ProductCategory;
  priceETB: number;
  priceUSD: number;
  originalPriceETB?: number;
  originalPriceUSD?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isBestSeller?: boolean;
  isOrganic?: boolean;
  isFairTrade?: boolean;
  isFeatured?: boolean;
  isRecentListed?: boolean;
  isUserListed?: boolean;
  condition?: ItemCondition;
  sellerName?: string;
  sellerNameAm?: string;
  sellerLocation?: string;
  sellerLocationAm?: string;
  sellerAvatar?: string;
  sizeBadge?: string;
  genderCategory?: 'women' | 'men' | 'kids' | 'unisex';
  originRegion: string;
  originRegionAm: string;
  artisanName: string;
  artisanNameAm: string;
  descriptionEn: string;
  descriptionAm: string;
  featuresEn: string[];
  featuresAm: string[];
  images: string[];
  options?: {
    type: 'weight' | 'size' | 'grind' | 'style';
    labelEn: string;
    labelAm: string;
    choices: {
      nameEn: string;
      nameAm: string;
      priceModifierETB?: number;
      priceModifierUSD?: number;
    }[];
  };
  tastingNotes?: string[];
  roastLevel?: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';
  fabricMaterial?: string;
  preparationEn?: string;
  preparationAm?: string;
  careInstructionsEn?: string;
  careInstructionsAm?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  commentEn: string;
  commentAm?: string;
  location: string;
  verified: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOption?: string;
  customNote?: string;
}

export type PaymentMethod = 'telebirr' | 'cbebirr' | 'chapa' | 'awash' | 'card' | 'cod';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  destinationType: 'ethiopia' | 'diaspora';
  city: string;
  subCityOrWoreda: string;
  specificHouseOrLandmark: string;
  country: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotalETB: number;
  subtotalUSD: number;
  shippingFeeETB: number;
  shippingFeeUSD: number;
  discountETB: number;
  discountUSD: number;
  totalETB: number;
  totalUSD: number;
  currency: Currency;
  deliveryAddress: DeliveryAddress;
  shippingMethod: 'gulit_express' | 'sheger_express' | 'ethiopian_post' | 'dhl_express';
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_verification' | 'cash_on_delivery';
  orderStatus: 'confirmed' | 'crafting' | 'shipped' | 'out_for_delivery' | 'delivered';
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface CeremonyKitSelection {
  jebena: Product | null;
  rekebot: Product | null;
  siniSet: Product | null;
  coffee: Product | null;
  incenseBurner: Product | null;
}

export interface NewListingFormData {
  title: string;
  titleAm?: string;
  category: ProductCategory;
  priceETB: number;
  condition: ItemCondition;
  size?: string;
  brandOrMaker?: string;
  sellerName: string;
  sellerPhone: string;
  sellerLocation: string;
  description: string;
  imagePreset: string;
  customImageFile?: string;
}
