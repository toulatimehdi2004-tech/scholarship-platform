'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  UserPlus,
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { loginUser, registerUser, setToken } from '@/lib/api';
import { useLang } from '@/lib/i18n';

export type PortalAuthRole = 'student' | 'university' | 'provider';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role?: PortalAuthRole;
  canClose?: boolean;
  title?: string;
  subtitle?: string;
}

const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fes',
  'Tangier',
  'Agadir',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Meknes',
  'Temara',
  'Safi',
  'El Jadida',
  'Nador',
  'Beni Mellal',
  'Khouribga',
];

export default function AuthGateModal({
  isOpen,
  onClose,
  onSuccess,
  role = 'student',
  canClose = true,
  title,
  subtitle,
}: AuthGateModalProps) {
  const { t } = useLang();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role metadata
  const roleConfig = {
    student: {
      badge: '🇲🇦 Moroccan Scholar • Student Access',
      badgeColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
      icon: GraduationCap,
      gradient: 'from-emerald-500 via-teal-500 to-cyan',
      defaultTitle: 'Student Sign In & Portal Access',
      defaultSubtitle:
        'Exclusively for Moroccan students seeking full and partial scholarships across 100+ Chinese universities.',
      highlights: [
        '🇲🇦 Exclusively for Moroccan Students',
        '🎓 100+ Chinese Universities & 3D Tours',
        '📜 400+ CSC Full & Partial Scholarships',
        '👑 Lifetime VIP Pass Access',
      ],
      btnText: tab === 'login' ? 'Sign In as Moroccan Student' : 'Create Moroccan Student Account',
    },
    university: {
      badge: '🏛️ University Admissions Officer Desk',
      badgeColor: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40',
      icon: Building2,
      gradient: 'from-amber-400 via-orange-500 to-amber-600',
      defaultTitle: 'University Admissions Sign In',
      defaultSubtitle:
        'Sign in or register your institutional credentials to review Moroccan applicants and manage campus profiles.',
      highlights: [
        '📋 Review Moroccan Student Dossiers',
        '🔍 Evaluate GPAs & Admit/Decline Candidates',
        '✏️ Edit Campus Tagline, Motto & Overview',
        '📊 Manage Listed Scholarships & Seat Quotas',
      ],
      btnText: tab === 'login' ? 'Sign In to Admissions Desk' : 'Register University Credentials',
    },
    provider: {
      badge: '💼 Certified Service Provider Desk',
      badgeColor: 'bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-500/40',
      icon: Briefcase,
      gradient: 'from-rose-500 via-red-600 to-pink-600',
      defaultTitle: 'Service Provider Desk Sign In',
      defaultSubtitle:
        'Sign in or register to manage Moroccan student document translations, legalizations and certified deliverables.',
      highlights: [
        '📑 Sworn Translation & Notarization Queue',
        '📄 Inspect Original Student Diplomas (PDF/PNG)',
        '🇨🇳 Deliver Sworn Mandarin Translations',
        '💰 Track Earnings & Order Payouts',
      ],
      btnText: tab === 'login' ? 'Sign In to Provider Desk' : 'Register Service Provider Account',
    },
  }[role];

  const modalTitle = title || roleConfig.defaultTitle;
  const modalSubtitle = subtitle || roleConfig.defaultSubtitle;
  const RoleIcon = roleConfig.icon;

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
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
            window.location.reload();
          }
        } else {
          setError(res.error || 'Invalid credentials. Please verify your username and password.');
        }
      } else {
        if (!email) {
          setError('Email is required for account registration.');
          setLoading(false);
          return;
        }

        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || username;
        const lastName = nameParts.slice(1).join(' ') || '';

        const res = await registerUser({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        });

        if (res.data) {
          setToken(res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
            window.location.reload();
          }
        } else {
          setError(res.error || 'Registration failed. Username or email may already be in use.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'A network error occurred. Please try again.');
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
          onClick={canClose ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-slate-900 border border-emerald-500/30 text-white shadow-2xl shadow-emerald-500/20 z-10 overflow-hidden max-h-[92vh] overflow-y-auto"
        >
          {/* Close button (only when dismissible) */}
          {canClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Role Header Badge */}
          <div className="text-center mb-5">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 ${roleConfig.badgeColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{roleConfig.badge}</span>
            </span>

            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg text-slate-950`}
            >
              <RoleIcon className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">{modalTitle}</h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-sm mx-auto leading-relaxed">
              {modalSubtitle}
            </p>
          </div>

          {/* Role Highlights */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80">
            {roleConfig.highlights.map((h, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>

          {/* Sign In / Create Account Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </button>
          </div>

          {/* Quick Demo Credentials Fill for Testing */}
          {tab === 'login' && (
            <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-white/70 text-[11px]">Testing platform?</span>
              <button
                type="button"
                onClick={() => {
                  if (role === 'university') {
                    setUsername('admission_officer');
                    setPassword('admissions123456');
                  } else if (role === 'provider') {
                    setUsername('moroccan_translator');
                    setPassword('provider123456');
                  } else {
                    setUsername('yassine_benali');
                    setPassword('student123456');
                  }
                  setError('');
                }}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-all text-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>⚡ Quick Fill Demo:</span>
                <span className="underline">{role === 'university' ? 'PKU Admissions' : role === 'provider' ? 'Sworn Translator' : 'Yassine (Casablanca)'}</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Full Name (Nom & Prénom)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Yassine Benali"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      City in Morocco (المدينة)
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Nationality (الجنسية)
                    </label>
                    <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🇲🇦 Morocco (المغرب)</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 mt-5 shadow-lg bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:brightness-110 text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{roleConfig.btnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/10 text-[11px] text-white/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure authentication powered by Moroccan Scholar • CSC Portal</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
