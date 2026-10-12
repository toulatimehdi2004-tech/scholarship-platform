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
  AlertCircle,
  Mail,
  School,
} from 'lucide-react';
import { loginUser, registerUser, setToken } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { ACCREDITED_UNIVERSITIES, verifyUniversityEmail } from '@/lib/universityRegistry';

export type PortalAuthRole = 'student' | 'university' | 'provider';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onBackToRoles?: () => void;
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
  onBackToRoles,
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
  const [selectedUniId, setSelectedUniId] = useState<number | null>(4); // Default to PKU (Peking Univ)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute email to test for live verification
  const emailToValidate = tab === 'register' ? email : (username.includes('@') ? username : email);
  const isEmailFormat = Boolean(emailToValidate && emailToValidate.includes('@') && emailToValidate.length > 5);
  const liveVerification = role === 'university' && isEmailFormat
    ? verifyUniversityEmail(emailToValidate, selectedUniId)
    : null;

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
      badge: '🏛️ University Admissions Officer Desk • Strict Accreditation Gate',
      badgeColor: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40',
      icon: Building2,
      gradient: 'from-amber-400 via-orange-500 to-amber-600',
      defaultTitle: 'University Admissions Desk',
      defaultSubtitle:
        'Accredited verification: Only verified admissions office emails and official Gmail desks are granted entry.',
      highlights: [
        '🛡️ Official Institutional Verification Required',
        '📋 Review Moroccan Student Dossiers & GPAs',
        '✏️ Update Campus Profile, Motto & Landmarks',
        '📊 Grant CSC Admission Letters to Candidates',
      ],
      btnText: tab === 'login' ? 'Sign In to Admissions Desk' : 'Register Official Admissions Desk',
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
      // Strict institutional email gate for universities
      if (role === 'university') {
        const emailToCheck = tab === 'register' ? email : (username.includes('@') ? username : email);
        
        // Demo exception for standard testing account
        const isDemoBypass = (tab === 'login' && username === 'admission_officer');

        if (!isDemoBypass) {
          if (!emailToCheck) {
            setError("Veuillez renseigner votre email officiel d'admissions ou votre Gmail accrédité.");
            setLoading(false);
            return;
          }
          const check = verifyUniversityEmail(emailToCheck, selectedUniId);
          if (!check.isVerified) {
            setError(
              check.error ||
              "❌ Accès Refusé : Email non accrédité. Cette adresse ne figure pas dans le registre officiel des universités chinoises."
            );
            setLoading(false);
            return;
          }
        }
      }

      if (tab === 'login') {
        const res = await loginUser({
          username,
          password,
          role,
          university_id: selectedUniId || undefined,
        });

        if (res.data) {
          setToken(res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          if (role === 'university') {
            const matchedUni = liveVerification?.university || ACCREDITED_UNIVERSITIES.find((u) => u.id === selectedUniId);
            if (matchedUni) {
              localStorage.setItem('university_accredited', JSON.stringify(matchedUni));
            }
          }
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
            window.location.reload();
          }
        } else {
          setError(res.error || 'Identifiants invalides. Veuillez vérifier vos accès.');
        }
      } else {
        if (!email) {
          setError("L'adresse email est requise pour l'enregistrement.");
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
          role,
          university_id: selectedUniId || undefined,
        });

        if (res.data) {
          setToken(res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          if (role === 'university') {
            const matchedUni = liveVerification?.university || ACCREDITED_UNIVERSITIES.find((u) => u.id === selectedUniId);
            if (matchedUni) {
              localStorage.setItem('university_accredited', JSON.stringify(matchedUni));
            }
          }
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
            window.location.reload();
          }
        } else {
          setError(res.error || "Échec de l'enregistrement. L'adresse email ou le nom d'utilisateur est peut-être déjà utilisé.");
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur réseau est survenue. Veuillez réessayer.');
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
          {/* Back to Role Selection button */}
          {onBackToRoles && (
            <button
              type="button"
              onClick={onBackToRoles}
              className="absolute top-5 left-5 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer shadow-sm"
            >
              <span>← Profils / الأدوار</span>
            </button>
          )}

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
              Create Official Account
            </button>
          </div>

          {/* University Accreditation Test Selector */}
          {role === 'university' && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Tester l'Accréditation (Gmail Officiel vs Rejet) :
                </span>
                <span className="text-[10px] text-amber-400/70 font-mono">102 Universités</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniId(4); // PKU
                    if (tab === 'login') {
                      setUsername('pku.admissions.office@gmail.com');
                      setPassword('admissions123456');
                    } else {
                      setFullName('Peking University ISO Desk');
                      setUsername('pku_iso_desk');
                      setEmail('pku.admissions.office@gmail.com');
                      setPassword('admissions123456');
                    }
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold text-[11px] text-left transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>✅ PKU (Gmail Officiel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniId(1); // Tsinghua
                    if (tab === 'login') {
                      setUsername('tsinghua.admissions.office@gmail.com');
                      setPassword('admissions123456');
                    } else {
                      setFullName('Tsinghua Admissions Office');
                      setUsername('tsinghua_iso_desk');
                      setEmail('tsinghua.admissions.office@gmail.com');
                      setPassword('admissions123456');
                    }
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold text-[11px] text-left transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>✅ Tsinghua (Gmail)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniId(13); // Fudan
                    if (tab === 'login') {
                      setUsername('fudan.iso.admissions@gmail.com');
                      setPassword('admissions123456');
                    } else {
                      setFullName('Fudan International Students Office');
                      setUsername('fudan_iso_desk');
                      setEmail('fudan.iso.admissions@gmail.com');
                      setPassword('admissions123456');
                    }
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold text-[11px] text-left transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>✅ Fudan (Gmail)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniId(4); // PKU
                    if (tab === 'login') {
                      setUsername('hacker_fake_account@gmail.com');
                      setPassword('password123');
                    } else {
                      setFullName('Unauthorized Person');
                      setUsername('fake_imposter');
                      setEmail('hacker_fake_account@gmail.com');
                      setPassword('password123');
                    }
                    setError('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 font-semibold text-[11px] text-left transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>❌ Rejet (Email Faux)</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Fill for Student / Provider */}
          {role !== 'university' && tab === 'login' && (
            <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-white/70 text-[11px]">Testing platform?</span>
              <button
                type="button"
                onClick={() => {
                  if (role === 'provider') {
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
                <span className="underline">{role === 'provider' ? 'Sworn Translator' : 'Yassine (Casablanca)'}</span>
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
            {/* University Selection Dropdown for University Desk */}
            {role === 'university' && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-amber-400" />
                    Université Partenaire Chinoise (Accréditée)
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">102 Universités au total</span>
                </label>
                <select
                  value={selectedUniId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setSelectedUniId(val);
                    setError('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Vérification globale (Toutes les 102 universités) --</option>
                  {ACCREDITED_UNIVERSITIES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                {selectedUniId && (
                  <div className="mt-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex flex-col gap-0.5">
                    <span className="font-semibold text-amber-300">
                      🏛️ Contact officiel attendu dans la base :
                    </span>
                    <span className="font-mono text-[10px] text-amber-100 truncate">
                      • Email officiel : {ACCREDITED_UNIVERSITIES.find((u) => u.id === selectedUniId)?.admissions_email}
                    </span>
                    <span className="font-mono text-[10px] text-amber-100 truncate">
                      • Gmail Admissions : {ACCREDITED_UNIVERSITIES.find((u) => u.id === selectedUniId)?.secondary_email}
                    </span>
                  </div>
                )}
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  {role === 'university' ? 'Nom du Responsable des Admissions / Titre' : 'Full Name (Nom & Prénom)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'university' ? 'e.g. Director Zhang Wei (Admissions Desk)' : 'e.g. Yassine Benali'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center justify-between">
                <span>
                  {role === 'university' && tab === 'login'
                    ? 'Identifiant ou Gmail / Email Officiel'
                    : 'Nom d\'utilisateur (Username)'}
                </span>
                {role === 'university' && tab === 'login' && (
                  <span className="text-[10px] text-amber-400">Email ou Nom d'utilisateur</span>
                )}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  role === 'university' && tab === 'login'
                    ? 'ex: pku.admissions.office@gmail.com'
                    : 'Choose a username'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            {/* Email Field for Registration or University Desk */}
            {(tab === 'register' || (role === 'university' && !username.includes('@'))) && (
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    {role === 'university'
                      ? 'Email Institutionnel ou Gmail Officiel d\'Admissions'
                      : 'Email Address'}
                  </span>
                  {role === 'university' && (
                    <span className="text-[10px] text-amber-400 font-bold">Vérification Obligatoire</span>
                  )}
                </label>
                <input
                  type="email"
                  required={tab === 'register'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'university'
                      ? 'ex: pku.admissions.office@gmail.com ou study@pku.edu.cn'
                      : 'your.email@example.com'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            )}

            {/* LIVE UNIVERSITY ACCREDITATION STATUS BADGE */}
            {role === 'university' && isEmailFormat && (
              <div className="mt-1">
                {liveVerification?.isVerified ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 shadow-md shadow-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <span>✅ Accrédité : Bureau des Admissions Officiel</span>
                        <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-200">
                          ACCÈS VALIDÉ
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                        {liveVerification.university?.name} • Contact accrédité dans notre base officielle (
                        {liveVerification.matchedBy === 'secondary_gmail'
                          ? 'Gmail Officiel'
                          : liveVerification.matchedBy === 'domain'
                          ? 'Domaine Institutionnel'
                          : 'Email Principal Admissions'}
                        ).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 shadow-md shadow-red-500/10">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-red-300">
                        <span>❌ Accès Refusé : Email Non Accrédité</span>
                        <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-red-200">
                          VERROUILLÉ
                        </span>
                      </div>
                      <p className="text-[11px] text-red-200/80 mt-0.5 leading-relaxed">
                        {liveVerification?.error ||
                          "Cette adresse email ne figure pas dans le registre officiel des 102 universités partenaires. Seules les adresses institutionnelles et Gmails d'admissions officiels sont autorisés."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'register' && role === 'student' && (
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
            )}

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Mot de passe (Password)
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
              disabled={loading || (role === 'university' && isEmailFormat && liveVerification?.isVerified === false)}
              className={`w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 mt-5 shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === 'university'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:brightness-110 text-white'
              }`}
            >
              {loading ? (
                <span>Vérification et connexion en cours...</span>
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
            <span>Vérification institutionnelle officielle • Registre des 102 universités partenaires</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
