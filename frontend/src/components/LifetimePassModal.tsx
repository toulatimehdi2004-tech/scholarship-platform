'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, X, ShieldCheck, Zap, Lock, Crown, ArrowRight } from 'lucide-react';
import { activatePremium, getCurrentUser } from '@/lib/api';

interface LifetimePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LifetimePassModal({
  isOpen,
  onClose,
  onSuccess,
}: LifetimePassModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await activatePremium();
      if (res.data?.is_premium) {
        setSuccess(true);
        // refresh stored user
        const u = await getCurrentUser();
        if (u.data) {
          localStorage.setItem('user', JSON.stringify(u.data));
        }
        setTimeout(() => {
          onSuccess?.();
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setError(res.error || 'Failed to activate pass. Please make sure you are signed in.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error processing activation.');
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
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl glass rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl shadow-amber-500/10 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              One-Time Payment • No Subscriptions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Scholar Lifetime VIP Pass
            </h2>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              Unlock the entire database of 100+ Chinese Universities & 400+ Full and Partial Scholarships for life.
            </p>
          </div>

          {/* Pricing Highlight Box */}
          <div className="rounded-2xl p-5 mb-6 bg-gradient-to-br from-amber-500/10 via-purple/10 to-cyan/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-text-primary">$29</span>
                <span className="text-xs text-text-muted line-through">$99</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SAVE 70%
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium mt-1">
                ⚡ Pay once, access forever • Absolutely zero monthly charges
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
              <div className="text-xs text-text-muted">Access Level</div>
              <div className="text-sm font-bold text-cyan">Lifetime Unlimited</div>
            </div>
          </div>

          {/* Comparison Checklist */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              What You Unlock With This One-Time Pass:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              {[
                "All 100+ Top Universities (Unlock beyond 7)",
                "400+ Full & Partial Scholarships (CSC, Presidential)",
                "Direct Official Application Portal Links",
                "Unlimited AI Scholarship Matching Chat",
                "Application Document Checklists",
                "Deadline Notifications & Seat Alerts",
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-text-secondary text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-400 text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>🎉 Lifetime VIP Pass Activated! Unlocking all universities...</span>
            </div>
          )}

          {/* Action Button */}
          {!success && (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-purple text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:opacity-95 transition-all transform hover:scale-[1.01]"
            >
              {loading ? (
                <span>Activating Lifetime Access...</span>
              ) : (
                <>
                  <Crown className="w-5 h-5 text-amber-200" />
                  <span>Unlock All 100+ Universities ($29 — Pay Once)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          <div className="flex items-center justify-center gap-4 text-[11px] text-text-muted mt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Secure Checkout
            </span>
            <span>•</span>
            <span>Instant Access</span>
            <span>•</span>
            <span>One-Time Fee Only</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
