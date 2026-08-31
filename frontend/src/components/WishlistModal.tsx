import React from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import { Currency, Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  currency: Currency;
  language: Language;
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  currency,
  language,
  onAddToCart,
  onRemoveFromWishlist
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="wishlist-modal-container"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200"
      >
        <div className="tibeb-border-gradient h-1.5 w-full"></div>

        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <div>
              <h2 className="font-serif-ethiopia text-lg font-bold">
                {language === 'am' ? 'የተወደዱ ምርቶች' : 'Your Saved Wishlist'}
              </h2>
              <span className="text-xs text-stone-300">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <p className="font-bold text-stone-800 text-sm">
                {language === 'am' ? 'ምንም የተወደደ ምርት የለም' : 'No items saved yet'}
              </p>
              <p className="text-xs text-stone-500">
                {language === 'am'
                  ? 'የሚወዷቸውን ምርቶች በልብ ምልክት በመንካት እዚህ ማስቀመጥ ይችላሉ።'
                  : 'Click the heart icon on any product to save it for later.'}
              </p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3 justify-between"
              >
                <img
                  src={product.images[0]}
                  alt={product.nameEn}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-stone-900 truncate">
                    {language === 'am' ? product.nameAm : product.nameEn}
                  </p>
                  <p className="text-stone-500 text-[11px] truncate">
                    {product.originRegion}
                  </p>
                  <p className="font-bold text-amber-900 mt-1 font-serif-ethiopia text-sm">
                    {formatPrice(product.priceETB, product.priceUSD, currency, language)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="p-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">{language === 'am' ? 'ወደ ዘንቢል' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(product)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-stone-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
