import React, { useState } from 'react';
import { 
  Coffee, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Decorative Top Border */}
      <div className="tibeb-border-gradient h-1.5 w-full"></div>

      {/* FAQ & Newsletter Section */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive FAQ */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-serif-ethiopia text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.faqTitle}</span>
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-stone-800/80 rounded-xl border border-stone-700/80 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs sm:text-sm font-semibold text-stone-100 flex items-center justify-between gap-2 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-stone-300 border-t border-stone-700/50 pt-2 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Newsletter Signup for Coffee & Cultural Recipes */}
          <div className="lg:col-span-5 bg-gradient-to-br from-stone-800 to-stone-850 p-6 rounded-3xl border border-stone-700 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400">
              <Coffee className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-wider">
                {language === 'am' ? 'የጉሊት ገበያ የባህል መፅሔት' : 'Gulit Market Heritage Journal'}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif-ethiopia text-base sm:text-lg font-bold text-white">
                {language === 'am' ? 'የቡና አፈላል እና የባህላዊ ምግብ አዘገጃጀት' : 'Get Fresh Roasting Guides & Recipes'}
              </h4>
              <p className="text-xs text-stone-400">
                {language === 'am'
                  ? 'ስለ አዲስ የይርጋጨፌ ቡና መከር፣ የበዓል ቅናሾች እና የምግብ አዘገጃጀት መረጃዎችን በኢሜይል ያግኙ።'
                  : 'Receive harvest updates from Yirgacheffe, holiday promos, and authentic Ethiopian culinary recipes.'}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={language === 'am' ? 'የእርስዎን ኢሜይል ያስገቡ...' : 'Enter your email address...'}
                  className="w-full bg-stone-900 border border-stone-600 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-stone-500 focus:border-amber-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <span>{language === 'am' ? 'ይመዝገቡ (ነፃ)' : 'Subscribe for Free'}</span>
              </button>

              {isSubscribed && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'በተሳካ ሁኔታ ተመዝግበዋል! እናመሰግናለን።' : 'Thank you! You are subscribed.'}</span>
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Payment & Logistics Badges */}
        <div className="pt-8 border-t border-stone-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Accepted Payments */}
            <div className="space-y-1.5">
              <span className="text-stone-400 font-semibold text-[11px] block">
                {language === 'am' ? 'የክፍያ አጋሮች' : 'Accepted Payment Methods'}:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 font-bold rounded-lg border border-emerald-800/60 text-xs">
                  ቴሌብር Telebirr
                </span>
                <span className="px-2.5 py-1 bg-purple-950 text-purple-200 font-bold rounded-lg border border-purple-800/60 text-xs">
                  CBE Birr ንግድ ባንክ
                </span>
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 font-medium rounded-lg border border-stone-700 text-xs">
                  Chapa Pay
                </span>
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 font-medium rounded-lg border border-stone-700 text-xs">
                  Visa / Mastercard
                </span>
                <span className="px-2.5 py-1 bg-amber-950 text-amber-300 font-medium rounded-lg border border-amber-800/60 text-xs">
                  Cash on Delivery (Addis)
                </span>
              </div>
            </div>

            {/* Courier Partners */}
            <div className="space-y-1.5">
              <span className="text-stone-400 font-semibold text-[11px] block">
                {language === 'am' ? 'የማድረሻ አጋሮች' : 'Logistics & Delivery Partners'}:
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-stone-800 text-stone-200 font-medium rounded-lg border border-stone-700 text-xs flex items-center gap-1">
                  🛵 Sheger Express Addis
                </span>
                <span className="px-2.5 py-1 bg-amber-900/40 text-amber-300 font-bold rounded-lg border border-amber-700 text-xs">
                  ✈️ DHL Worldwide Express
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright & Heritage Note */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-300">ጉሊት ገበያ • Gulit market</span>
            <span>—</span>
            <span>{t.footerCopyright}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Addis Ababa, Ethiopia</span>
            <span>•</span>
            <span>support@gulitmarket.et</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
