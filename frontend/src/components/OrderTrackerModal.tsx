import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { Language, Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  recentOrders: Order[];
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  language,
  recentOrders
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(
    recentOrders[0] || {
      id: 'demo-1',
      orderNumber: 'SHG-948210',
      date: 'Aug 29, 2026',
      items: [],
      subtotalETB: 4200,
      subtotalUSD: 45,
      shippingFeeETB: 0,
      shippingFeeUSD: 0,
      discountETB: 0,
      discountUSD: 0,
      totalETB: 4200,
      totalUSD: 45,
      currency: 'ETB',
      deliveryAddress: {
        fullName: 'Selamawit Bekele',
        phone: '0911554433',
        email: 'selam@example.com',
        destinationType: 'ethiopia',
        city: 'Addis Ababa',
        subCityOrWoreda: 'Bole (ቦሌ)',
        specificHouseOrLandmark: 'Around Edna Mall',
        country: 'Ethiopia'
      },
      shippingMethod: 'sheger_express',
      paymentMethod: 'telebirr',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      trackingNumber: 'ET-EXP-88492019',
      estimatedDelivery: 'Today by 5:30 PM'
    }
  );

  const steps = [
    { key: 'confirmed', titleEn: 'Order Confirmed', titleAm: 'ትዕዛዝ ተረጋግጧል', descEn: 'Telebirr/Payment verified by Sheger Souq', descAm: 'ክፍያ በቴሌብር ተረጋግጧል' },
    { key: 'crafting', titleEn: 'Artisan Packaging', titleAm: 'በጥንቃቄ እየታሸገ ነው', descEn: 'Direct from Shiro Meda & Yirgacheffe harvest', descAm: 'ከሽሮ ሜዳና ይርጋጨፌ ታሽጓል' },
    { key: 'shipped', titleEn: 'Dispatched via Courier', titleAm: 'ለአሽከርካሪ ተላልፏል', descEn: 'In transit with Sheger Express Motor Logistics', descAm: 'በሸገር ፈጣን ሞተር በመጓዝ ላይ' },
    { key: 'out_for_delivery', titleEn: 'Out for Delivery', titleAm: 'በመድረስ ላይ ነው', descEn: 'Courier is approaching destination in Addis Ababa', descAm: 'አሽከርካሪው ወደ አድራሻዎ እየቀረበ ነው' },
    { key: 'delivered', titleEn: 'Delivered', titleAm: 'ተረክቧል', descEn: 'Successfully handed to customer', descAm: 'ለደንበኛ ደርሷል' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = recentOrders.find(
      (o) => o.orderNumber.toLowerCase().includes(query.toLowerCase()) || 
             o.trackingNumber.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setActiveTrackingOrder(found);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="order-tracker-modal"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200"
      >
        <div className="tibeb-border-gradient h-2 w-full"></div>

        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-ethiopia text-lg sm:text-xl font-bold">
                {language === 'am' ? 'የትዕዛዝ መከታተያ' : 'Order Live Tracking'}
              </h2>
              <p className="text-xs text-stone-300">
                {language === 'am' ? 'የትዕዛዝ ቁጥርዎን በማስገባት የእቃዎን ሁኔታ ይከታተሉ' : 'Track your package delivery status in real-time'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === 'am' ? 'የትዕዛዝ ቁጥር (ለምሳሌ SHG-948210)' : 'Order / Tracking Number (e.g. SHG-948210)'}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:border-amber-600"
              />
            </div>
            <button
              type="submit"
              className="bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              {language === 'am' ? 'ፈልግ' : 'Track'}
            </button>
          </form>

          {activeTrackingOrder ? (
            <div className="space-y-6">
              
              {/* Order Banner */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                    {language === 'am' ? 'የትዕዛዝ መለያ' : 'Tracking Information'}
                  </span>
                  <p className="font-bold text-sm text-stone-900 font-mono">
                    #{activeTrackingOrder.orderNumber}
                  </p>
                  <span className="text-stone-500 text-[11px]">
                    Placed on {activeTrackingOrder.date}
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeTrackingOrder.estimatedDelivery}
                  </span>
                  <span className="text-stone-500 text-[11px] block mt-1">
                    {activeTrackingOrder.deliveryAddress.city} • {activeTrackingOrder.deliveryAddress.subCityOrWoreda}
                  </span>
                </div>
              </div>

              {/* Progress Steps Visual Timeline */}
              <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                {steps.map((s, idx) => {
                  const isCurrent = idx === 2; // For demo visual
                  const isDone = idx <= 2;

                  return (
                    <div key={s.key} className="relative flex items-start gap-3">
                      <div 
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
                          isDone ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div className="text-xs">
                        <p className={`font-bold ${isCurrent ? 'text-amber-900 text-sm' : isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                          {language === 'am' ? s.titleAm : s.titleEn}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {language === 'am' ? s.descAm : s.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <p className="text-center text-xs text-stone-500 py-6">
              {language === 'am' ? 'ምንም ትዕዛዝ አልተገኘም' : 'No order found with this tracking code.'}
            </p>
          )}

        </div>
      </div>
    </div>
  );
};
