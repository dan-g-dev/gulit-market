import React, { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, Users, Package, ShoppingCart, Tag, ArrowLeft, Loader2, Star, Ban, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { adminApi, catalogApi, ApiError } from '../services/api';

interface AdminDashboardProps {
  language: Language;
  onClose: () => void;
}

type Tab = 'overview' | 'users' | 'listings' | 'orders' | 'categories';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, onClose }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [reports, setReports] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, u, l, o, c] = await Promise.all([
        adminApi.reports(),
        adminApi.users(),
        adminApi.listings(),
        adminApi.orders(),
        catalogApi.categories(),
      ]);
      setReports(r);
      setUsers(u.users);
      setListings(l.listings);
      setOrders(o.orders);
      setCategories(c.categories);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleUserActive = async (u: any) => {
    await adminApi.updateUser(u.id, { isActive: !u.isActive });
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const toggleFeatured = async (listing: any) => {
    await adminApi.moderateListing(listing.id, { isFeatured: !listing.isFeatured });
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, isFeatured: !l.isFeatured } : l)));
  };

  const toggleListingStatus = async (listing: any) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    await adminApi.moderateListing(listing.id, { status: newStatus });
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l)));
  };

  const tabs: { id: Tab; label: string; labelAm: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', labelAm: 'አጠቃላይ እይታ', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'users', label: 'Users', labelAm: 'ተጠቃሚዎች', icon: <Users className="w-4 h-4" /> },
    { id: 'listings', label: 'Listings', labelAm: 'ዕቃዎች', icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', labelAm: 'ትዕዛዞች', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', labelAm: 'ምድቦች', icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <div className="bg-stone-950 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif-ethiopia text-lg font-bold">
            {language === 'am' ? 'የአስተዳዳሪ ዳሽቦርድ' : 'Admin Dashboard'}
          </h1>
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
            {tab === 'overview' && reports && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Users" value={reports.totalUsers} />
                <StatCard label="Sellers" value={reports.totalSellers} />
                <StatCard label="Total Listings" value={reports.totalListings} />
                <StatCard label="Active Listings" value={reports.activeListings} />
                <StatCard label="Total Orders" value={reports.totalOrders} />
                <StatCard label="Paid Revenue" value={`${reports.paidRevenueETB.toLocaleString()} ETB`} />
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 text-stone-500 text-left">
                    <tr>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Email</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-stone-100">
                        <td className="p-3 font-semibold text-stone-900">{u.fullName}</td>
                        <td className="p-3 text-stone-600">{u.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>{u.isActive ? 'active' : 'deactivated'}</span>
                        </td>
                        <td className="p-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => toggleUserActive(u)}
                              className="p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {u.isActive ? <Ban className="w-3.5 h-3.5 text-red-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'listings' && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 text-stone-500 text-left">
                    <tr>
                      <th className="p-3 font-semibold">Title</th>
                      <th className="p-3 font-semibold">Seller</th>
                      <th className="p-3 font-semibold">Price</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-t border-stone-100">
                        <td className="p-3 font-semibold text-stone-900">{l.title}</td>
                        <td className="p-3 text-stone-600">{l.seller?.storeName}</td>
                        <td className="p-3">{l.priceETB.toLocaleString()} ETB</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleListingStatus(l)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                              l.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {l.status}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => toggleFeatured(l)} className="p-1.5 rounded-lg hover:bg-amber-50 cursor-pointer">
                            <Star className={`w-4 h-4 ${l.isFeatured ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-stone-100">
                        <td className="p-3 font-mono">{o.orderNumber}</td>
                        <td className="p-3 font-semibold">{o.totalETB.toLocaleString()} ETB</td>
                        <td className="p-3 capitalize">{o.paymentProvider?.replace('_', ' ')} — {o.paymentStatus}</td>
                        <td className="p-3 capitalize">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'categories' && (
              <CategoriesTab language={language} categories={categories} onReload={loadAll} />
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

const CategoriesTab: React.FC<{ language: Language; categories: any[]; onReload: () => void }> = ({ language, categories, onReload }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSubmitting(true);
    try {
      await adminApi.createCategory({ name, slug });
      setName(''); setSlug('');
      onReload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await adminApi.deleteCategory(id);
    onReload();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none" />
        </div>
        <button type="submit" disabled={submitting} className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer">
          {language === 'am' ? 'ጨምር' : 'Add Category'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {categories.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-stone-900">{c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
