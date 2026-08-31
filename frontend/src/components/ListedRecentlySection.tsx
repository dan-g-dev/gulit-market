import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  MapPin, 
  ShieldCheck, 
  PlusCircle, 
  Eye 
} from 'lucide-react';
import { Currency, Language, Product } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ListedRecentlySectionProps {
  products: Product[];
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product, option?: string) => void;
  onQuickView: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onOpenSellModal: () => void;
}

export const ListedRecentlySection: React.FC<ListedRecentlySectionProps> = ({
  products,
  language,
  currency,
  onAddToCart,
  onQuickView,
  wishlist,
  onToggleWishlist,
  onOpenSellModal
}) => {
  const t = TRANSLATIONS[language];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Take recent or user listed products first, then latest
  const recentProducts = products.filter(p => p.isRecentListed || p.isUserListed || p.isFeatured).slice(0, 10);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatPrice = (priceETB: number, priceUSD: number) => {
    if (currency === 'ETB') {
      return `${priceETB.toLocaleString()} ብር`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'new':
        return { text: language === 'am' ? 'አዲስ' : 'Brand New', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'handcrafted':
        return { text: language === 'am' ? 'በእጅ የተሰራ' : 'Handcrafted', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'vintage':
        return { text: language === 'am' ? 'ቪንቴጅ' : 'Vintage', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'like_new':
        return { text: language === 'am' ? 'እንደ አዲስ' : 'Like New', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { text: language === 'am' ? 'ኦሪጅናል' : 'Authentic', color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {language === 'am' ? 'አዲስ የተጨመሩ እቃዎች' : 'Listed recently'}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {language === 'am' ? 'ትኩስ እቃዎች' : 'Live Feed'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {language === 'am'
              ? 'በአዲስ አበባ እና በኢትዮጵያ ሻጮች የቀረቡ አዳዲስ እቃዎች'
              : 'Fresh discoveries uploaded by trusted sellers across Addis Ababa'}
          </p>
        </div>

        {/* Carousel Arrow Controls & Sell Callout */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSellModal}
            className="hidden sm:flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-300 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'am' ? 'እቃ ይሽጡ' : 'Sell an Item'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-xs flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous items"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-xs flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next items"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
      >
        {recentProducts.map((product) => {
          const isWish = wishlist.some(p => p.id === product.id);
          const badge = getConditionBadge(product.condition);

          return (
            <div
              key={product.id}
              className="group min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px] bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col shrink-0"
            >
              {/* Photo Box */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={language === 'am' ? product.nameAm : product.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Condition Tag */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${badge.color}`}>
                    {badge.text}
                  </span>
                  {product.sizeBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                      {product.sizeBadge}
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product);
                  }}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md shadow-xs transition-transform active:scale-90 cursor-pointer ${
                    isWish 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-current' : ''}`} />
                </button>

                {/* Quick View Hover Button */}
                <div className="absolute inset-x-0 bottom-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 justify-center">
                  <button
                    onClick={() => onQuickView(product)}
                    className="flex-1 bg-stone-900/90 hover:bg-stone-950 text-white text-[11px] font-semibold py-1.5 rounded-xl backdrop-blur-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'እይ' : 'Quick View'}</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                
                {/* Seller & Location */}
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1 truncate">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center justify-center shrink-0">
                      {(product.sellerName || product.artisanName || 'G')[0]}
                    </span>
                    <span className="truncate font-medium text-stone-700">
                      {language === 'am' ? (product.sellerNameAm || product.artisanNameAm || product.sellerName) : (product.sellerName || product.artisanName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-stone-400 shrink-0">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span className="truncate max-w-[90px]">
                      {(product.sellerLocation || product.originRegion).split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 
                    onClick={() => onQuickView(product)}
                    className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {language === 'am' ? product.nameAm : product.nameEn}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {language === 'am' ? product.subtitleAm : product.subtitleEn}
                  </p>
                </div>

                {/* Price & Cart */}
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-100">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm sm:text-base text-stone-900">
                      {formatPrice(product.priceETB, product.priceUSD)}
                    </span>
                    {product.originalPriceETB && (
                      <span className="text-[10px] text-stone-400 line-through">
                        {formatPrice(product.originalPriceETB, product.originalPriceUSD || 0)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                    aria-label="Add to cart"
                    title={language === 'am' ? 'ወደ ዘንቢል ጨምር' : 'Add to cart'}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
