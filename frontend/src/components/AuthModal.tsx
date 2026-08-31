import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Store, ShoppingBag, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthenticated?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, language, onAuthenticated }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ fullName, email, password, phone, role });
      }
      onAuthenticated?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="tibeb-border-gradient h-2 w-full"></div>
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif-ethiopia text-xl font-bold">
              {mode === 'login'
                ? language === 'am' ? 'ግባ' : 'Sign In'
                : language === 'am' ? 'መለያ ፍጠር' : 'Create Account'}
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">Gulit Market ጉሊት ገበያ</p>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">
                  {language === 'am' ? 'ሙሉ ስም' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-900"
                    placeholder="Bethlehem Tadesse"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">
                  {language === 'am' ? 'ስልክ' : 'Phone'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-900"
                    placeholder="+251911000000"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block">
                  {language === 'am' ? 'መለያ አይነት' : 'Account Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      role === 'customer' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-300 text-stone-600'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {language === 'am' ? 'ገዢ' : 'Buyer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      role === 'seller' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-300 text-stone-600'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    {language === 'am' ? 'ሻጭ' : 'Seller'}
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-900"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">
              {language === 'am' ? 'የይለፍ ቃል' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-stone-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-emerald-700/20 cursor-pointer transition-all"
          >
            {loading
              ? '...'
              : mode === 'login'
              ? (language === 'am' ? 'ግባ' : 'Sign In')
              : (language === 'am' ? 'መለያ ፍጠር' : 'Create Account')}
          </button>

          <p className="text-center text-xs text-stone-500">
            {mode === 'login' ? (
              <>
                {language === 'am' ? 'መለያ የለዎትም?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => setMode('register')} className="font-bold text-stone-900 cursor-pointer">
                  {language === 'am' ? 'ይመዝገቡ' : 'Sign up'}
                </button>
              </>
            ) : (
              <>
                {language === 'am' ? 'መለያ አለዎት?' : 'Already have an account?'}{' '}
                <button type="button" onClick={() => setMode('login')} className="font-bold text-stone-900 cursor-pointer">
                  {language === 'am' ? 'ይግቡ' : 'Sign in'}
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};
