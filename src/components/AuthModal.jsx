import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('Dr. Surgeon');
  const [avatar, setAvatar] = useState('🩺');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const avatars = ['🩺', '🔬', '📊', '💊', '🫀', '👑', '⚡', '🧬'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = tab === 'signup' ? '/api/auth?action=signup' : '/api/auth?action=login';
      const payload = tab === 'signup' 
        ? { email, password, username, avatar }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user, data.progress);
      onClose();
    } catch (err) {
      setError(err.message || 'Login/Signup failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'guest_surgeon', password: 'guest_pass_123' })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.progress);
        onClose();
      }
    } catch {
      // Fallback guest
      onLoginSuccess({
        id: 'guest_surgeon',
        username: 'Dr. Resident (Guest)',
        email: 'doctor@sqlarcade.med',
        avatar: '🩺'
      }, null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {tab === 'login' ? 'Surgeon Login' : 'Surgeon Registration'}
              </h3>
              <p className="text-[11px] text-slate-500">
                SQL Arcade Cloud Medical Identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`py-1.5 rounded-lg transition-colors ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`py-1.5 rounded-lg transition-colors ${
              tab === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Surgeon Name / Call-Sign
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Dr. Meredith Grey"
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Surgeon Avatar Icon
                </label>
                <div className="flex items-center gap-1.5">
                  {avatars.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setAvatar(av)}
                      className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all ${
                        avatar === av
                          ? 'border-teal-500 bg-teal-50 scale-110 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Email or Medical ID
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-slate-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>{isLoading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Operating Theater' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Guest Login */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="text-xs text-slate-600 hover:text-teal-700 font-medium"
          >
            ⚡ Or continue as <span className="underline font-bold">Guest Surgeon</span> (Instant access)
          </button>
        </div>
      </div>
    </div>
  );
}
