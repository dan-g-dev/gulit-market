import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutGrid, Package, ShoppingCart, Tag, Store, Plus, Trash2, Edit3,
  X, ArrowLeft, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { Language } from '../types';
import { listingsApi, sellersApi, offersApi, catalogApi, ordersApi, ApiError } from '../services/api';

interface SellerDashboardProps {
  language: Language;
  onClose: () => void;
}

type Tab = 'overview' | 'listings' | 'orders' | 'offers' | 'profile';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ language, onClose }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, o, of, p, cats, locs] = await Promise.all([
        sellersApi.myListings(),
        sellersApi.myOrders(),
        offersApi.listMine(),
        sellersApi.getMyProfile(),
        catalogApi.categories(),
        catalogApi.locations(),
      ]);
      setListings(l.listings);
      setOrders(o.orders);
      setOffers(of.offers);
      setProfile(p.seller);
      setCategories(cats.categories);
      setLocations(locs.locations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleListingStatus = async (listing: any) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    await listingsApi.update(listing.id, { status: newStatus });
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l)));
  };

  const deleteListing = async (id: number) => {
    if (!confirm(language === 'am' ? 'እርግጠኛ ነዎት?' : 'Delete this listing?')) return;
    await listingsApi.remove(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const respondToOffer = async (offerId: number, status: 'accepted' | 'rejected') => {
    const updated = await offersApi.respond(offerId, { status });
    setOffers((prev) => prev.map((o) => (o.id === offerId ? updated.offer : o)));
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    await ordersApi.updateStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const pendingOffers = offers.filter((o) => o.status === 'pending' && o.sellerId === profile?.userId).length;

  const tabs: { id: Tab; label: string; labelAm: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', labelAm: 'አጠቃላይ እይታ', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'listings', label: 'Listings', labelAm: 'ዕቃዎች', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', labelAm: 'ትዕዛዞች', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'offers', label: 'Offers', labelAm: 'ቅናሽ ጥያቄዎች', icon: <Tag className="w-4 h-4" /> },
    { id: 'profile', label: 'Store Profile', labelAm: 'የመደብር መገለጫ', icon: <Store className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <div className="bg-stone-900 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif-ethiopia text-lg font-bold">
                {language === 'am' ? 'የሻጭ ዳሽቦርድ' : 'Seller Dashboard'}
              </h1>
              <p className="text-xs text-stone-400">{profile?.storeName}</p>
            </div>
          </div>
          {pendingOffers > 0 && (
            <span className="bg-amber-500 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingOffers} {language === 'am' ? 'አዲስ ጥያቄ' : 'new offers'}
            </span>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                tab === t.id ? 'border-amber-500 text-white' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.icon}
              {language === 'am' ? t.labelAm : t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-6 text-center">{error}</div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label={language === 'am' ? 'ጠቅላላ ዕቃዎች' : 'Total Listings'} value={listings.length} />
                <StatCard label={language === 'am' ? 'ንቁ ዕቃዎች' : 'Active Listings'} value={activeCount} />
                <StatCard label={language === 'am' ? 'ትዕዛዞች' : 'Orders'} value={orders.length} />
                <StatCard label={language === 'am' ? 'ደረጃ' : 'Rating'} value={profile?.rating ?? '—'} />
              </div>
            )}

            {tab === 'listings' && (
              <ListingsTab
                language={language}
                listings={listings}
                categories={categories}
                locations={locations}
                showCreateForm={showCreateForm}
                setShowCreateForm={setShowCreateForm}
                onCreated={(listing) => { setListings((prev) => [listing, ...prev]); setShowCreateForm(false); }}
                onToggleStatus={toggleListingStatus}
                onDelete={deleteListing}
              />
            )}

            {tab === 'orders' && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 text-stone-500 text-left">
                    <tr>
                      <th className="p-3 font-semibold">Order #</th>
                      <th className="p-3 font-semibold">Total</th>
                      <th className="p-3 font-semibold">Payment</th>
                      <th className="p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-stone-400">
                        {language === 'am' ? 'ምንም ትዕዛዝ የለም' : 'No orders yet'}
                      </td></tr>
                    ) : orders.map((o) => (
                      <tr key={o.id} className="border-t border-stone-100">
                        <td className="p-3 font-mono">{o.orderNumber}</td>
                        <td className="p-3 font-semibold">{o.totalETB.toLocaleString()} ETB</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{o.paymentStatus}</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'offers' && (
              <div className="space-y-3">
                {offers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400 text-sm">
                    {language === 'am' ? 'ምንም ቅናሽ ጥያቄ የለም' : 'No offers yet'}
                  </div>
                ) : offers.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                    <div className="text-xs">
                      <p className="font-bold text-stone-900">Offer: {o.amountETB.toLocaleString()} ETB</p>
                      {o.message && <p className="text-stone-500 mt-0.5">"{o.message}"</p>}
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'accepted' ? 'bg-emerald-100 text-emerald-700'
                        : o.status === 'rejected' ? 'bg-red-100 text-red-700'
                        : o.status === 'countered' ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>{o.status}</span>
                    </div>
                    {o.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => respondToOffer(o.id, 'accepted')} className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 cursor-pointer">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => respondToOffer(o.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 cursor-pointer">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'profile' && profile && (
              <ProfileTab language={language} profile={profile} onSaved={setProfile} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-stone-200 p-4">
    <p className="text-2xl font-bold text-stone-900 font-serif-ethiopia">{value}</p>
    <p className="text-xs text-stone-500 mt-1">{label}</p>
  </div>
);

const ListingsTab: React.FC<{
  language: Language;
  listings: any[];
  categories: any[];
  locations: any[];
  showCreateForm: boolean;
  setShowCreateForm: (v: boolean) => void;
  onCreated: (listing: any) => void;
  onToggleStatus: (listing: any) => void;
  onDelete: (id: number) => void;
}> = ({ language, listings, categories, locations, showCreateForm, setShowCreateForm, onCreated, onToggleStatus, onDelete }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [priceETB, setPriceETB] = useState('');
  const [condition, setCondition] = useState('good');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const flatCategories = categories.flatMap((c) => [c, ...(c.subcategories || [])]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !categoryId || !locationId || !priceETB) {
      setFormError(language === 'am' ? 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ' : 'Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await listingsApi.create({
        title,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        priceETB: Number(priceETB),
        condition,
        description,
        isNegotiable,
        images: imageUrl ? [imageUrl] : [],
      });
      onCreated(res.listing);
      setTitle(''); setCategoryId(''); setLocationId(''); setPriceETB(''); setDescription(''); setImageUrl(''); setIsNegotiable(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm
            ? (language === 'am' ? 'ዝጋ' : 'Cancel')
            : (language === 'am' ? 'አዲስ ዕቃ ጨምር' : 'Add Listing')}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
          {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">{formError}</div>}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-stone-900" />
          <div className="grid grid-cols-2 gap-3">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="">Category</option>
              {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="">Location</option>
              {locations.flatMap((l: any) => [l, ...(l.districts || [])]).map((l: any) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={priceETB} onChange={(e) => setPriceETB(e.target.value)} placeholder="Price (ETB)" required
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
            <select value={condition} onChange={(e) => setCondition(e.target.value)}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="for_parts">For Parts</option>
            </select>
          </div>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)"
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3}
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
          <label className="flex items-center gap-2 text-xs text-stone-600">
            <input type="checkbox" checked={isNegotiable} onChange={(e) => setIsNegotiable(e.target.checked)} />
            {language === 'am' ? 'ቅናሽ ጥያቄ ይፈቀዳል' : 'Accept offers (negotiable)'}
          </label>
          <button type="submit" disabled={submitting}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-bold py-2.5 rounded-xl cursor-pointer">
            {submitting ? '...' : (language === 'am' ? 'ዕቃ አትም' : 'Publish Listing')}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="p-3 font-semibold">Title</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-stone-400">
                {language === 'am' ? 'ምንም ዕቃ የለም' : 'No listings yet'}
              </td></tr>
            ) : listings.map((l) => (
              <tr key={l.id} className="border-t border-stone-100">
                <td className="p-3 font-semibold text-stone-900">{l.title}</td>
                <td className="p-3">{l.priceETB.toLocaleString()} ETB</td>
                <td className="p-3">
                  <button
                    onClick={() => onToggleStatus(l)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      l.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {l.status}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => onDelete(l.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ language: Language; profile: any; onSaved: (p: any) => void }> = ({ language, profile, onSaved }) => {
  const [storeName, setStoreName] = useState(profile.storeName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await sellersApi.updateMyProfile({ storeName, bio });
      onSaved(res.seller);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 max-w-lg">
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">
          {language === 'am' ? 'የመደብር ስም' : 'Store Name'}
        </label>
        <input value={storeName} onChange={(e) => setStoreName(e.target.value)}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">
          {language === 'am' ? 'ስለ መደብርዎ' : 'About your store'}
        </label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
      </div>
      <button type="submit" disabled={saving}
        className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer">
        {saving ? '...' : (language === 'am' ? 'አስቀምጥ' : 'Save Changes')}
      </button>
    </form>
  );
};
