import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Phone, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Building2, 
  Smartphone, 
  Coins, 
  Check, 
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CartItem, 
  Currency, 
  DeliveryAddress, 
  Language, 
  Order, 
  PaymentMethod 
} from '../types';
import { formatPrice, calculateCartTotals } from '../utils/formatters';

interface PlaceOrderInput {
  fullName: string;
  phone: string;
  email: string;
  destinationType: 'ethiopia' | 'diaspora';
  city: string;
  subCity: string;
  landmark: string;
  country: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  language: Language;
  appliedDiscountPercent: number;
  onOrderPlaced: (order: Order) => void;
  // Calls the real backend (POST /api/orders) and resolves with the
  // created order, mapped into the frontend's Order shape. Throws with a
  // human-readable message on failure (e.g. TeleBirr not configured).
  onPlaceOrder: (input: PlaceOrderInput) => Promise<Order>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  language,
  appliedDiscountPercent,
  onOrderPlaced,
  onPlaceOrder
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  
  // Delivery State
  const [destinationType, setDestinationType] = useState<'ethiopia' | 'diaspora'>('ethiopia');
  const [fullName, setFullName] = useState('Dawit Haile');
  const [phone, setPhone] = useState('0911234567');
  const [email, setEmail] = useState('dawit@example.com');
  const [city, setCity] = useState('Addis Ababa');
  const [subCity, setSubCity] = useState('Bole (ቦሌ)');
  const [landmark, setLandmark] = useState('Near Edna Mall / Cameroon St.');
  const [country, setCountry] = useState('Ethiopia');
  const [postalCode, setPostalCode] = useState('');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'sheger_express' | 'ethiopian_post' | 'dhl_express'>(
    destinationType === 'ethiopia' ? 'sheger_express' : 'dhl_express'
  );

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [telebirrPhone, setTelebirrPhone] = useState('0911234567');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Totals
  const totals = calculateCartTotals(items, shippingMethod, appliedDiscountPercent);

  const addisSubCities = [
    'Bole (ቦሌ)',
    'Yeka (የካ)',
    'Kirkos (ቂርቆስ)',
    'Arada (አራዳ)',
    'Gulele (ጉለሌ)',
    'Lideta (ልደታ)',
    'Nifas Silk-Lafto (ንፋስ ስልክ ላፍቶ)',
    'Kolfe Keranio (ኮልፌ ቀራኒዮ)',
    'Akaki Kality (አቃቂ ቃሊቲ)',
    'Lemi Kura (ለሚ ኩራ)'
  ];

  const regionalCities = [
    'Addis Ababa (አዲስ አበባ)',
    'Hawassa (ሀዋሳ)',
    'Bahir Dar (ባህር ዳር)',
    'Gondar (ጎንደር)',
    'Mekelle (መቀሌ)',
    'Dire Dawa (ድሬዳዋ)',
    'Adama / Nazret (አዳማ)',
    'Jimma (ጅማ)',
    'Harar (ሐረር)',
    'Debre Birhan (ደብረ ብርሃን)',
    'Bishoftu (ቢሾፍቱ)'
  ];

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'cbebirr' || paymentMethod === 'card') {
      setPaymentError(
        language === 'am'
          ? 'ይህ የክፍያ ዘዴ በቅርቡ ይመጣል። እባክዎ ቴሌብር ወይም በደረሰኝ ክፍያን ይምረጡ።'
          : "This payment method isn't available yet. Please choose Telebirr or Cash on Delivery."
      );
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const newOrder = await onPlaceOrder({
        fullName,
        phone,
        email,
        destinationType,
        city,
        subCity,
        landmark,
        country,
        postalCode,
        paymentMethod,
      });

      setPlacedOrder(newOrder);
      onOrderPlaced(newOrder);
      setStep('confirmation');

      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Something went wrong placing your order.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-stone-200"
      >
        <div className="tibeb-border-gradient h-2 w-full"></div>

        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ሸ
            </div>
            <div>
              <h2 className="font-serif-ethiopia text-lg sm:text-xl font-bold">
                {step === 'confirmation'
                  ? (language === 'am' ? 'ትዕዛዝዎ ተረጋግጧል!' : 'Order Placed Successfully!')
                  : (language === 'am' ? 'የግዢ ማጠናቀቂያ እና ክፍያ' : 'Secure Checkout')}
              </h2>
              <p className="text-xs text-stone-300">
                {language === 'am'
                  ? 'በቴሌብር፣ በሲቢኢ ብር ወይም በካርድ ክፍያዎን ያጠናቁ'
                  : 'Pay securely via Telebirr, CBE Birr, or International Card'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        {step !== 'confirmation' && (
          <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step === 'address' ? 'text-amber-800' : 'text-emerald-700'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white ${step === 'address' ? 'bg-amber-800' : 'bg-emerald-600'}`}>
                {step === 'payment' ? '✓' : '1'}
              </span>
              <span>{language === 'am' ? 'የመቀበያ አድራሻ' : '1. Delivery Details'}</span>
            </div>

            <span className="text-stone-300">———</span>

            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amber-800 font-bold' : 'text-stone-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white ${step === 'payment' ? 'bg-amber-800' : 'bg-stone-400'}`}>
                2
              </span>
              <span>{language === 'am' ? 'የክፍያ ዘዴ' : '2. Payment Method'}</span>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1">
          
          {/* STEP 1: Delivery Address */}
          {step === 'address' && (
            <form onSubmit={handleNextToPayment} className="space-y-6">
              
              {/* Domestic vs Diaspora Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('ethiopia');
                    setShippingMethod('sheger_express');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    destinationType === 'ethiopia'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>{language === 'am' ? 'ኢትዮጵያ ውስጥ (አዲስ አበባ እና ክልሎች)' : 'Ethiopia (Addis & Regions)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('diaspora');
                    setShippingMethod('dhl_express');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    destinationType === 'diaspora'
                      ? 'border-amber-700 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>{language === 'am' ? 'ዓለም አቀፍ / ዲያስፖራ (DHL Express)' : 'International Diaspora (DHL)'}</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  {language === 'am' ? 'የተቀባይ መረጃ' : 'Recipient Contact Information'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      {language === 'am' ? 'ሙሉ ስም' : 'Full Name'}:
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Almaz Tadesse"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      {language === 'am' ? 'የስልክ ቁጥር (ቴሌብር / ደውል)' : 'Phone Number (Telebirr / Calls)'}:
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0911 234 567"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl py-2 pl-9 pr-3 text-xs text-stone-900 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    {language === 'am' ? 'ኢሜይል (ለደረሰኝ)' : 'Email Address (For Receipt)'}:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address Details */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  {language === 'am' ? 'የማድረሻ አድራሻ' : 'Delivery Address'}
                </h3>

                {destinationType === 'ethiopia' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          {language === 'am' ? 'ከተማ' : 'City'}:
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-amber-600 outline-none"
                        >
                          {regionalCities.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {city.includes('Addis') && (
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                            {language === 'am' ? 'ክፍለ ከተማ (Sub-City)' : 'Sub-City (Kifle Ketema)'}:
                          </label>
                          <select
                            value={subCity}
                            onChange={(e) => setSubCity(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-amber-600 outline-none"
                          >
                            {addisSubCities.map((sc) => (
                              <option key={sc} value={sc}>{sc}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        {language === 'am' ? 'የሰፈር መጠሪያ / ታዋቂ ቦታ / የቤት ቁጥር' : 'Specific Landmark / Street / House No.'}:
                      </label>
                      <input
                        type="text"
                        required
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder={language === 'am' ? 'ለምሳሌ፡ ቦሌ መድኃኔዓለም ጀርባ፣ ካዛንቺስ ቶታል አጠገብ' : 'e.g. Behind Edna Mall / Kazanchis near Total station'}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">Country:</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. United States, United Kingdom"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">City & State/Province:</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Silver Spring, MD"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">Street Address:</label>
                        <input
                          type="text"
                          required
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="123 Heritage Ave, Apt 4B"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">Postal / ZIP Code:</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="e.g. 20910"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Speed Option */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  {language === 'am' ? 'የማድረሻ ፍጥነት' : 'Delivery Service Speed'}
                </h3>
                
                {destinationType === 'ethiopia' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setShippingMethod('sheger_express')}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                        shippingMethod === 'sheger_express'
                          ? 'border-amber-700 bg-amber-50/70 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🛵</span>
                        <div className="text-xs">
                          <p className="font-bold text-stone-900">
                            {language === 'am' ? 'የሸገር ፈጣን ሞተር ማድረስ' : 'Sheger Express Courier'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {language === 'am' ? 'በ 24 ሰዓት ውስጥ አዲስ አበባ' : 'Same-day in Addis Ababa'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">
                        {totals.subtotalETB >= 1500 ? (language === 'am' ? 'ነፃ' : 'FREE') : '150 ETB'}
                      </span>
                    </div>

                    <div
                      onClick={() => setShippingMethod('ethiopian_post')}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                        shippingMethod === 'ethiopian_post'
                          ? 'border-amber-700 bg-amber-50/70 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">📦</span>
                        <div className="text-xs">
                          <p className="font-bold text-stone-900">
                            {language === 'am' ? 'የኢትዮጵያ ፖስታ / አውቶቡስ' : 'Ethiopian Post & Regional'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {language === 'am' ? 'ከ 2-3 ቀናት በክልሎች' : '2-3 days regional'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-800">250 ETB</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl border border-amber-700 bg-amber-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">✈️</span>
                      <div className="text-xs">
                        <p className="font-bold text-stone-900">DHL Express Worldwide</p>
                        <p className="text-[11px] text-stone-500">3-5 business days international tracked</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-900">$28.00 (3,500 ETB)</span>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button
                type="submit"
                id="next-to-payment-btn"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <span>{language === 'am' ? 'ወደ ክፍያ ምርጫ ይቀጥሉ' : 'Continue to Payment Method'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Payment Method */}
          {step === 'payment' && (
            <div className="space-y-6">
              
              {/* Payment Methods Grid */}
              <div className="space-y-2">
                <label className="font-bold text-xs uppercase tracking-wider text-stone-800 block">
                  {language === 'am' ? 'የክፍያ አማራጭ ይምረጡ' : 'Select Payment Method'}:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Telebirr Option */}
                  <div
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      ብር
                    </div>
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900">Telebirr (ቴሌብር)</p>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Fast & Instant
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {language === 'am' ? 'በስልክ ወይም በ QR ኮድ ክፍያ' : 'Pay via QR Code or *127#'}
                      </p>
                    </div>
                  </div>

                  {/* CBE Birr — not yet implemented on the backend; shown but disabled rather than faked */}
                  <div
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed flex items-start gap-3"
                    title={language === 'am' ? 'በቅርቡ ይመጣል' : 'Coming soon'}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-900 text-purple-200 font-bold text-xs flex items-center justify-center shrink-0">
                      CBE
                    </div>
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900">CBE Birr (ንግድ ባንክ)</p>
                        <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {language === 'am' ? 'በቅርቡ' : 'Coming Soon'}
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {language === 'am' ? 'በሲቢኢ ብር መተግበሪያ ወይም በ *847#' : 'Direct CBE Birr Mobile'}
                      </p>
                    </div>
                  </div>

                  {/* International card — not yet implemented on the backend; shown but disabled */}
                  <div
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed flex items-start gap-3"
                    title={language === 'am' ? 'በቅርቡ ይመጣል' : 'Coming soon'}
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900">Visa / Mastercard / Chapa</p>
                        <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {language === 'am' ? 'በቅርቡ' : 'Coming Soon'}
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {language === 'am' ? 'በዓለም አቀፍ የባንክ ካርዶች' : 'International debit/credit cards'}
                      </p>
                    </div>
                  </div>

                  {/* Cash on Delivery (Addis Only) */}
                  {destinationType === 'ethiopia' && (
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === 'cod'
                          ? 'border-amber-700 bg-amber-50/60 ring-2 ring-amber-500/30'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div className="text-xs flex-1">
                        <p className="font-bold text-stone-900">Cash on Delivery (በደረሰኝ)</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          {language === 'am' ? 'እቃው እጅዎ ሲደርስ ይክፈሉ' : 'Pay when received in Addis'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Dynamic Interactive Payment Instructions Box */}
              {paymentMethod === 'telebirr' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'am' ? 'የቴሌብር ፈጣን ክፍያ መመሪያ' : 'Telebirr Instant Payment Instructions'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-emerald-200/80">
                    {/* Simulated Telebirr QR */}
                    <div className="p-2 bg-white rounded-lg border-2 border-dashed border-emerald-400 flex flex-col items-center">
                      <QrCode className="w-24 h-24 text-emerald-900" />
                      <span className="text-[9px] font-bold text-emerald-800 uppercase mt-1">Scan in Telebirr</span>
                    </div>

                    <div className="text-xs space-y-1.5 flex-1">
                      <p className="text-stone-700">
                        Merchant Name: <strong className="text-stone-950">Sheger Souq Enterprise</strong>
                      </p>
                      <p className="text-stone-700">
                        Merchant Code: <strong className="text-emerald-800 font-mono text-sm">884920</strong>
                      </p>
                      <p className="text-stone-700">
                        Amount to Pay: <strong className="text-stone-950 text-sm">{totals.totalETB.toLocaleString()} ETB</strong>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {language === 'am' 
                          ? 'ወይም በስልክዎ *127# ደውለው የንግድ ክፍያ (Merchant Pay) ቁጥር 884920 በማስገባት መክፈል ይችላሉ።'
                          : 'Or dial *127# on your Ethio Telecom phone, select Merchant Pay and enter 884920.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cbebirr' && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <Building2 className="w-4 h-4 text-purple-800" />
                    <span>CBE Birr Merchant Code: 382910</span>
                  </div>
                  <p className="text-purple-900">
                    {language === 'am'
                      ? 'የንግድ ባንክ CBE Birr መተግበሪያን ከፍተው ወይም በ *847# ክፍያውን ለ Sheger Souq (382910) ያጽድቁ።'
                      : 'Open CBE Birr App or dial *847# to complete payment to Sheger Souq merchant account.'}
                  </p>
                </div>
              )}

              {/* Order Summary Recap */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} items):</span>
                  <span>{formatPrice(totals.subtotalETB, totals.subtotalUSD, currency, language)}</span>
                </div>
                {totals.discountETB > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatPrice(totals.discountETB, totals.discountUSD, currency, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping:</span>
                  <span>{totals.shippingFeeETB === 0 ? 'FREE (Addis Promo)' : formatPrice(totals.shippingFeeETB, totals.shippingFeeUSD, currency, language)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total Due:</span>
                  <span className="font-serif-ethiopia text-lg">
                    {formatPrice(totals.totalETB, totals.totalUSD, currency, language)}
                  </span>
                </div>
              </div>

              {/* Payment error (e.g. TeleBirr not yet configured on the backend) */}
              {paymentError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium">
                  {paymentError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="px-4 py-3 rounded-2xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  {language === 'am' ? 'ተመለስ' : 'Back'}
                </button>

                <button
                  type="button"
                  id="confirm-place-order-btn"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPayment}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isProcessingPayment ? (
                    <span>{language === 'am' ? 'ክፍያው በመረጋገጥ ላይ ነው...' : 'Verifying Payment...'}</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {language === 'am'
                          ? `ትዕዛዝ አጽድቅ (${formatPrice(totals.totalETB, totals.totalUSD, currency, language)})`
                          : `Place Order (${formatPrice(totals.totalETB, totals.totalUSD, currency, language)})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Order Confirmation */}
          {step === 'confirmation' && placedOrder && (
            <div className="text-center space-y-6 py-4">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-ethiopia text-2xl font-bold text-stone-900">
                  {language === 'am' ? 'ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Thank You! Order Confirmed'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  {language === 'am'
                    ? `የትዕዛዝ ቁጥርዎ #${placedOrder.orderNumber} ነው። ማረጋገጫ ወደ ${placedOrder.deliveryAddress.phone} ተልኳል።`
                    : `Order #${placedOrder.orderNumber} is confirmed. SMS receipt sent to ${placedOrder.deliveryAddress.phone}.`}
                </p>
              </div>

              {/* Order Tracking Card */}
              <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 text-left space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                  <div>
                    <span className="text-stone-400 block">Tracking ID:</span>
                    <span className="font-mono font-bold text-stone-900">{placedOrder.trackingNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block">Est. Delivery:</span>
                    <span className="font-semibold text-emerald-700">{placedOrder.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Items Mini List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {placedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-stone-800">
                        {it.quantity}x {language === 'am' ? it.product.nameAm : it.product.nameEn}
                      </span>
                      <span className="font-medium text-stone-900 font-serif-ethiopia">
                        {formatPrice(it.product.priceETB * it.quantity, it.product.priceUSD * it.quantity, currency, language)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-xs sm:text-sm text-stone-950">
                  <span>Total Paid:</span>
                  <span className="font-serif-ethiopia">
                    {formatPrice(placedOrder.totalETB, placedOrder.totalUSD, currency, language)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'am' ? 'ደረሰኝ አትም' : 'Print Invoice'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {language === 'am' ? 'ወደ መገበያያው ተመለስ' : 'Continue Shopping'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
