import React from 'react';
import { 
  Star, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Check, 
  Eye, 
  Sparkles,
  Award,
  Tag
} from 'lucide-react';
import { Currency, Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  language: Language;
  onAddToCart: (product: Product, selectedOption?: string) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  language,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist
}) => {
  const [isAdded, setIsAdded] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'new':
        return { text: language === 'am' ? 'አዲስ' : 'New', color: 'bg-emerald-600 text-white' };
      case 'handcrafted':
        return { text: language === 'am' ? 'በእጅ የተሰራ' : 'Handcrafted', color: 'bg-amber-700 text-white' };
      case 'vintage':
        return { text: language === 'am' ? 'ቪንቴጅ' : 'Vintage', color: 'bg-purple-700 text-white' };
      case 'like_new':
        return { text: language === 'am' ? 'እንደ አዲስ' : 'Like New', color: 'bg-blue-600 text-white' };
      default:
        return null;
    }
  };

  const conditionBadge = getConditionBadge(product.condition);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div 
        className="relative aspect-[4/3] sm:aspect-square bg-stone-100 overflow-hidden"
        onMouseEnter={() => {
          if (product.images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={language === 'am' ? product.nameAm : product.nameEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Left Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {conditionBadge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${conditionBadge.color}`}>
              {conditionBadge.text}
            </span>
          )}
          {product.sizeBadge && (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {product.sizeBadge}
            </span>
          )}
          {product.isBestSeller && !conditionBadge && (
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{language === 'am' ? 'ተመራጭ' : 'Best Seller'}</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick View Floating Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="bg-stone-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'ዝርዝር እይ' : 'Quick View'}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Location / Seller Tag */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">
                {language === 'am' ? (product.sellerLocationAm || product.originRegionAm) : (product.sellerLocation || product.originRegion)}
              </span>
            </div>
            {product.sellerName && (
              <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 truncate max-w-[80px]">
                {product.sellerName}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
            {language === 'am' ? product.nameAm : product.nameEn}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
            {language === 'am' ? product.subtitleAm : product.subtitleEn}
          </p>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-stone-800 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] text-stone-400">
              ({product.reviewCount} {language === 'am' ? 'አስተያየቶች' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Pricing & Add Button Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-stone-950 font-serif-ethiopia">
                {formatPrice(product.priceETB, product.priceUSD, currency, language)}
              </span>
              {product.originalPriceETB && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPriceETB, product.originalPriceUSD || 0, currency, language)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAdd}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-amber-800 text-white shadow-xs hover:scale-105 active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'am' ? 'ተጨምሯል' : 'Added'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'am' ? 'ጨምር' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
