import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ShoppingBag, 
  Camera, 
  MapPin, 
  Phone, 
  Tag, 
  DollarSign, 
  Image as ImageIcon 
} from 'lucide-react';
import { Currency, ItemCondition, Language, Product, ProductCategory } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onItemListed: (product: Product) => void;
}

const PHOTO_PRESETS = [
  { label: 'Leather Jacket / Coat', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { label: 'Habesha Dress / Kemis', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop' },
  { label: 'Leather Boots / Shoes', url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop' },
  { label: 'Specialty Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop' },
  { label: 'Leather Travel Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop' },
  { label: 'Ceremony Jebena Pottery', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop' },
  { label: 'Beauty / Oil Elixir', url: 'https://images.unsplash.com/photo-1608248597359-0a69315582f3?q=80&w=800&auto=format&fit=crop' },
  { label: 'Vintage Jewelry / Cross', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop' }
];

export const SellItemModal: React.FC<SellItemModalProps> = ({
  isOpen,
  onClose,
  language,
  currency,
  onItemListed
}) => {
  const t = TRANSLATIONS[language];

  const [titleEn, setTitleEn] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [category, setCategory] = useState<ProductCategory>('clothing');
  const [condition, setCondition] = useState<ItemCondition>('like_new');
  const [size, setSize] = useState('M');
  const [priceETB, setPriceETB] = useState<number>(2500);
  const [sellerName, setSellerName] = useState('Kalkidan B.');
  const [sellerPhone, setSellerPhone] = useState('+251 91 123 4567');
  const [sellerLocation, setSellerLocation] = useState('Bole, Addis Ababa');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTO_PRESETS[0].url);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;

    const finalImage = customPhotoInput.trim() || selectedPhoto;
    const computedPriceUSD = Number((priceETB / 100).toFixed(2));

    const newProduct: Product = {
      id: `user-list-${Date.now()}`,
      nameEn: titleEn,
      nameAm: titleAm || titleEn,
      subtitleEn: `${condition.toUpperCase()} • ${size ? `Size ${size} • ` : ''}${sellerLocation}`,
      subtitleAm: `${condition === 'new' ? 'አዲስ' : condition === 'vintage' ? 'ቪንቴጅ' : 'እንደ አዲስ'} • ${sellerLocation}`,
      category,
      priceETB: Number(priceETB),
      priceUSD: computedPriceUSD,
      originalPriceETB: Math.round(priceETB * 1.2),
      originalPriceUSD: Math.round(computedPriceUSD * 1.2),
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      isRecentListed: true,
      isUserListed: true,
      condition,
      sizeBadge: size || undefined,
      sellerName,
      sellerNameAm: sellerName,
      sellerLocation,
      sellerLocationAm: sellerLocation,
      originRegion: sellerLocation,
      originRegionAm: sellerLocation,
      artisanName: `${sellerName} (Gulit Verified Seller)`,
      artisanNameAm: `${sellerName} (የጉሊት ሻጭ)`,
      descriptionEn: description || `Authentic ${titleEn} listed by ${sellerName} on Gulit Market. In ${condition} condition, available for pickup or express delivery in ${sellerLocation}.`,
      descriptionAm: description || `በጉሊት ገበያ የቀረበ ${titleEn}። በጥሩ ሁኔታ ላይ ያለ፣ በ${sellerLocation} የሚገኝ።`,
      featuresEn: [
        `Condition: ${condition.replace('_', ' ')}`,
        `Seller: ${sellerName}`,
        `Location: ${sellerLocation}`,
        `Verified Telebirr contact: ${sellerPhone}`
      ],
      featuresAm: [
        `ሁኔታ፡ ${condition}`,
        `ሻጭ፡ ${sellerName}`,
        `አካባቢ፡ ${sellerLocation}`,
        `ቴሌብር ስልክ፡ ${sellerPhone}`
      ],
      images: [finalImage]
    };

    onItemListed(newProduct);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoInput(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-5 flex items-center justify-between border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {language === 'am' ? 'እቃዎን በጉሊት ገበያ ይሽጡ' : 'Sell Your Item on Gulit Market'}
                </h2>
                <span className="bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  ጉሊት
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {language === 'am' ? 'በአዲስ አበባ እና በውጭ ሀገር ላሉ ገዢዎች በቀላሉ ያቅርቡ' : 'Post your items to reach thousands of buyers across Addis Ababa & diaspora'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Item Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Item Title (English) *
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Vintage Leather Jacket, Handwoven Kemis"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                የእቃው ስም (አማርኛ - አማራጭ)
              </label>
              <input
                type="text"
                value={titleAm}
                onChange={(e) => setTitleAm(e.target.value)}
                placeholder="ለምሳሌ፡ የቆዳ ጃኬት፣ የሐበሻ ቀሚስ"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none font-medium"
              >
                <option value="clothing">👗 Clothing & Kemis</option>
                <option value="vintage">🧥 Vintage & Thrift</option>
                <option value="shoes">👞 Shoes & Boots</option>
                <option value="coffee">☕ Ethiopian Coffee</option>
                <option value="beauty">✨ Beauty & Skincare</option>
                <option value="pottery">🏺 Ceremony & Pottery</option>
                <option value="crafts">👜 Leather & Crafts</option>
                <option value="spices">🌶️ Spices & Teff</option>
                <option value="art">🎨 Music & Art</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none font-medium"
              >
                <option value="new">✨ Brand New (አዲስ)</option>
                <option value="handcrafted">🧵 Handcrafted (በእጅ የተሰራ)</option>
                <option value="like_new">👌 Like New (እንደ አዲስ)</option>
                <option value="good">👍 Good Condition (በጥሩ ሁኔታ)</option>
                <option value="vintage">⏳ Vintage / Antique (ቪንቴጅ)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Size / Variant
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. S, M, L, EU 42, 500g"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none"
              />
            </div>
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Price (ETB - የኢትዮጵያ ብር) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={priceETB}
                  onChange={(e) => setPriceETB(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2.5 text-stone-900 font-bold focus:bg-white focus:border-amber-700 outline-none"
                />
                <span className="absolute left-3 top-3 text-stone-400 font-bold text-xs">ብር</span>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Seller Name / Boutique *
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Kalkidan, Bole Vintage"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Location in Addis / Ethiopia *
              </label>
              <select
                value={sellerLocation}
                onChange={(e) => setSellerLocation(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none font-medium"
              >
                <option value="Bole, Addis Ababa">Bole, Addis Ababa (ቦሌ)</option>
                <option value="Shiro Meda, Addis Ababa">Shiro Meda, Addis Ababa (ሽሮ ሜዳ)</option>
                <option value="Kazanchis, Addis Ababa">Kazanchis, Addis Ababa (ካዛንቺስ)</option>
                <option value="Piassa, Addis Ababa">Piassa, Addis Ababa (ፒያሳ)</option>
                <option value="Merkato, Addis Ababa">Merkato, Addis Ababa (መርካቶ)</option>
                <option value="CMC & Megenagna, Addis Ababa">CMC & Megenagna (መገናኛ)</option>
                <option value="Hawassa, Sidama">Hawassa, Sidama (ሀዋሳ)</option>
                <option value="Gondar, Amhara">Gondar, Amhara (ጎንደር)</option>
                <option value="Bahir Dar, Amhara">Bahir Dar (ባህር ዳር)</option>
              </select>
            </div>
          </div>

          {/* Contact phone */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Telebirr / Phone Number for Buyer Contact *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="+251 9... or 09..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 focus:bg-white focus:border-amber-700 outline-none font-medium"
              />
              <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
            </div>
          </div>

          {/* Photo Selection */}
          <div className="space-y-2">
            <label className="block text-stone-700 font-semibold">
              Select Item Photo / Sample Image *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PHOTO_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedPhoto(preset.url);
                    setCustomPhotoInput('');
                  }}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                    selectedPhoto === preset.url && !customPhotoInput
                      ? 'border-amber-600 ring-2 ring-amber-400'
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {selectedPhoto === preset.url && !customPhotoInput && (
                    <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom file or URL input */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-300 cursor-pointer font-medium text-xs">
                <Camera className="w-4 h-4 text-stone-500" />
                <span>Upload from Device</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <span className="text-stone-400 text-xs">or paste image URL:</span>
              <input
                type="url"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Description & Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, material, or any unique details about the item..."
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-900 focus:bg-white focus:border-amber-700 outline-none text-xs"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-full font-semibold cursor-pointer transition-colors"
            >
              {language === 'am' ? 'ተመለስ' : 'Cancel'}
            </button>
            <button
              type="submit"
              id="submit-listing-btn"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md shadow-amber-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{language === 'am' ? 'እቃውን አሁኑኑ ይለጥፉ' : 'Publish Listing Now'}</span>
            </button>
          </div>
        </form>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="bg-white text-stone-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                {language === 'am' ? 'እቃዎ በተሳካ ሁኔታ ተለጥፏል!' : 'Item Listed Successfully!'}
              </h3>
              <p className="text-xs text-stone-600">
                {language === 'am' ? 'እቃዎ አሁን በጉሊት ገበያ "አዲስ የተጨመሩ እቃዎች" ውስጥ ይታያል።' : 'Your listing is now live in the Gulit Market "Listed recently" showcase.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
