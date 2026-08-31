import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  Globe, 
  X,
  Menu,
  ChevronDown,
  User,
  Sparkles,
  ShoppingBasket
} from 'lucide-react';
import { Currency, Language, ProductCategory } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCeremonyBuilder: () => void;
  onOpenCustomKemis: () => void;
  onOpenOrderTracker: () => void;
  onOpenSellModal: () => void;
  onOpenAuthModal?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (category: ProductCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  currency,
  setCurrency,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenCeremonyBuilder,
  onOpenCustomKemis,
  onOpenOrderTracker,
  onOpenSellModal,
  onOpenAuthModal,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const t = TRANSLATIONS[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories: { id: ProductCategory; name: string; amName: string; icon: string }[] = [
    { id: 'all', name: 'All Categories', amName: 'ሁሉም እቃዎች', icon: '✨' },
    { id: 'clothing', name: 'Fashion & Kemis', amName: 'የሀበሻ ቀሚስና ፋሽን', icon: '👗' },
    { id: 'coffee', name: 'Specialty Coffee', amName: 'የኢትዮጵያ ቡና', icon: '☕' },
    { id: 'shoes', name: 'Shoes & Boots', amName: 'ጫማዎች', icon: '👞' },
    { id: 'beauty', name: 'Beauty & Wellness', amName: 'ውበትና ጤና', icon: '🌿' },
    { id: 'vintage', name: 'Vintage & Thrift', amName: 'ቪንቴጅ / ጉሊት', icon: '🧥' },
    { id: 'pottery', name: 'Ceremony Pottery', amName: 'ጀበናና ሸክላ', icon: '🏺' },
    { id: 'crafts', name: 'Leather & Living', amName: 'የቆዳና የቤት እቃዎች', icon: '👜' },
    { id: 'spices', name: 'Spices & Teff', amName: 'ቅመሞችና ጤፍ', icon: '🌶️' },
    { id: 'art', name: 'Music & Traditional Art', amName: 'ሙዚቃና ጥበብ', icon: '🎨' }
  ];

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5EE]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* 1. Left: Authentic Terracotta Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <button 
              id="mobile-menu-toggle"
              className="lg:hidden p-2 text-stone-700 hover:text-stone-950 cursor-pointer rounded-lg hover:bg-stone-200/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                setSelectedCategory('all'); 
                setSearchQuery(''); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              {/* Terracotta Ethiopic Logo Glyph */}
              <div className="flex items-center justify-center text-[#BC5228] font-bold text-2xl group-hover:scale-105 transition-transform">
                <span className="font-serif-ethiopia tracking-tighter">ጉሊት</span>
              </div>

              {/* Brand text */}
              <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Gulit Market
              </span>
            </a>
          </div>

          {/* 2. Center/Left: Template Navigation Links (Womenswear, Menswear, Kidswear, Beauty, Hobbies, Homeware) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
            
            {/* Womenswear */}
            <button
              onClick={() => {
                setSelectedCategory('womenswear');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'womenswear' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'የሴቶች ልብሶች' : 'Womenswear'}
            </button>

            {/* Menswear */}
            <button
              onClick={() => {
                setSelectedCategory('menswear');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'menswear' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'የወንዶች ልብሶች' : 'Menswear'}
            </button>

            {/* Kidswear */}
            <button
              onClick={() => {
                setSelectedCategory('kidswear');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'kidswear' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'የልጆች ልብሶች' : 'Kidswear'}
            </button>

            {/* Beauty */}
            <button
              onClick={() => {
                setSelectedCategory('beauty');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'beauty' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'ውበትና ጤና' : 'Beauty'}
            </button>

            {/* Hobbies */}
            <button
              onClick={() => {
                setSelectedCategory('hobbies');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'hobbies' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'የትርፍ ጊዜና ጥበብ' : 'Hobbies'}
            </button>

            {/* Homeware */}
            <button
              onClick={() => {
                setSelectedCategory('homeware');
                handleNavClick('catalog-section');
              }}
              className={`hover:text-[#2EB8B8] transition-colors cursor-pointer py-1.5 font-medium ${
                selectedCategory === 'homeware' ? 'text-[#2EB8B8] font-bold border-b-2 border-[#2EB8B8]' : ''
              }`}
            >
              {language === 'am' ? 'የቤት እቃዎች' : 'Homeware'}
            </button>

          </nav>

          {/* 3. Right: Wishlist, Cart, Login, and 'Sell item' outline pill button */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Icon Trigger */}
            <button
              onClick={() => {
                const searchInput = document.getElementById('hero-search-input');
                if (searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  setIsSearchOpen(!isSearchOpen);
                }
              }}
              className="p-2 text-stone-700 hover:text-[#2EB8B8] hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
              title="Search"
              aria-label="Search items"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist Heart Icon */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-2 text-stone-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon with Badge */}
            <button
              id="cart-drawer-btn"
              onClick={onOpenCart}
              className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
              aria-label="Cart"
              title="Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#2EB8B8] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login Link */}
            <button
              onClick={onOpenAuthModal || onOpenOrderTracker}
              className="hidden sm:inline-block text-xs sm:text-sm font-medium text-stone-700 hover:text-[#2EB8B8] transition-colors cursor-pointer px-1 py-1"
            >
              {language === 'am' ? 'ይግቡ' : 'Login'}
            </button>

            {/* 'Sell item' Pill Button matching the template screenshot */}
            <button
              id="nav-sell-item-btn"
              onClick={onOpenSellModal}
              className="border-2 border-[#2EB8B8]/60 hover:border-[#2EB8B8] bg-white hover:bg-[#2EB8B8]/5 text-stone-800 hover:text-[#2EB8B8] text-xs sm:text-sm font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {language === 'am' ? 'እቃ ይሽጡ' : 'Sell item'}
            </button>

            {/* Subtle Currency & Language Switcher Dropdown */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-stone-300 text-xs">
              <button
                onClick={() => setCurrency(currency === 'ETB' ? 'USD' : 'ETB')}
                className="px-1.5 py-0.5 font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                title="Switch Currency"
              >
                {currency}
              </button>
              <span className="text-stone-300">•</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="px-1.5 py-0.5 font-semibold text-stone-600 hover:text-[#BC5228] cursor-pointer"
                title="Switch Language"
              >
                {language === 'en' ? 'EN' : 'አማ'}
              </button>
            </div>

          </div>

        </div>

        {/* Collapsible Search Dropdown (if triggered on small screens) */}
        {isSearchOpen && (
          <div className="pb-3 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white border border-stone-300 focus:border-[#BC5228] text-stone-900 text-xs sm:text-sm rounded-full py-2.5 pl-10 pr-9 outline-none shadow-sm"
                autoFocus
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-600 cursor-pointer rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between bg-[#F8F5EE] p-2.5 rounded-2xl text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-700">
              <span>{currency === 'ETB' ? 'Ethiopian Birr (ETB)' : 'US Dollar (USD)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrency(currency === 'ETB' ? 'USD' : 'ETB')}
                className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-800"
              >
                {currency}
              </button>
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="px-2.5 py-1 bg-[#BC5228] text-white rounded-lg font-bold"
              >
                {language === 'en' ? 'EN' : 'አማ'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                setSelectedCategory('clothing');
                setMobileMenuOpen(false);
                handleNavClick('catalog-section');
              }}
              className="p-3 bg-[#F8F5EE] rounded-xl text-left hover:bg-amber-100/50"
            >
              👗 {language === 'am' ? 'የሀበሻ ቀሚስ' : 'Fashion & Kemis'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('coffee');
                setMobileMenuOpen(false);
                handleNavClick('catalog-section');
              }}
              className="p-3 bg-[#F8F5EE] rounded-xl text-left hover:bg-amber-100/50"
            >
              ☕ {language === 'am' ? 'የኢትዮጵያ ቡና' : 'Ethiopian Coffee'}
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <button
              onClick={() => { onOpenSellModal(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-[#BC5228] text-white font-bold rounded-xl text-xs text-center"
            >
              {language === 'am' ? 'በጉሊት ይሽጡ' : 'Sell on Gulit'}
            </button>

            <button
              onClick={() => { onOpenCeremonyBuilder(); setMobileMenuOpen(false); }}
              className="w-full py-2 bg-stone-100 text-stone-800 font-semibold rounded-xl text-xs"
            >
              {language === 'am' ? 'የቡና ሥነ-ሥርዓት ጥቅል (-15%)' : 'Ceremony Kit Deal (-15%)'}
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
