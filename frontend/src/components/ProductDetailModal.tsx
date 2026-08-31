import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  Heart, 
  Check, 
  Coffee, 
  Sparkles,
  Info,
  User,
  Plus,
  Minus,
  MessageSquarePlus
} from 'lucide-react';
import { Currency, Language, Product, Review } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  language: Language;
  onAddToCart: (product: Product, quantity: number, selectedOption?: string, customNote?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onInstantBuy: (product: Product, quantity: number, selectedOption?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  language,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onInstantBuy
}) => {
  if (!isOpen || !product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'origin' | 'reviews'>('details');

  // Review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const selectedChoice = product.options?.choices[selectedOptionIndex];
  const optionModifierETB = selectedChoice?.priceModifierETB || 0;
  const optionModifierUSD = selectedChoice?.priceModifierUSD || 0;

  const currentPriceETB = product.priceETB + optionModifierETB;
  const currentPriceUSD = product.priceUSD + optionModifierUSD;

  const handleAddToCart = () => {
    const optionName = selectedChoice ? (language === 'am' ? selectedChoice.nameAm : selectedChoice.nameEn) : undefined;
    onAddToCart(product, quantity, optionName, customNote);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const optionName = selectedChoice ? (language === 'am' ? selectedChoice.nameAm : selectedChoice.nameEn) : undefined;
    onInstantBuy(product, quantity, optionName);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      date: new Date().toISOString().split('T')[0],
      rating: newReviewRating,
      commentEn: newReviewComment.trim(),
      commentAm: newReviewComment.trim(),
      location: 'Addis Ababa (Verified)',
      verified: true
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="product-detail-modal"
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200"
      >
        {/* Header Ribbon & Close Button */}
        <div className="tibeb-border-gradient h-1.5 w-full"></div>
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full z-20 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Image Gallery */}
            <div className="md:col-span-6 space-y-3">
              {/* Main Active Image */}
              <div className="relative aspect-4/3 sm:aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={language === 'am' ? product.nameAm : product.nameEn}
                  className="w-full h-full object-cover"
                />
                {product.isFairTrade && (
                  <span className="absolute bottom-3 left-3 bg-stone-900/85 backdrop-blur-xs text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'am' ? 'ፍትሃዊ የገበያ ዋስትና' : 'Fair Trade Direct'}</span>
                  </span>
                )}
              </div>

              {/* Thumbnail Selector */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImage === idx ? 'border-amber-600 ring-2 ring-amber-400/40' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Provenance Box */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>{language === 'am' ? 'የመነሻ ምንጭ እና ባለቤት' : 'Authentic Provenance'}</span>
                </div>
                <p className="font-semibold text-stone-800">
                  {language === 'am' ? product.originRegionAm : product.originRegion}
                </p>
                <p className="text-stone-600">
                  {language === 'am' ? 'በማህበሩ የተሰራ፡ ' : 'Crafted by: '}
                  <span className="font-medium text-stone-900">
                    {language === 'am' ? product.artisanNameAm : product.artisanName}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column: Details, Options, & Actions */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                {/* Title & Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {product.category}
                    </span>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="ml-1 text-stone-800">{product.rating}</span>
                      <span className="text-stone-400 font-normal ml-1">
                        ({reviewsList.length} {language === 'am' ? 'አስተያየቶች' : 'reviews'})
                      </span>
                    </div>
                  </div>

                  <h2 className="font-serif-ethiopia text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    {language === 'am' ? product.nameAm : product.nameEn}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
                    {language === 'am' ? product.subtitleAm : product.subtitleEn}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-serif-ethiopia text-2xl sm:text-3xl font-bold text-stone-950">
                    {formatPrice(currentPriceETB, currentPriceUSD, currency, language)}
                  </span>
                  {product.originalPriceETB && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.originalPriceETB, product.originalPriceUSD || 0, currency, language)}
                    </span>
                  )}
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {language === 'am' ? 'በክምችት አለ' : 'In Stock'}
                  </span>
                </div>

                {/* Options Selector (Grind, Size, Weight, etc.) */}
                {product.options && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <label className="text-xs font-bold text-stone-800 block">
                      {language === 'am' ? product.options.labelAm : product.options.labelEn}:
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {product.options.choices.map((choice, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedOptionIndex(idx)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                            selectedOptionIndex === idx
                              ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold ring-1 ring-amber-500/50'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span>{language === 'am' ? choice.nameAm : choice.nameEn}</span>
                          {choice.priceModifierETB ? (
                            <span className="text-[11px] text-amber-800 font-bold">
                              +{formatPrice(choice.priceModifierETB, choice.priceModifierUSD || 0, currency, language)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">Included</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Note Input */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    {language === 'am' ? 'ልዩ ማስታወሻ ወይም የመጠን መመሪያ (አማራጭ)' : 'Special Request / Custom Sizing Note (Optional)'}:
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder={language === 'am' ? 'ለምሳሌ፡ ለስጦታ እንዲታሸግልኝ፣ የቀሚስ ርዝመት 56 ኢንች...' : 'e.g. Gift wrap requested, custom Kemis length 56"...'}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:border-amber-600 outline-none"
                  />
                </div>

                {/* Quantity & Action Controls */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-stone-100 rounded-xl border border-stone-200 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      id="wishlist-modal-btn"
                      onClick={() => onToggleWishlist(product)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isWishlisted 
                          ? 'bg-rose-50 border-rose-200 text-rose-600' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="modal-add-to-cart-btn"
                      onClick={handleAddToCart}
                      className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{language === 'am' ? 'ወደ ዘንቢል ተጨምሯል!' : 'Added to Cart!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-amber-300" />
                          <span>{language === 'am' ? 'ወደ ዘንቢል ጨምር' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>

                    <button
                      id="modal-buy-now-btn"
                      onClick={handleBuyNow}
                      className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'am' ? 'አሁኑኑ ይግዙ' : 'Instant Checkout'}</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Guarantees */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{language === 'am' ? 'አዲስ አበባ የ 24 ሰዓት ማድረስ' : 'Same-day Addis courier'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'am' ? '100% ንፁህ የባህል ጥራት' : 'Guaranteed authentic'}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Tabs: Description, Features, and Verified Reviews */}
          <div className="pt-6 border-t border-stone-200">
            <div className="flex gap-4 border-b border-stone-200 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'details' ? 'border-amber-700 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {language === 'am' ? 'የምርት ዝርዝር' : 'Description & Features'}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'reviews' ? 'border-amber-700 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {language === 'am' ? `የደንበኞች አስተያየት (${reviewsList.length})` : `Customer Reviews (${reviewsList.length})`}
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p>{language === 'am' ? product.descriptionAm : product.descriptionEn}</p>

                {/* Key Features List */}
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    {language === 'am' ? 'ዋና ዋና ባህሪያት' : 'Key Specifications'}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(language === 'am' ? product.featuresAm : product.featuresEn).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Care or Preparation if exists */}
                {(product.careInstructionsEn || product.careInstructionsAm) && (
                  <div className="p-3 bg-stone-100 rounded-xl text-stone-700 text-xs">
                    <span className="font-bold block mb-0.5 text-stone-900">
                      {language === 'am' ? 'የአጠቃቀምና የእንክብካቤ መመሪያ' : 'Care & Maintenance Guide'}:
                    </span>
                    <p>{language === 'am' ? product.careInstructionsAm : product.careInstructionsEn}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <MessageSquarePlus className="w-4 h-4 text-amber-700" />
                      {language === 'am' ? 'አስተያየትዎን ያጋሩ' : 'Leave a Verified Customer Review'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setNewReviewRating(s)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${s <= newReviewRating ? 'fill-amber-400' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder={language === 'am' ? 'የእርስዎ ስም' : 'Your Name'}
                      className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-600"
                    />
                    <input
                      type="text"
                      required
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder={language === 'am' ? 'ስለ ምርቱ ያለዎት አስተያየት...' : 'What did you love about this item?...'}
                      className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {language === 'am' ? 'አስተያየት አስገባ' : 'Submit Review'}
                  </button>

                  {reviewSubmitted && (
                    <span className="text-emerald-700 text-xs font-bold ml-2">
                      {language === 'am' ? 'አስተያየትዎ ተመዝግቧል!' : 'Review posted successfully!'}
                    </span>
                  )}
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                            {rev.author.charAt(0)}
                          </div>
                          <span className="font-bold text-stone-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-stone-400 text-[10px]">{rev.date}</span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>

                      <p className="text-xs text-stone-700">
                        {language === 'am' && rev.commentAm ? rev.commentAm : rev.commentEn}
                      </p>

                      <span className="text-[10px] text-stone-400 block">
                        Location: {rev.location}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
