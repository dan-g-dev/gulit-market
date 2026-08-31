import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight
} from 'lucide-react';
import { Language, ProductCategory } from '../types';
import gulitHeroBg from '../assets/images/ethiopian_real_gulit_market_1788134987241.jpg';

interface HeroBannerProps {
  language: Language;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
  onOpenCeremonyBuilder?: () => void;
  onOpenCustomKemis?: () => void;
  onOpenSellModal?: () => void;
  onSearchSubmit?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  language,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  onSelectCategory,
  onSearchSubmit
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Template Quick Filter Pills directly matching reference image:
  // Women's clothes, Beauty, Men's clothes, Kids clothes, Hobbies
  const templatePills: { id: ProductCategory; labelEn: string; labelAm: string }[] = [
    { id: 'womenswear', labelEn: "Women's clothes", labelAm: 'የሴቶች ልብሶች' },
    { id: 'beauty', labelEn: 'Beauty', labelAm: 'ውበትና ጤና' },
    { id: 'menswear', labelEn: "Men's clothes", labelAm: 'የወንዶች ልብሶች' },
    { id: 'kidswear', labelEn: 'Kids clothes', labelAm: 'የልጆች ልብሶች' },
    { id: 'hobbies', labelEn: 'Hobbies', labelAm: 'የትርፍ ጊዜና ጥበብ' }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePillClick = (catId: ProductCategory) => {
    onSelectCategory(catId);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 pt-2 pb-6">
      
      {/* Outer Banner Card matching the exact visual template from the user's reference */}
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-stone-900 shadow-xl min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center justify-center p-6 sm:p-10 lg:p-14 w-full">
        
        {/* Background Image: Authentic Ethiopian Gulit Market Scene */}
        <div className="absolute inset-0 z-0">
          <img 
            src={gulitHeroBg} 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1600&auto=format&fit=crop';
            }}
            alt="Authentic Ethiopian Gulit Open-Air Street Market with fresh vegetables and umbrellas" 
            className="w-full h-full object-cover object-center brightness-[0.74] contrast-[1.06] scale-100"
          />
          {/* Subtle balanced dark overlay to ensure maximum contrast and crisp text legibility */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.3px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35"></div>
        </div>

        {/* Center-Aligned Content Container */}
        <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center justify-center space-y-6 sm:space-y-7">
          
          {/* Main Headline: 'Everything you need, right around you.' */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-sans drop-shadow-md">
            {language === 'am'
              ? 'የሚፈልጉት ነገር ሁሉ፣ በዙሪያዎ ይገኛል።'
              : 'Everything you need, right around you.'}
          </h1>

          {/* Centered Large Pill Search Bar with Cyan Arrow Button */}
          <form 
            onSubmit={handleFormSubmit}
            className="relative flex items-center bg-white rounded-full p-2 sm:p-2.5 shadow-2xl w-full max-w-2xl text-stone-900 transition-all focus-within:ring-4 focus-within:ring-cyan-500/20"
          >
            {/* Search Icon */}
            <div className="pl-3 sm:pl-4 text-stone-400">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Input field */}
            <input
              id="hero-search-input"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'am' ? 'ምን እየፈለጉ ነው?' : 'What are you looking for?'}
              className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-sm sm:text-base md:text-lg text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
            />

            {/* Cyan / Teal Circular Submit Button with Arrow icon */}
            <button
              type="submit"
              className="bg-[#2EB8B8] hover:bg-[#259b9b] text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer shrink-0 ml-1"
              aria-label="Search"
              title="Search"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </form>

          {/* Pill Filter Tags matching template directly beneath search bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
            {templatePills.map((pill) => {
              const isActive = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handlePillClick(pill.id)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
                    isActive
                      ? 'bg-white text-stone-950 font-bold ring-2 ring-[#2EB8B8] shadow-md scale-105'
                      : 'bg-white/85 hover:bg-white text-stone-800 hover:text-stone-950 backdrop-blur-md'
                  }`}
                >
                  {language === 'am' ? pill.labelAm : pill.labelEn}
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
