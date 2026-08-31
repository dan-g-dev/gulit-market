import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { CartItem, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  language: Language;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscountPercent: number, couponCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Totals calculation
  let subtotalETB = 0;
  let subtotalUSD = 0;

  for (const item of items) {
    subtotalETB += item.product.priceETB * item.quantity;
    subtotalUSD += item.product.priceUSD * item.quantity;
  }

  const discountPercent = appliedCoupon?.percent || 0;
  const discountETB = Math.round(subtotalETB * (discountPercent / 100));
  const discountUSD = Number((subtotalUSD * (discountPercent / 100)).toFixed(2));

  const finalSubtotalETB = Math.max(0, subtotalETB - discountETB);
  const finalSubtotalUSD = Number(Math.max(0, subtotalUSD - discountUSD).toFixed(2));

  // Addis Free Delivery threshold: 1,500 ETB
  const freeShippingThresholdETB = 1500;
  const progressToFreeShipping = Math.min(100, Math.round((subtotalETB / freeShippingThresholdETB) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdETB - subtotalETB);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (code === 'HABESHA10') {
      setAppliedCoupon({ code, percent: 10 });
    } else if (code === 'TELEBIRR' || code === 'CBEBIRR') {
      setAppliedCoupon({ code, percent: 5 });
    } else if (code === 'ENKUTATASH') {
      setAppliedCoupon({ code, percent: 12 });
    } else {
      setCouponError(language === 'am' ? 'ልክ ያልሆነ የቅናሽ ኮድ ነው። (HABESHA10 ወይም TELEBIRR ይሞክሩ)' : 'Invalid promo code. Try HABESHA10 or TELEBIRR');
    }
  };

  const handleCheckout = () => {
    onProceedToCheckout(discountPercent, appliedCoupon?.code || '');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div 
        id="cart-drawer-container"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-stone-200"
      >
        {/* Top Header Strip with Ethiopian pattern */}
        <div>
          <div className="tibeb-border-gradient h-1.5 w-full"></div>
          
          <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="font-serif-ethiopia text-lg font-bold">
                  {language === 'am' ? 'የግዢ ዘንቢል' : 'Shopping Cart'}
                </h2>
                <span className="text-xs text-stone-300">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Addis Ababa Free Shipping Tracker */}
          <div className="p-3.5 bg-amber-50 border-b border-amber-200/60 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-amber-950 font-semibold">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-700" />
                    {language === 'am' ? 'ነፃ የአዲስ አበባ ማድረስ' : 'Addis Ababa Free Shipping'}:
                  </span>
                  <span>
                    {language === 'am'
                      ? `ተጨማሪ ${remainingForFreeShipping.toLocaleString()} ብር ይጨምሩ`
                      : `Add ${formatPrice(remainingForFreeShipping, remainingForFreeShipping / 100, currency, language)} more`}
                  </span>
                </div>
                <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressToFreeShipping}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'am'
                    ? 'እንኳን ደስ አለዎት! አዲስ አበባ ውስጥ ነፃ የማድረሻ እድል አግኝተዋል።'
                    : '🎉 You unlocked FREE Courier Delivery in Addis Ababa!'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-stone-100">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-stone-800 text-sm">
                  {language === 'am' ? 'የግዢ ዘንቢልዎ ባዶ ነው' : 'Your cart is empty'}
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                  {language === 'am'
                    ? 'የኢትዮጵያን ልዩ ቡና፣ ባህላዊ ልብሶችና የሸክላ ውጤቶች በመምረጥ ዘንቢልዎን ይሙሉ!'
                    : 'Explore our single-origin coffees, handwoven attire, and traditional crafts.'}
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="pt-3 flex gap-3 items-start">
                <img
                  src={item.product.images[0]}
                  alt={item.product.nameEn}
                  className="w-18 h-18 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                      {language === 'am' ? item.product.nameAm : item.product.nameEn}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.selectedOption && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block font-medium">
                      {item.selectedOption}
                    </p>
                  )}

                  {item.customNote && (
                    <p className="text-[10px] text-stone-500 italic">
                      Note: {item.customNote}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-xs sm:text-sm text-stone-900 font-serif-ethiopia">
                      {formatPrice(
                        item.product.priceETB * item.quantity,
                        item.product.priceUSD * item.quantity,
                        currency,
                        language
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
            
            {/* Promo Code Input Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={language === 'am' ? 'የቅናሽ ኮድ (ለምሳሌ HABESHA10)' : 'Promo Code (e.g. HABESHA10)'}
                  className="w-full bg-white border border-stone-300 rounded-xl py-1.5 pl-8 pr-2 text-xs uppercase outline-none focus:border-amber-600"
                />
              </div>
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                {language === 'am' ? 'ተግብር' : 'Apply'}
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="font-bold">✓ {appliedCoupon.code} applied ({appliedCoupon.percent}% OFF)</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-[11px] text-rose-600">{couponError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>{language === 'am' ? 'ድምር' : 'Subtotal'}</span>
                <span className="font-semibold text-stone-900">
                  {formatPrice(subtotalETB, subtotalUSD, currency, language)}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{language === 'am' ? 'የቅናሽ ተቀናሽ' : 'Coupon Discount'} ({discountPercent}%)</span>
                  <span>-{formatPrice(discountETB, discountUSD, currency, language)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>{language === 'am' ? 'የማድረሻ ክፍያ' : 'Estimated Shipping'}</span>
                <span>{language === 'am' ? 'በቀጣዩ ደረጃ ይሰላል' : 'Calculated at checkout'}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>{language === 'am' ? 'ጠቅላላ ድምር' : 'Estimated Total'}</span>
                <span className="font-serif-ethiopia text-lg">
                  {formatPrice(finalSubtotalETB, finalSubtotalUSD, currency, language)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={handleCheckout}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>{language === 'am' ? 'ወደ ክፍያ ይቀጥሉ' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
