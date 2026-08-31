import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Coffee, 
  Scissors, 
  Flame, 
  HeartHandshake, 
  ArrowRight
} from 'lucide-react';
import { Language, ProductCategory } from '../types';

interface ArtisanShowcaseProps {
  language: Language;
  onSelectCategory: (category: ProductCategory) => void;
}

export const ArtisanShowcase: React.FC<ArtisanShowcaseProps> = ({
  language,
  onSelectCategory
}) => {
  const artisans = [
    {
      region: 'Shiro Meda, Addis Ababa',
      regionAm: 'ሽሮ ሜዳ፣ አዲስ አበባ',
      craft: 'Handwoven Habesha Kemis & Menen Cotton',
      craftAm: 'የተሸመኑ የሀበሻ ቀሚሶችና መነን ጥጥ',
      quote: 'Weaving each Tibeb line with patience and precision, passing our ancestors’ needlework to the next generation.',
      quoteAm: 'የቀደሙ አባቶቻችንን እና እናቶቻችንን የሸማ ጥበብ ጠብቀን እያንዳንዱን ጥበብ በታላቅ ጥንቃቄ እንሸምናለን።',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
      category: 'clothing' as ProductCategory
    },
    {
      region: 'Gedeo & Yirgacheffe Highlands',
      regionAm: 'ጌዴኦ እና ይርጋጨፌ ተራሮች',
      craft: 'Single-Origin Organic Heirloom Coffee',
      craftAm: 'ተፈጥሯዊ የይርጋጨፌ ልዩ አረቢካ ቡና',
      quote: 'Grown at 2,100 meters under native shade trees, hand-washed in mountain springs to ensure pure floral jasmine notes.',
      quoteAm: 'በከፍተኛ ተራሮች በዛፎች ጥላ ስር የሚበቅል፣ በምንጭ ውሀ የታጠበና ድንቅ የጃስሚን መዓዛ ያለው።',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      category: 'coffee' as ProductCategory
    },
    {
      region: 'Wolleka Pottery, Gondar',
      regionAm: 'ወለቃ የሸክላ መንደር፣ ጎንደር',
      craft: 'Pit-Fired Traditional Black Clay Jebena',
      craftAm: 'በባህላዊ ጉድጓድ የተተኮሰ ጥቁር ሸክላ ጀበና',
      quote: 'Sculpted by hand from natural volcanic river clay to bring the authentic ceremony soul into your home.',
      quoteAm: 'ከተፈጥሮ ሸክላ በእጅ የተበጀ እውነተኛ የቡና ሥነ-ሥርዓት መሣሪያ።',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop',
      category: 'pottery' as ProductCategory
    }
  ];

  return (
    <section id="artisan-showcase-section" className="bg-stone-100/70 border-y border-stone-200 py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-[1680px] mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'am' ? 'እውነተኛ የሀገር ውስጥ ጥበበኞች' : 'Direct Trade & Cultural Preservation'}</span>
          </div>
          <h2 className="font-serif-ethiopia text-2xl sm:text-3xl font-bold text-stone-900">
            {language === 'am' ? 'የኢትዮጵያ የጥበብ መንደሮች እና ባለሙያዎች' : 'Stories from the Cradle of Craft & Coffee'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'am'
              ? 'በሸገር ሱቅ የሚቀርብ እያንዳንዱ ምርት ከማህበራቱ በቀጥታ የሚሰበሰብ ሲሆን አምራቾቹ ተገቢውን የድካም ዋጋ እንዲያገኙ ዋስትና እንሰጣለን።'
              : 'Every purchase directly supports female coffee growers, master Shemano weavers, and traditional potters with fair-trade premiums.'}
          </p>
        </div>

        {/* Artisans Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artisans.map((art, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCategory(art.category)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={art.image}
                    alt={art.craft}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{language === 'am' ? art.regionAm : art.region}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-serif-ethiopia font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors">
                    {language === 'am' ? art.craftAm : art.craft}
                  </h3>
                  <p className="text-xs text-stone-600 italic leading-relaxed">
                    "{language === 'am' ? art.quoteAm : art.quote}"
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-1 text-xs font-bold text-amber-800">
                <span>{language === 'am' ? 'ምርቶቹን ይመልከቱ' : 'Explore Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
