'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  QrCode,
  Mail,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Copy,
  Clock,
  Sparkles,
  Lock,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import QrCodeDisplay from './QrCodeDisplay';
import {
  getCurrentDeviceInfo,
  trustCurrentDevice,
  generate2FAEmailCode,
  getActive2FAEmailCode,
  verify2FAEmailCode,
  create2FAQrSession,
  approve2FAQrSession,
  checkIsQrSessionApproved,
  verify2FATotpCode,
  type DeviceInfo,
} from '@/lib/deviceTrust';
import { sendVerificationCode } from '@/lib/api';

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  username: string;
  email: string;
  role?: string;
  lang?: string;
  onSuccess: (trusted: boolean) => void;
  onCancel: () => void;
}

export default function TwoFactorAuthModal({
  isOpen,
  username,
  email,
  role = 'student',
  lang = 'fr',
  onSuccess,
  onCancel,
}: TwoFactorAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'email'>('qr');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email code state
  const [emailDigits, setEmailDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string | null>(null);
  const [emailTimer, setEmailTimer] = useState<number>(60);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // QR Session state
  const [qrSession, setQrSession] = useState<{
    sessionId: string;
    secret: string;
    qrPayload: string;
    expiresAt: number;
  } | null>(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(120);
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const totpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isAr = lang === 'ar';
  const isEn = lang === 'en';

  // Initialize device info & sessions when opened
  useEffect(() => {
    if (isOpen) {
      const dev = getCurrentDeviceInfo();
      setDeviceInfo(dev);
      setError('');
      setIsSuccess(false);

      // Create initial QR session
      const newQr = create2FAQrSession(username);
      setQrSession(newQr);
      setQrSecondsLeft(120);

      // Initialize or retrieve active email code
      const targetEmail = email || `${username.toLowerCase()}@scholar.ma`;
      let activeCodeRecord = getActive2FAEmailCode(targetEmail);
      if (!activeCodeRecord) {
        const generated = generate2FAEmailCode(targetEmail);
        setSimulatedEmailCode(generated);
        // Dispatch optional real API call
        sendVerificationCode(targetEmail).catch(() => {});
      } else {
        setSimulatedEmailCode(activeCodeRecord.code);
      }
      setEmailTimer(60);
      setCanResendEmail(false);
    }
  }, [isOpen, username, email]);

  // QR countdown timer and approval poller
  useEffect(() => {
    if (!isOpen || !qrSession) return;

    const interval = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          // Auto refresh expired QR session
          const refreshed = create2FAQrSession(username);
          setQrSession(refreshed);
          return 120;
        }
        return prev - 1;
      });

      // Check if session was approved by a trusted phone / simulation
      if (checkIsQrSessionApproved(qrSession.sessionId)) {
        handleVerificationSuccess();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, qrSession]);

  // Email resend countdown timer
  useEffect(() => {
    if (!isOpen) return;
    if (emailTimer <= 0) {
      setCanResendEmail(true);
      return;
    }
    const timer = setInterval(() => {
      setEmailTimer((prev) => {
        if (prev <= 1) {
          setCanResendEmail(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, emailTimer]);

  // Listen to 2FA code events
  useEffect(() => {
    const handleCodeGenerated = (e: any) => {
      if (e.detail?.code) {
        setSimulatedEmailCode(e.detail.code);
      }
    };
    const handleQrApproved = (e: any) => {
      if (qrSession && e.detail?.sessionId === qrSession.sessionId) {
        handleVerificationSuccess();
      }
    };

    window.addEventListener('scholarchina_2fa_code_generated', handleCodeGenerated);
    window.addEventListener('scholarchina_qr_session_approved', handleQrApproved);

    return () => {
      window.removeEventListener('scholarchina_2fa_code_generated', handleCodeGenerated);
      window.removeEventListener('scholarchina_qr_session_approved', handleQrApproved);
    };
  }, [qrSession]);

  const handleVerificationSuccess = () => {
    setIsSuccess(true);
    setError('');
    if (trustDevice) {
      trustCurrentDevice(username, 30);
    }
    setTimeout(() => {
      onSuccess(trustDevice);
    }, 1200);
  };

  // Email Code handling
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const updated = [...emailDigits];

    if (clean.length > 1) {
      // Pasted multi-digit
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((ch, i) => {
        if (i < 6) updated[i] = ch;
      });
      setEmailDigits(updated);
      const nextIdx = Math.min(5, pasted.length);
      digitInputRefs.current[nextIdx]?.focus();
      return;
    }

    updated[index] = clean;
    setEmailDigits(updated);

    if (clean && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = emailDigits.join('');
    if (fullCode.length !== 6) {
      setError(
        isAr
          ? 'الرجاء إدخال الرمز المكون من 6 أرقام بالكامل.'
          : isEn
          ? 'Please enter the complete 6-digit verification code.'
          : 'Veuillez saisir le code complet à 6 chiffres.'
      );
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      const targetEmail = email || `${username.toLowerCase()}@scholar.ma`;
      const isValid = verify2FAEmailCode(targetEmail, fullCode);

      if (isValid) {
        handleVerificationSuccess();
      } else {
        setError(
          isAr
            ? 'رمز التحقق غير صحيح أو منتهي الصلاحية. تفضل بطلب رمز جديد.'
            : isEn
            ? 'Invalid or expired verification code. Please request a new one.'
            : 'Code de vérification invalide ou expiré. Veuillez réessayer.'
        );
      }
      setIsVerifying(false);
    }, 600);
  };

  const handleResendEmailCode = () => {
    if (!canResendEmail) return;
    const targetEmail = email || `${username.toLowerCase()}@scholar.ma`;
    const newCode = generate2FAEmailCode(targetEmail);
    setSimulatedEmailCode(newCode);
    setEmailTimer(60);
    setCanResendEmail(false);
    setEmailDigits(['', '', '', '', '', '']);
    setError('');
    digitInputRefs.current[0]?.focus();
    sendVerificationCode(targetEmail).catch(() => {});
  };

  const handleAutoFillEmailCode = () => {
    if (!simulatedEmailCode) return;
    const parts = simulatedEmailCode.split('');
    setEmailDigits(parts);
    setError('');
  };

  // QR Code handling
  const handleTotpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const updated = [...totpDigits];

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((ch, i) => {
        if (i < 6) updated[i] = ch;
      });
      setTotpDigits(updated);
      const nextIdx = Math.min(5, pasted.length);
      totpInputRefs.current[nextIdx]?.focus();
      return;
    }

    updated[index] = clean;
    setTotpDigits(updated);

    if (clean && index < 5) {
      totpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      totpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyTotp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = totpDigits.join('');
    if (fullCode.length !== 6) {
      setError(
        isAr
          ? 'الرجاء إدخال رمز التطبيق (TOTP) المكون من 6 أرقام.'
          : isEn
          ? 'Please enter the 6-digit TOTP code from your authenticator.'
          : "Veuillez saisir le code TOTP à 6 chiffres de l'application."
      );
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      const isValid = verify2FATotpCode(fullCode);
      if (isValid) {
        handleVerificationSuccess();
      } else {
        setError(
          isAr
            ? 'رمز التطبيق غير صحيح. يرجى التأكد من التوقيت على هاتفك.'
            : isEn
            ? 'Incorrect TOTP code. Please check your authenticator app.'
            : "Code TOTP incorrect. Veuillez vérifier l'heure sur votre application."
        );
      }
      setIsVerifying(false);
    }, 600);
  };

  const handleSimulateQrApproval = () => {
    if (!qrSession) return;
    setIsVerifying(true);
    setTimeout(() => {
      approve2FAQrSession(qrSession.sessionId);
      setIsVerifying(false);
    }, 600);
  };

  if (!isOpen) return null;

  const targetEmail = email || `${username.toLowerCase()}@scholar.ma`;
  const maskedEmail = targetEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => {
    const stars = '*'.repeat(Math.max(2, b.length));
    return `${a}${stars}${c}`;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white"
        >
          {/* Top Decorative Cyber Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          {/* Success Overlay Animation */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isAr
                  ? '✅ تم التحقق بنجاح!'
                  : isEn
                  ? '✅ Identity Verified Successfully!'
                  : '✅ Identité Vérifiée avec Succès !'}
              </h3>
              <p className="text-sm text-slate-300 max-w-xs">
                {isAr
                  ? 'تم اعتماد الجهاز وتسجيل الدخول إلى حسابك...'
                  : isEn
                  ? 'Device approved. Logging in to your portal...'
                  : 'Appareil approuvé. Connexion à votre portail en cours...'}
              </p>
            </motion.div>
          )}

          <div className="p-6 md:p-7">
            {/* Header with Shield & Device Badge */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {isAr
                      ? 'التحقق بخطوتين (2FA)'
                      : isEn
                      ? 'Two-Factor Authentication (2FA)'
                      : 'Double Authentification (2FA)'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {isAr
                    ? 'رصد محاولة دخول من جهاز جديد'
                    : isEn
                    ? 'New Device Login Detected'
                    : 'Nouvel Appareil Détecté'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? `لحماية حسابك (@${username})، اختر إحدى الطريقتين لتأكيد هويتك:`
                    : isEn
                    ? `To protect account @${username}, choose one of two secure methods to confirm your identity:`
                    : `Pour protéger le compte @${username}, confirmez votre identité via l'un des deux choix suivants :`}
                </p>
              </div>

              {/* Detected Device Icon Box */}
              {deviceInfo && (
                <div className="hidden sm:flex flex-col items-end text-right p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium text-cyan-300">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{deviceInfo.browser}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{deviceInfo.os}</span>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* TWO CHOICES TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('qr');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'qr'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {isAr
                    ? '1. رمز الاستجابة (QR Code)'
                    : isEn
                    ? '1. Scan QR Code'
                    : '1. Scanner Code QR'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'email'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>
                  {isAr
                    ? '2. رمز البريد (Email)'
                    : isEn
                    ? '2. Email Code'
                    : '2. Code par Email'}
                </span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-4">
              {/* ─────────────────────────────────────────────────────────────
                  CHOICE 1: QR CODE VERIFICATION
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'qr' && (
                <motion.div
                  key="tab-qr"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70">
                    {/* Visual QR Code Display */}
                    <div className="shrink-0 flex flex-col items-center">
                      <QrCodeDisplay
                        payload={qrSession?.qrPayload || 'otpauth://totp/ScholarChina'}
                        size={170}
                        showScanAnimation={true}
                      />
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>
                          {isAr ? 'ينتهي خلال' : isEn ? 'Expires in' : 'Expire dans'}:{' '}
                          <span className="font-mono text-cyan-300 font-bold">
                            {Math.floor(qrSecondsLeft / 60)}:
                            {(qrSecondsLeft % 60).toString().padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* QR Instructions & Actions */}
                    <div className="flex-1 space-y-3 text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          {isAr
                            ? 'امسح الرمز بهاتفك المعتمد'
                            : isEn
                            ? 'Scan with your approved phone'
                            : 'Scannez avec votre téléphone approuvé'}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {isAr
                            ? 'افتح كاميرا الهاتف أو تطبيق ScholarChina أو Google Authenticator لمسح الرمز والموافقة الفورية.'
                            : isEn
                            ? 'Open your phone camera, ScholarChina app, or Google Authenticator to scan and approve instantly.'
                            : 'Ouvrez votre appareil photo, application ScholarChina ou Google Authenticator pour approuver.'}
                        </p>
                      </div>

                      {/* Fast Instant Approval Simulation Button */}
                      <button
                        type="button"
                        onClick={handleSimulateQrApproval}
                        disabled={isVerifying}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all border border-emerald-400/30"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>
                          {isAr
                            ? '📲 موافقة فورية من الهاتف المعتمد (تجربة)'
                            : isEn
                            ? '📲 Approve from Trusted Phone (Simulate)'
                            : "📲 Approuver depuis l'appareil connecté (Test)"}
                        </span>
                      </button>

                      {/* Secret Code text */}
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="truncate font-mono">
                          Clé secrète: <span className="text-amber-300">{qrSession?.secret || 'JBSWY3DPEHPK3PXP'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (qrSession?.secret) {
                              navigator.clipboard.writeText(qrSession.secret);
                            }
                          }}
                          className="text-cyan-400 hover:text-cyan-300 ml-1 shrink-0"
                          title="Copier la clé"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Or Enter 6-digit TOTP code manually */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        {isAr
                          ? 'أو أدخل رمز 6 أرقام من تطبيق Authenticator:'
                          : isEn
                          ? 'Or enter 6-digit code from Authenticator app:'
                          : "Ou saisissez le code à 6 chiffres de l'application :"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Ex: Google Authenticator</span>
                    </label>

                    <div className="flex items-center gap-2 justify-center mb-3">
                      {totpDigits.map((val, idx) => (
                        <input
                          key={`totp-${idx}`}
                          ref={(el) => {
                            totpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          onChange={(e) => handleTotpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleTotpKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl bg-slate-800/90 border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyTotp()}
                      disabled={isVerifying || totpDigits.join('').length !== 6}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>
                        {isAr
                          ? 'تأكيد رمز التطبيق ومتابعة الدخول'
                          : isEn
                          ? 'Verify App Code & Sign In'
                          : 'Valider le code et se connecter'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  CHOICE 2: EMAIL VERIFICATION CODE
                  ───────────────────────────────────────────────────────────── */}
              {activeTab === 'email' && (
                <motion.div
                  key="tab-email"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Email Target Header */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        {isAr ? 'البريد المسجل:' : isEn ? 'Registered email:' : 'Email destinataire :'}
                      </span>
                      <span className="font-mono font-semibold text-white">{maskedEmail}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      {isAr ? 'تم الإرسال' : isEn ? 'Sent' : 'Code envoyé'}
                    </span>
                  </div>

                  {/* Real-time Email Simulation Banner */}
                  {simulatedEmailCode && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-blue-950/70 border border-blue-500/40 text-xs text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                        <div>
                          <span className="font-semibold text-white">
                            {isAr ? '📩 إشعار وصول البريد:' : isEn ? '📩 Incoming Email Preview:' : '📩 Notification Email reçu :'}
                          </span>{' '}
                          <span>Code:</span>{' '}
                          <span className="font-mono font-bold text-cyan-300 text-sm tracking-wider">
                            {simulatedEmailCode}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoFillEmailCode}
                        className="py-1 px-2.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white font-semibold text-[11px] self-start sm:self-auto transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isAr ? 'تعبئة تلقائية' : isEn ? 'Auto Fill' : 'Remplir auto'}</span>
                      </button>
                    </motion.div>
                  )}

                  {/* 6 Digit Input Boxes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2.5 text-center">
                      {isAr
                        ? 'أدخل رمز الأمان المكون من 6 أرقام:'
                        : isEn
                        ? 'Enter the 6-digit security code:'
                        : 'Saisissez le code de sécurité à 6 chiffres :'}
                    </label>

                    <div className="flex items-center gap-2 justify-center mb-3">
                      {emailDigits.map((val, idx) => (
                        <input
                          key={`email-${idx}`}
                          ref={(el) => {
                            digitInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl bg-slate-800/90 border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all"
                        />
                      ))}
                    </div>

                    {/* Resend Code Button & Timer */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>
                        {isAr ? 'لم تستلم الرمز؟' : isEn ? "Didn't get the code?" : 'Pas reçu de code ?'}
                      </span>
                      {canResendEmail ? (
                        <button
                          type="button"
                          onClick={handleResendEmailCode}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إعادة الإرسال الآن' : isEn ? 'Resend Now' : 'Renvoyer le code'}</span>
                        </button>
                      ) : (
                        <span className="font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{isAr ? 'إعادة الإرسال خلال' : isEn ? 'Resend in' : 'Renvoyer dans'} {emailTimer}s</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit Email Code Button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyEmail()}
                    disabled={isVerifying || emailDigits.join('').length !== 6}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {isAr
                        ? 'تأكيد الرمز وتسجيل الدخول'
                        : isEn
                        ? 'Verify Code & Sign In'
                        : 'Vérifier le code et se connecter'}
                    </span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* TRUST DEVICE CHECKBOX (30 DAYS) */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 group select-none">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <div className="space-y-0.5">
                  <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {isAr
                      ? 'تذكر هذا الجهاز لمدة 30 يوماً'
                      : isEn
                      ? 'Trust this device for 30 days'
                      : 'Faire confiance à cet appareil pendant 30 jours'}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'لن يتم طلب التحقق بخطوتين مجدداً على هذا المتصفح خلال هذه الفترة.'
                      : isEn
                      ? 'Two-factor authentication will not be required on this browser during this period.'
                      : 'La double authentification ne sera plus requise sur ce navigateur pendant 30 jours.'}
                  </p>
                </div>
              </label>
            </div>

            {/* BACK / CANCEL LINK */}
            <div className="mt-4 pt-3 text-center border-t border-slate-800/80">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {isAr
                    ? 'إلغاء والعودة لشاشة تسجيل الدخول'
                    : isEn
                    ? 'Cancel and return to sign in'
                    : 'Annuler et revenir à la connexion'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
