import React, { useState } from 'react';
import { 
  X, 
  Scissors, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Ruler, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { Currency, Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface CustomKemisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  language: Language;
  onAddCustomDressToCart: (product: Product, customDetails: string, priceETB: number, priceUSD: number) => void;
}

export const CustomKemisModal: React.FC<CustomKemisModalProps> = ({
  isOpen,
  onClose,
  currency,
  language,
  onAddCustomDressToCart
}) => {
  if (!isOpen) return null;

  const [fabricType, setFabricType] = useState('menen');
  const [tibebPattern, setTibebPattern] = useState('lalibela');
  const [sleeveStyle, setSleeveStyle] = useState('long');
  const [sizingType, setSizingType] = useState<'standard' | 'custom'>('standard');
  const [standardSize, setStandardSize] = useState('Medium');
  
  // Custom measurements
  const [chest, setChest] = useState('38');
  const [waist, setWaist] = useState('32');
  const [length, setLength] = useState('56');
  const [shoulder, setShoulder] = useState('15');

  const [includeMatchingNetela, setIncludeMatchingNetela] = useState(true);

  // Price calculations
  let basePriceETB = 13500;
  let basePriceUSD = 135.0;

  if (fabricType === 'shemano') {
    basePriceETB += 2000;
    basePriceUSD += 20.0;
  } else if (fabricType === 'silk_cotton') {
    basePriceETB += 3500;
    basePriceUSD += 35.0;
  }

  if (tibebPattern === 'imperial_gondar' || tibebPattern === 'harari_multi') {
    basePriceETB += 1200;
    basePriceUSD += 12.0;
  }

  if (sizingType === 'custom') {
    basePriceETB += 1500;
    basePriceUSD += 15.0;
  }

  const handleAddToCart = () => {
    const customSummary = sizingType === 'custom'
      ? `Custom Tailored: Fabric: ${fabricType}, Tibeb: ${tibebPattern}, Sleeve: ${sleeveStyle}, Measurements: Chest ${chest}", Waist ${waist}", Length ${length}", Shoulder ${shoulder}"`
      : `Standard Size ${standardSize}: Fabric: ${fabricType}, Tibeb: ${tibebPattern}, Sleeve: ${sleeveStyle}`;

    const customProduct: Product = {
      id: `custom-kemis-${Date.now()}`,
      nameEn: `Custom Made-to-Measure Habesha Kemis (${tibebPattern.toUpperCase()})`,
      nameAm: `በልክ የተሰፋ የሐበሻ ቀሚስ (${tibebPattern})`,
      subtitleEn: 'Hand-Spun Ethiopian Menen Cotton • Handwoven by Shiro Meda Guild',
      subtitleAm: 'ከንጹሕ የኢትዮጵያ ጥጥ በእጅ የተሸመነ',
      category: 'clothing',
      priceETB: basePriceETB,
      priceUSD: basePriceUSD,
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      originRegion: 'Shiro Meda Weaving Guild, Addis Ababa',
      originRegionAm: 'ሽሮ ሜዳ የሸማ ማህበር፣ አዲስ አበባ',
      artisanName: 'Master Shemano Tailors',
      artisanNameAm: 'የሽሮ ሜዳ ዋና ሸማኔዎች',
      descriptionEn: `Bespoke handwoven Habesha dress tailored directly to customer specifications. ${customSummary}`,
      descriptionAm: `ለደንበኛ በተሰጠው ልክ የተዘጋጀ ልዩ የሐበሻ ቀሚስ።`,
      featuresEn: [
        '100% Hand-spun authentic Ethiopian Menen Cotton',
        'Custom woven Tibeb hemline and neckline embroidery',
        'Handcrafted in Shiro Meda, Addis Ababa',
        'Includes double Netela shawl with twisted fringe'
      ],
      featuresAm: [
        '100% በእጅ የተፈተለ ጥጥ',
        'የተመረጠ የጥበብ ጥልፍ ያካተተ',
        'በሽሮ ሜዳ የተሸመነ'
      ],
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=800&auto=format&fit=crop'
      ]
    };

    onAddCustomDressToCart(customProduct, customSummary, basePriceETB, basePriceUSD);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="custom-kemis-modal"
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-stone-200"
      >
        <div className="tibeb-border-gradient h-2 w-full"></div>

        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Scissors className="w-3 h-3 text-amber-400" />
                <span>{language === 'am' ? 'የሽሮ ሜዳ የሸማ ጥበብ' : 'Shiro Meda Bespoke Tailoring'}</span>
              </span>
            </div>
            <h2 className="font-serif-ethiopia text-xl sm:text-2xl font-bold">
              {language === 'am' ? 'በልክ የሚሰፋ ባህላዊ የሐበሻ ቀሚስ' : 'Custom Made-to-Measure Habesha Kemis'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {language === 'am'
                ? 'የጨርቅ አይነት፣ የጥበብ ቅርፅና የእርስዎን ልክ በማስገባት በባለሙያ ሸማኔዎች ያስሰፉ።'
                : 'Select your preferred hand-spun cotton, heritage Tibeb embroidery pattern, and exact tailor measurements.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Step 1: Fabric Selection */}
          <div className="space-y-2">
            <label className="font-bold text-xs sm:text-sm text-stone-900 block">
              1. {language === 'am' ? 'የጥጥ እና የጨርቅ አይነት' : 'Select Fabric Type'}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'menen', nameEn: 'Pure Menen Organic Cotton', nameAm: 'ንጹሕ የመነን ጥጥ', desc: 'Light, breathable, soft drape', extra: 0 },
                { id: 'shemano', nameEn: 'Heavy Double Shemano Cotton', nameAm: 'ድርብ ሸማኔ ጥጥ', desc: 'Thick, structured, royal warmth', extra: 2000 },
                { id: 'silk_cotton', nameEn: 'Silk & Cotton Hybrid (Menen Silk)', nameAm: 'የሀር እና የጥጥ ውህድ', desc: 'Lustrous sheen, holiday luxury', extra: 3500 }
              ].map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFabricType(f.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    fabricType === f.id
                      ? 'border-amber-700 bg-amber-50/80 ring-2 ring-amber-500/30'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                  }`}
                >
                  <p className="font-bold text-stone-900">{language === 'am' ? f.nameAm : f.nameEn}</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">{f.desc}</p>
                  {f.extra > 0 && (
                    <span className="text-amber-800 font-semibold text-[11px] mt-1 block">
                      +{formatPrice(f.extra, f.extra / 100, currency, language)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Tibeb Border Pattern */}
          <div className="space-y-2">
            <label className="font-bold text-xs sm:text-sm text-stone-900 block">
              2. {language === 'am' ? 'የጥበብ ጥልፍ ቅርፅ እና ቀለም' : 'Select Tibeb Embroidery Pattern'}:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'lalibela', nameEn: 'Royal Lalibela Gold Cross Tibeb', nameAm: 'የላሊበላ የወርቅ መስቀል ጥበብ', desc: 'Classic golden cross pattern with subtle ruby border' },
                { id: 'imperial_gondar', nameEn: 'Imperial Gondar Ruby & Emerald Tibeb', nameAm: 'የጎንደር ንጉሳዊ ቀይና አረንጓዴ ጥበብ', desc: 'Regal interlocking diamond geometric embroidery' },
                { id: 'harari_multi', nameEn: 'Harari Vibrant Festive Multicolor Tibeb', nameAm: 'የሐረር ባለብዙ ቀለም የባህል ጥበብ', desc: 'Celebratory bright floral and chevron motifs' },
                { id: 'axumite_blue', nameEn: 'Axumite Sapphire & Silver Tibeb', nameAm: 'የአክሱም የብርና ሰማያዊ ጥበብ', desc: 'Modern minimalist navy and silver thread band' }
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setTibebPattern(p.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    tibebPattern === p.id
                      ? 'border-amber-700 bg-amber-50/80 ring-2 ring-amber-500/30'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                  }`}
                >
                  <p className="font-bold text-stone-900">{language === 'am' ? p.nameAm : p.nameEn}</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Sizing (Standard vs Custom Measurements) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs sm:text-sm text-stone-900">
                3. {language === 'am' ? 'የመጠንና የልክ ምርጫ' : 'Sizing & Measurements'}:
              </label>
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setSizingType('standard')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    sizingType === 'standard' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  {language === 'am' ? 'መደበኛ ልክ (S-XL)' : 'Standard Sizes'}
                </button>
                <button
                  type="button"
                  onClick={() => setSizingType('custom')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    sizingType === 'custom' ? 'bg-amber-700 text-white shadow-xs' : 'text-stone-500'
                  }`}
                >
                  {language === 'am' ? 'በልክ ማስሰፋት' : 'Custom Measurements'}
                </button>
              </div>
            </div>

            {sizingType === 'standard' ? (
              <div className="grid grid-cols-4 gap-2">
                {['Small', 'Medium', 'Large', 'XL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStandardSize(s)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      standardSize === s
                        ? 'bg-amber-700 text-white border-amber-800'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                  <Ruler className="w-4 h-4 text-amber-700" />
                  <span>{language === 'am' ? 'የሰውነትዎን ልክ በኢንች (Inches) ያስገቡ' : 'Enter your measurements in inches'}:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Chest (ኢንች):</label>
                    <input
                      type="number"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Waist (ኢንች):</label>
                    <input
                      type="number"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Dress Length (ኢንች):</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Shoulder (ኢንች):</label>
                    <input
                      type="number"
                      value={shoulder}
                      onChange={(e) => setShoulder(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-stone-950 font-serif-ethiopia">
              {formatPrice(basePriceETB, basePriceUSD, currency, language)}
            </div>
            <p className="text-[11px] text-stone-500">
              {language === 'am' ? 'የተሟላ ነጠላ እና የመስፊያ ክፍያ ያካተተ' : 'Includes custom matching Netela shawl and tailoring'}
            </p>
          </div>

          <button
            id="add-custom-kemis-to-cart-btn"
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{language === 'am' ? 'የተበጀውን ቀሚስ ወደ ዘንቢል ጨምር' : 'Add Custom Tailored Kemis to Cart'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
