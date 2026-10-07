'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { loginUser, registerUser, setToken, getCurrentUser } from '@/lib/api';
import { useLang } from '@/lib/i18n';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthGateModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In to Access ChinaScholar",
  subtitle = "Explore 100+ Chinese Universities & 400+ Full & Partial Scholarships",
}: AuthGateModalProps) {
  const { t } = useLang();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginUser({ username, password });
        if (res.data) {
          setToken(res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          onSuccess?.();
          onClose();
          window.location.reload();
        } else {
          setError(res.error || 'Invalid credentials. Please try again.');
        }
      } else {
        if (!email) {
          setError('Email is required for registration.');
          setLoading(false);
          return;
        }
        const res = await registerUser({ username, email, password });
        if (res.data) {
          setToken(res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          onSuccess?.();
          onClose();
          window.location.reload();
        } else {
          setError(res.error || 'Registration failed. Please check your details.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Foggy Background Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass rounded-3xl p-6 sm:p-8 border border-cyan/30 shadow-2xl shadow-cyan/20 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan/20">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Value proposition badges */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100+ Universities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan flex-shrink-0" />
              <span>400+ Scholarships</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple flex-shrink-0" />
              <span>7 Free Trial Spots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>One-Time Lifetime Pass</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'btn-gradient text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'btn-gradient text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan text-sm"
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan/20"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In & Unlock Trial' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-text-muted text-center mt-4">
            By signing in, you get free access to 7 Chinese universities and sample scholarships.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
