import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Coffee, 
  Scissors, 
  Flame, 
  Check, 
  Search, 
  X,
  Heart,
  ShoppingBag,
  ArrowUpDown,
  RotateCcw,
  PlusCircle,
  MapPin,
  User,
  LogOut,
  Store,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { 
  CartItem, 
  Currency, 
  Language, 
  Order, 
  Product, 
  ProductCategory 
} from './types';
import { ETHIOPIAN_PRODUCTS } from './data/products';
import { TRANSLATIONS } from './data/translations';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ListedRecentlySection } from './components/ListedRecentlySection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CeremonyKitBuilderModal } from './components/CeremonyKitBuilderModal';
import { CustomKemisModal } from './components/CustomKemisModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { WishlistModal } from './components/WishlistModal';
import { ArtisanShowcase } from './components/ArtisanShowcase';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { listingsApi, cartApi, wishlistApi, ordersApi, ApiError } from './services/api';
import { listingToProduct, apiOrderToOrder, ApiListing } from './services/adapters';

export default function App() {
  // Auth & dashboard view
  const { user, loading: authLoading, logout } = useAuth();
  const [view, setView] = useState<'market' | 'seller' | 'admin'>('market');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App Global State
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('ETB');

  // Product Catalog State — fetched from the backend API. ETHIOPIAN_PRODUCTS
  // is kept only as a last-resort fallback if the API is unreachable.
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  // Keeps the raw backend listing (with its numeric id) alongside each
  // Product so cart/wishlist/offer calls can send the right id to the API.
  const [listingById, setListingById] = useState<Record<string, ApiListing>>({});

  const loadListings = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await listingsApi.list({ limit: 100 });
      const mapped = res.listings.map((l: ApiListing) => listingToProduct(l));
      setProducts(mapped);
      setListingById(Object.fromEntries(res.listings.map((l: ApiListing) => [String(l.id), l])));
    } catch (err) {
      // Fall back to the static catalog so the storefront still renders
      // something if the backend is unreachable, but surface the error.
      setProducts(ETHIOPIAN_PRODUCTS);
      setProductsError(
        err instanceof ApiError ? err.message : 'Could not reach the Gulit Market API — showing sample data.'
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular');
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterFairTrade, setFilterFairTrade] = useState(false);

  // Cart & Wishlist State — synced with the backend for logged-in users.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const refreshCart = useCallback(async () => {
    if (!user) { setCartItems([]); return; }
    try {
      const res = await cartApi.get();
      setCartItems(
        res.items
          .filter((it: any) => it.listing)
          .map((it: any) => ({
            cartItemId: String(it.cartItemId),
            product: listingToProduct(it.listing),
            quantity: it.quantity,
          }))
      );
    } catch {
      // leave cart as-is on transient failure
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const res = await wishlistApi.get();
      setWishlist(res.listings.map((l: ApiListing) => listingToProduct(l)));
    } catch {
      // leave wishlist as-is on transient failure
    }
  }, [user]);

  useEffect(() => { refreshCart(); }, [refreshCart]);
  useEffect(() => { refreshWishlist(); }, [refreshWishlist]);

  // Modals Active State
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCeremonyBuilderOpen, setIsCeremonyBuilderOpen] = useState(false);
  const [isCustomKemisOpen, setIsCustomKemisOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

  const t = TRANSLATIONS[language];

  // Unique list of regions from products
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.originRegion) {
        set.add(p.originRegion.split(',')[0].trim());
      }
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'clothing' || selectedCategory === 'womenswear') {
          const isClothing = product.category === 'clothing' ||
                             product.category === 'womenswear' ||
                             product.category === 'menswear' ||
                             product.category === 'kidswear' ||
                             product.nameEn.toLowerCase().includes('kemis') ||
                             product.nameEn.toLowerCase().includes('dress') ||
                             product.nameEn.toLowerCase().includes('tibeb') ||
                             product.nameEn.toLowerCase().includes('suit') ||
                             product.nameEn.toLowerCase().includes('shirt') ||
                             product.nameAm.includes('ቀሚስ') ||
                             product.nameAm.includes('ጥበብ') ||
                             product.nameAm.includes('ሸሚዝ') ||
                             product.nameAm.includes('ልብስ');
          if (!isClothing) return false;
        } else if (selectedCategory === 'menswear') {
          const isMen = product.category === 'menswear' ||
                        (product.category === 'clothing' && (product.genderCategory === 'men' || product.genderCategory === 'unisex')) ||
                        product.category === 'shoes' ||
                        product.nameEn.toLowerCase().includes('men') ||
                        product.nameEn.toLowerCase().includes('jacket') ||
                        product.nameEn.toLowerCase().includes('trouser') ||
                        product.nameAm.includes('ወንዶች');
          if (!isMen) return false;
        } else if (selectedCategory === 'kidswear') {
          const isKids = product.category === 'kidswear' ||
                         product.genderCategory === 'kids' ||
                         product.nameEn.toLowerCase().includes('kid') ||
                         product.nameEn.toLowerCase().includes('child') ||
                         product.nameAm.includes('ልጆች');
          if (!isKids) return false;
        } else if (selectedCategory === 'coffee') {
          const isCoffee = product.category === 'coffee' ||
                           product.category === 'pottery' ||
                           product.nameEn.toLowerCase().includes('coffee') ||
                           product.nameEn.toLowerCase().includes('jebena') ||
                           product.nameEn.toLowerCase().includes('rekebot') ||
                           product.nameEn.toLowerCase().includes('yirgacheffe') ||
                           product.nameAm.includes('ቡና') ||
                           product.nameAm.includes('ጀበና') ||
                           product.nameAm.includes('ረከቦት');
          if (!isCoffee) return false;
        } else if (selectedCategory === 'spices') {
          const isSpice = product.category === 'spices' ||
                          product.nameEn.toLowerCase().includes('spice') ||
                          product.nameEn.toLowerCase().includes('berbere') ||
                          product.nameEn.toLowerCase().includes('teff') ||
                          product.nameEn.toLowerCase().includes('korerima') ||
                          product.nameAm.includes('ቅመም') ||
                          product.nameAm.includes('ጤፍ') ||
                          product.nameAm.includes('በርበሬ');
          if (!isSpice) return false;
        } else if (selectedCategory === 'crafts' || selectedCategory === 'homeware' || selectedCategory === 'pottery') {
          const isCraft = product.category === 'crafts' ||
                          product.category === 'homeware' ||
                          product.category === 'pottery' ||
                          product.nameEn.toLowerCase().includes('leather') ||
                          product.nameEn.toLowerCase().includes('bag') ||
                          product.nameEn.toLowerCase().includes('table') ||
                          product.nameEn.toLowerCase().includes('jebena') ||
                          product.nameEn.toLowerCase().includes('rekebot') ||
                          product.nameEn.toLowerCase().includes('clay') ||
                          product.nameAm.includes('ቆዳ') ||
                          product.nameAm.includes('ቦርሳ') ||
                          product.nameAm.includes('ጠረጴዛ') ||
                          product.nameAm.includes('ሸክላ');
          if (!isCraft) return false;
        } else if (selectedCategory === 'shoes') {
          const isShoe = product.category === 'shoes' ||
                         product.nameEn.toLowerCase().includes('boot') ||
                         product.nameEn.toLowerCase().includes('shoe') ||
                         product.nameAm.includes('ጫማ');
          if (!isShoe) return false;
        } else if (selectedCategory === 'beauty') {
          const isBeauty = product.category === 'beauty' ||
                           product.nameEn.toLowerCase().includes('oil') ||
                           product.nameEn.toLowerCase().includes('elixir') ||
                           product.nameEn.toLowerCase().includes('hair') ||
                           product.nameEn.toLowerCase().includes('skin') ||
                           product.nameEn.toLowerCase().includes('azmud') ||
                           product.nameAm.includes('ዘይት') ||
                           product.nameAm.includes('ውበት') ||
                           product.nameAm.includes('አዝሙድ');
          if (!isBeauty) return false;
        } else if (selectedCategory === 'phones' || selectedCategory === 'electronics') {
          const isPhone = product.category === 'phones' ||
                          product.category === 'electronics' ||
                          product.nameEn.toLowerCase().includes('phone') ||
                          product.nameEn.toLowerCase().includes('iphone') ||
                          product.nameEn.toLowerCase().includes('samsung') ||
                          product.nameEn.toLowerCase().includes('galaxy') ||
                          product.nameAm.includes('ስልክ') ||
                          product.nameAm.includes('አይፎን') ||
                          product.nameAm.includes('ሳምሰንግ');
          if (!isPhone) return false;
        } else if (selectedCategory === 'vehicles') {
          const isVehicle = product.category === 'vehicles' ||
                            product.nameEn.toLowerCase().includes('toyota') ||
                            product.nameEn.toLowerCase().includes('suzuki') ||
                            product.nameEn.toLowerCase().includes('corolla') ||
                            product.nameEn.toLowerCase().includes('car') ||
                            product.nameAm.includes('መኪና') ||
                            product.nameAm.includes('ቶዮታ') ||
                            product.nameAm.includes('ሱዙኪ');
          if (!isVehicle) return false;
        } else if (selectedCategory === 'property') {
          const isProp = product.category === 'property' ||
                         product.nameEn.toLowerCase().includes('apartment') ||
                         product.nameEn.toLowerCase().includes('real estate') ||
                         product.nameEn.toLowerCase().includes('house') ||
                         product.nameAm.includes('አፓርትመንት') ||
                         product.nameAm.includes('ቤት') ||
                         product.nameAm.includes('ሪል');
          if (!isProp) return false;
        } else if (selectedCategory === 'hobbies') {
          const isHobby = product.category === 'hobbies' ||
                          product.category === 'art' ||
                          product.category === 'vintage';
          if (!isHobby) return false;
        } else if (product.category !== selectedCategory) {
          return false;
        }
      }

      // Region filter
      if (selectedRegion !== 'all' && product.originRegion && !product.originRegion.includes(selectedRegion)) {
        return false;
      }

      // Organic filter
      if (filterOrganic && !product.isOrganic) {
        return false;
      }

      // Fair Trade filter
      if (filterFairTrade && !product.isFairTrade) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        const matchesEn = product.nameEn.toLowerCase().includes(queryLower) ||
                          product.descriptionEn.toLowerCase().includes(queryLower) ||
                          (product.subtitleEn && product.subtitleEn.toLowerCase().includes(queryLower)) ||
                          (product.category && product.category.toLowerCase().includes(queryLower)) ||
                          (product.sellerName && product.sellerName.toLowerCase().includes(queryLower)) ||
                          (product.originRegion && product.originRegion.toLowerCase().includes(queryLower)) ||
                          (product.sellerLocation && product.sellerLocation.toLowerCase().includes(queryLower)) ||
                          (product.featuresEn && product.featuresEn.some(f => f.toLowerCase().includes(queryLower)));
        const matchesAm = product.nameAm.toLowerCase().includes(queryLower) ||
                          product.descriptionAm.toLowerCase().includes(queryLower) ||
                          (product.subtitleAm && product.subtitleAm.toLowerCase().includes(queryLower)) ||
                          (product.sellerNameAm && product.sellerNameAm.toLowerCase().includes(queryLower)) ||
                          (product.featuresAm && product.featuresAm.some(f => f.toLowerCase().includes(queryLower)));
        if (!matchesEn && !matchesAm) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price_low') {
        return a.priceETB - b.priceETB;
      }
      if (sortBy === 'price_high') {
        return b.priceETB - a.priceETB;
      }
      // default (popular/curated): user-listed items first, then curated list order (local items first)
      if (a.isUserListed && !b.isUserListed) return -1;
      if (!a.isUserListed && b.isUserListed) return 1;
      return 0;
    });
  }, [products, selectedCategory, selectedRegion, filterOrganic, filterFairTrade, searchQuery, sortBy]);

  // Cart Management Handlers — persisted via the backend for logged-in users.
  // Custom notes / selected options (ceremony kit builder, custom tailoring)
  // aren't modeled on the backend cart yet, so those flows still add the
  // base listing to the real cart and keep the note client-side for display.
  const handleAddToCart = async (product: Product, quantity: number = 1, selectedOption?: string, customNote?: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    try {
      await cartApi.add(Number(product.id), quantity);
      await refreshCart();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not add this item to your cart.');
    }
  };

  const handleUpdateCartQuantity = async (cartItemId: string, delta: number) => {
    const item = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    try {
      if (newQty <= 0) {
        await cartApi.remove(Number(cartItemId));
      } else {
        await cartApi.update(Number(cartItemId), newQty);
      }
      await refreshCart();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not update your cart.');
    }
  };

  const handleRemoveCartItem = async (cartItemId: string) => {
    try {
      await cartApi.remove(Number(cartItemId));
      await refreshCart();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not remove this item.');
    }
  };

  // Wishlist Handlers — persisted via the backend for logged-in users.
  const handleToggleWishlist = async (product: Product) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const exists = wishlist.some((p) => p.id === product.id);
    try {
      if (exists) {
        await wishlistApi.remove(Number(product.id));
      } else {
        await wishlistApi.add(Number(product.id));
      }
      await refreshWishlist();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not update your wishlist.');
    }
  };

  // Real checkout — calls POST /api/orders. Throws (with a human-readable
  // message) on failure, e.g. TeleBirr not yet configured on the backend.
  const handlePlaceOrder = async (input: {
    fullName: string; phone: string; email: string;
    destinationType: 'ethiopia' | 'diaspora'; city: string; subCity: string;
    landmark: string; country: string; postalCode: string; paymentMethod: string;
  }): Promise<Order> => {
    const region = input.city.split('(')[0].trim();
    const subcity = input.subCity ? input.subCity.split('(')[0].trim() : undefined;
    const paymentProvider = input.paymentMethod === 'cod' ? 'cash_on_delivery' : 'telebirr';

    const res = await ordersApi.create({
      delivery: {
        fullName: input.fullName,
        phone: input.phone,
        region: input.destinationType === 'ethiopia' ? region : input.country,
        city: region,
        subcity,
        address: input.landmark,
      },
      paymentProvider: paymentProvider as 'cash_on_delivery' | 'telebirr',
    });

    const order = apiOrderToOrder(res.order, cartItems);
    await refreshCart();
    return order;
  };

  // Quick View Modal Trigger
  const handleQuickView = (product: Product) => {
    setSelectedProductForDetail(product);
    setIsDetailModalOpen(true);
  };

  // Direct Buy Now Trigger
  const handleInstantBuy = (product: Product, quantity: number, selectedOption?: string) => {
    handleAddToCart(product, quantity, selectedOption);
    setIsDetailModalOpen(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Ceremony Kit Added Handler
  const handleAddCeremonyKit = (productsToAdd: { product: Product; quantity: number }[]) => {
    productsToAdd.forEach(item => {
      handleAddToCart(item.product, item.quantity);
    });
    setIsCeremonyBuilderOpen(false);
    setIsCartOpen(true);
  };

  // Custom Kemis Added Handler
  const handleAddCustomKemis = (customKemisProduct: Product, measurements: string) => {
    handleAddToCart(customKemisProduct, 1, 'Custom Bespoke Fit', `Tailor Measurements: ${measurements}`);
    setIsCustomKemisOpen(false);
    setIsCartOpen(true);
  };

  // "Sell an item" entry point — routes into the real seller dashboard
  // instead of a local-only fake listing, since listings now live on the
  // backend and require a seller account.
  const handleOpenSell = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (user.role !== 'seller' && user.role !== 'admin') {
      alert(
        language === 'am'
          ? 'ዕቃ ለመሸጥ የሻጭ መለያ ያስፈልጋል። እባክዎ በአዲስ የሻጭ መለያ ይመዝገቡ።'
          : 'Selling requires a seller account. Please sign up with a new seller account to list items.'
      );
      return;
    }
    setView('seller');
  };

  const handleOrderPlaced = (order: Order) => {
    setRecentOrders([order, ...recentOrders]);
    setCartItems([]); // clear cart
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Full-page seller / admin dashboards, swapped in place of the marketplace.
  if (view === 'seller') {
    return <SellerDashboard language={language} onClose={() => setView('market')} />;
  }
  if (view === 'admin') {
    return <AdminDashboard language={language} onClose={() => setView('market')} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-stone-900 flex flex-col font-sans">

      {/* Account bar — sign in/out and role-aware dashboard links */}
      <div className="bg-stone-950 text-stone-300 text-xs">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-9 flex items-center justify-end gap-4">
          {authLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : user ? (
            <>
              <span className="hidden sm:inline text-stone-400">
                {language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome'}, <strong className="text-white">{user.fullName}</strong>
              </span>
              {(user.role === 'seller' || user.role === 'admin') && (
                <button onClick={() => setView('seller')} className="flex items-center gap-1 hover:text-white cursor-pointer font-semibold">
                  <Store className="w-3.5 h-3.5" />
                  {language === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
                </button>
              )}
              {user.role === 'admin' && (
                <button onClick={() => setView('admin')} className="flex items-center gap-1 hover:text-white cursor-pointer font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {language === 'am' ? 'የአስተዳዳሪ ዳሽቦርድ' : 'Admin Dashboard'}
                </button>
              )}
              <button onClick={logout} className="flex items-center gap-1 hover:text-white cursor-pointer font-semibold">
                <LogOut className="w-3.5 h-3.5" />
                {language === 'am' ? 'ውጣ' : 'Sign Out'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1 hover:text-white cursor-pointer font-semibold">
              <User className="w-3.5 h-3.5" />
              {language === 'am' ? 'ግባ / ይመዝገቡ' : 'Sign In / Register'}
            </button>
          )}
        </div>
      </div>

      {/* API connectivity notice — only shown if the backend was unreachable */}
      {productsError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-2 px-4">
          {productsError}
        </div>
      )}

      {/* 1. Global Navigation Bar */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCeremonyBuilder={() => setIsCeremonyBuilderOpen(true)}
        onOpenCustomKemis={() => setIsCustomKemisOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onOpenSellModal={handleOpenSell}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 2. Panoramic Ethiopian Market Hero Banner matching reference design */}
      <HeroBanner
        language={language}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const catalogEl = document.getElementById('catalog-section');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedRegion={selectedRegion}
        onSelectRegion={(reg) => {
          setSelectedRegion(reg);
          const catalogEl = document.getElementById('catalog-section');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCeremonyBuilder={() => setIsCeremonyBuilderOpen(true)}
        onOpenCustomKemis={() => setIsCustomKemisOpen(true)}
        onOpenSellModal={handleOpenSell}
      />

      {/* 3. Main Marketplace Catalog Section */}
      <main id="catalog-section" className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex-1 space-y-6">
        
        {/* Sleek, Uncluttered Filter & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          
          {/* Left: Quick View Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => { setSortBy('popular'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'popular'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {language === 'am' ? 'ሁሉንም እቃዎች' : 'All Items'}
            </button>

            <button
              onClick={() => {
                setSortBy('popular');
                // Trigger quick filter
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                products.some(p => p.isRecentListed) && sortBy === 'popular'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              🔥 {language === 'am' ? 'አዲስ የተጨመሩ' : 'Recently Listed'}
            </button>

            <button
              onClick={() => setSortBy('rating')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'rating'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              ⭐ {language === 'am' ? 'ከፍተኛ ደረጃ' : 'Top Rated'}
            </button>

            {(selectedCategory !== 'all' || selectedRegion !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'am' ? 'አጽዳ' : 'Reset'}</span>
              </button>
            )}
          </div>

          {/* Right: Location & Price Sort */}
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Region / Location Selector */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-stone-700 font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="all">{language === 'am' ? 'ሁሉም አካባቢዎች' : 'All Locations'}</option>
                {availableRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-stone-700 font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="popular">{language === 'am' ? 'ተወዳጅ' : 'Popular'}</option>
                <option value="price_low">{language === 'am' ? 'ዋጋ፡ ዝቅተኛ' : 'Price: Low'}</option>
                <option value="price_high">{language === 'am' ? 'ዋጋ፡ ከፍተኛ' : 'Price: High'}</option>
              </select>
            </div>

          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">
                {language === 'am' ? 'ምንም የሚዛመድ እቃ አልተገኘም' : 'No matching items found on Gulit Market'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                {language === 'am'
                  ? 'እባክዎ የፍለጋ ቃሉን ወይም ማጣሪያዎችን አስተካክለው ይሞክሩ።'
                  : 'Try adjusting your search query or resetting category and location filters.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRegion('all');
                setSearchQuery('');
                setFilterOrganic(false);
                setFilterFairTrade(false);
              }}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              {language === 'am' ? 'ሁሉንም እቃዎች አሳይ' : 'Show All Items'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                language={language}
                onAddToCart={(prod, option) => handleAddToCart(prod, 1, option)}
                onQuickView={handleQuickView}
                isWishlisted={wishlist.some(p => p.id === product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}

      </main>

      {/* 5. Cultural Provenance & Artisan Showcase */}
      <ArtisanShowcase
        language={language}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const catalogEl = document.getElementById('catalog-section');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 6. Cultural Footer with Telebirr / CBE Badges and FAQ */}
      <Footer language={language} />

      {/* MODALS */}
      {/* 1. Product Detail Full Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currency={currency}
        language={language}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProductForDetail ? wishlist.some(p => p.id === selectedProductForDetail.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onInstantBuy={handleInstantBuy}
      />

      {/* 2. Coffee Ceremony Kit Builder Modal */}
      <CeremonyKitBuilderModal
        isOpen={isCeremonyBuilderOpen}
        onClose={() => setIsCeremonyBuilderOpen(false)}
        currency={currency}
        language={language}
        onAddKitToCart={handleAddCeremonyKit}
      />

      {/* 3. Custom Habesha Kemis Tailoring Modal */}
      <CustomKemisModal
        isOpen={isCustomKemisOpen}
        onClose={() => setIsCustomKemisOpen(false)}
        currency={currency}
        language={language}
        onAddCustomKemis={handleAddCustomKemis}
      />

      {/* 4. Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(discountPercent) => {
          setAppliedDiscountPercent(discountPercent);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 5. Multi-Step Checkout Modal with Telebirr / Cash on Delivery */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        language={language}
        appliedDiscountPercent={appliedDiscountPercent}
        onOrderPlaced={handleOrderPlaced}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* 6. Order Live Tracker Modal */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        language={language}
        recentOrders={recentOrders}
      />

      {/* 7. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        currency={currency}
        language={language}
        onAddToCart={(prod) => {
          handleAddToCart(prod, 1);
          setIsWishlistOpen(false);
          setIsCartOpen(true);
        }}
        onRemoveFromWishlist={handleToggleWishlist}
      />

      {/* 8. Sign In / Create Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />

    </div>
  );
}
