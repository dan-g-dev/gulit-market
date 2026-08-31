import React, { useState } from 'react';
import { 
  X, 
  Coffee, 
  Sparkles, 
  Check, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  ShoppingBag,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface CeremonyKitBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  language: Language;
  onAddBundleToCart: (items: Product[], bundleName: string, discountedPriceETB: number, discountedPriceUSD: number) => void;
}

export const CeremonyKitBuilderModal: React.FC<CeremonyKitBuilderModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  language,
  onAddBundleToCart
}) => {
  if (!isOpen) return null;

  // Filter components available in catalog
  const jebenas = products.filter(p => p.category === 'pottery' && p.id.includes('jebena'));
  const rekebots = products.filter(p => p.category === 'pottery' && p.id.includes('rekebot'));
  const coffees = products.filter(p => p.category === 'coffee');
  const incenses = products.filter(p => p.category === 'pottery' && p.id.includes('incense'));

  // Default selections
  const [selectedJebena, setSelectedJebena] = useState<Product | null>(jebenas[0] || null);
  const [selectedRekebot, setSelectedRekebot] = useState<Product | null>(rekebots[0] || null);
  const [selectedCoffee, setSelectedCoffee] = useState<Product | null>(coffees[0] || null);
  const [selectedIncense, setSelectedIncense] = useState<Product | null>(incenses[0] || null);
  const [includeTraditionalGrass, setIncludeTraditionalGrass] = useState(true);

  // Bundle calculations (15% discount for complete kit)
  const basePriceETB = (selectedJebena?.priceETB || 0) + 
                       (selectedRekebot?.priceETB || 0) + 
                       (selectedCoffee?.priceETB || 0) + 
                       (selectedIncense?.priceETB || 0) + 
                       (includeTraditionalGrass ? 300 : 0);

  const basePriceUSD = (selectedJebena?.priceUSD || 0) + 
                       (selectedRekebot?.priceUSD || 0) + 
                       (selectedCoffee?.priceUSD || 0) + 
                       (selectedIncense?.priceUSD || 0) + 
                       (includeTraditionalGrass ? 3.0 : 0);

  const discountRate = 0.15; // 15% bundle discount
  const bundleDiscountETB = Math.round(basePriceETB * discountRate);
  const bundleDiscountUSD = Number((basePriceUSD * discountRate).toFixed(2));

  const finalPriceETB = basePriceETB - bundleDiscountETB;
  const finalPriceUSD = Number((basePriceUSD - bundleDiscountUSD).toFixed(2));

  const handleAddBundle = () => {
    const bundleItems: Product[] = [];
    if (selectedJebena) bundleItems.push(selectedJebena);
    if (selectedRekebot) bundleItems.push(selectedRekebot);
    if (selectedCoffee) bundleItems.push(selectedCoffee);
    if (selectedIncense) bundleItems.push(selectedIncense);

    const bundleTitle = language === 'am'
      ? 'የተሟላ የኢትዮጵያ ባህላዊ የቡና ሥነ-ሥርዓት ስብስብ (15% ቅናሽ)'
      : 'Complete Authentic Ethiopian Coffee Ceremony Kit (15% OFF Bundle)';

    onAddBundleToCart(bundleItems, bundleTitle, finalPriceETB, finalPriceUSD);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="ceremony-kit-builder-modal"
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-stone-200"
      >
        {/* Header Strip */}
        <div className="tibeb-border-gradient h-2 w-full"></div>
        
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{language === 'am' ? 'የ 15% ልዩ የጥቅል ቅናሽ' : '15% Ceremonial Bundle Discount'}</span>
              </span>
            </div>
            <h2 className="font-serif-ethiopia text-xl sm:text-2xl font-bold">
              {language === 'am' ? 'የቡና ሥነ-ሥርዓት መገንቢያ' : 'Ethiopian Coffee Ceremony Kit Builder'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {language === 'am'
                ? 'ጀበና፣ ረከቦት፣ ሲኒ፣ ምርጥ ቡና እና እጣን በመምረጥ የራስዎን ባህላዊ ስብስብ ይገንቡ።'
                : 'Select your preferred handmade Jebena, carved Rekebot, fresh heirloom beans, and sacred incense.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Selector Matrix */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Step 1: Select Clay Jebena */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === 'am' ? 'የሸክላ ጀበና ይምረጡ' : 'Step 1: Choose Your Clay Jebena'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {jebenas.map((item) => {
                const isSelected = selectedJebena?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedJebena(item)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <img src={item.images[0]} alt={item.nameEn} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-stone-900">{language === 'am' ? item.nameAm : item.nameEn}</p>
                      <p className="text-stone-500 text-[11px]">{item.originRegion}</p>
                      <p className="font-semibold text-amber-800 mt-1">
                        {formatPrice(item.priceETB, item.priceUSD, currency, language)}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Rekebot Coffee Tray Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === 'am' ? 'የእንጨት ረከቦት እና ሲኒ ይምረጡ' : 'Step 2: Choose Rekebot Table & Sini Cups'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rekebots.map((item) => {
                const isSelected = selectedRekebot?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRekebot(item)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <img src={item.images[0]} alt={item.nameEn} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-stone-900">{language === 'am' ? item.nameAm : item.nameEn}</p>
                      <p className="text-stone-500 text-[11px]">{item.subtitleEn}</p>
                      <p className="font-semibold text-amber-800 mt-1">
                        {formatPrice(item.priceETB, item.priceUSD, currency, language)}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Heirloom Coffee Beans */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === 'am' ? 'የተፈጥሮ ልዩ ቡና ይምረጡ (500g)' : 'Step 3: Choose Fresh Heirloom Coffee Beans'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coffees.map((item) => {
                const isSelected = selectedCoffee?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCoffee(item)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <img src={item.images[0]} alt={item.nameEn} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-stone-900">{language === 'am' ? item.nameAm : item.nameEn}</p>
                      <p className="text-stone-500 text-[11px]">{item.tastingNotes?.join(', ')}</p>
                      <p className="font-semibold text-amber-800 mt-1">
                        {formatPrice(item.priceETB, item.priceUSD, currency, language)}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Incense & Fresh Green Grass Add-on */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-bold flex items-center justify-center">4</span>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                {language === 'am' ? 'ዕጣን እና የቡና ማድመቂያ ሳር' : 'Step 4: Sacred Incense & Fresh Ketema Grass'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incenses.map((item) => {
                const isSelected = selectedIncense?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncense(item)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <img src={item.images[0]} alt={item.nameEn} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-stone-900">{language === 'am' ? item.nameAm : item.nameEn}</p>
                      <p className="font-semibold text-amber-800 mt-1">
                        {formatPrice(item.priceETB, item.priceUSD, currency, language)}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
                  </div>
                );
              })}

              {/* Ketema Grass Add-on checkbox */}
              <div 
                onClick={() => setIncludeTraditionalGrass(!includeTraditionalGrass)}
                className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  includeTraditionalGrass
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
              >
                <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                  🌿
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-stone-900">
                    {language === 'am' ? 'ባህላዊ የጎመንዘር/ቀጤማ ሳር' : 'Aromatic Ketema Grass Carpet'}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    {language === 'am' ? 'ለቡናው ስነ-ስርዓት ማድመቂያ' : 'Traditional green floor spread'}
                  </p>
                  <p className="font-semibold text-emerald-800 mt-1">
                    +{formatPrice(300, 3.0, currency, language)}
                  </p>
                </div>
                {includeTraditionalGrass && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Summary & Add Bundle Button */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 line-through">
                {formatPrice(basePriceETB, basePriceUSD, currency, language)}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {language === 'am' ? '15% ተቀናሽ' : 'Save 15%'}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-stone-950 font-serif-ethiopia">
              {formatPrice(finalPriceETB, finalPriceUSD, currency, language)}
            </div>
            <p className="text-[11px] text-stone-500">
              {language === 'am' ? 'የተሟላ የ 5 እቃዎች ስብስብ' : 'Complete 5-piece ceremonial setup'}
            </p>
          </div>

          <button
            id="add-ceremony-bundle-btn"
            onClick={handleAddBundle}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{language === 'am' ? 'የተሟላውን ስብስብ ወደ ዘንቢል ጨምር' : 'Add Complete Ceremony Kit to Cart'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
