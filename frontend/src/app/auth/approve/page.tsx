'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { approve2FAQrSession } from '@/lib/deviceTrust';

function ApproveContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('s') || searchParams.get('session') || '';
  const username = searchParams.get('u') || searchParams.get('user') || 'Étudiant';

  const [status, setStatus] = useState<'idle' | 'approved' | 'rejected'>('idle');
  const [approvalPin, setApprovalPin] = useState<string>('');
  const [deviceTime, setDeviceTime] = useState<string>('');

  useEffect(() => {
    setDeviceTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    // Generate a fixed 6-digit PIN derived from session ID
    if (sessionId) {
      let hash = 0;
      for (let i = 0; i < sessionId.length; i++) {
        hash = (hash * 31 + sessionId.charCodeAt(i)) % 900000;
      }
      const pin = (100000 + Math.abs(hash)).toString();
      setApprovalPin(pin);
    }
  }, [sessionId]);

  const handleApprove = () => {
    setStatus('approved');
    if (sessionId) {
      approve2FAQrSession(sessionId);
      // Also broadcast via BroadcastChannel for cross-tab or cross-window sync
      try {
        const bc = new BroadcastChannel('scholarchina_2fa_channel');
        bc.postMessage({ type: 'QR_APPROVED', sessionId });
        bc.close();
      } catch {}
    }
  };

  const handleReject = () => {
    setStatus('rejected');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Top Emblem */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 border-2 border-white/20 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <ShieldCheck className="w-9 h-9" />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-cyan-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ScholarChina 2FA Security</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Approbation de Connexion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Une tentative de connexion sur votre compte a été scannée.
          </p>
        </div>

        {/* Pending Request Details Card */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Compte concerné :</span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg font-mono">
              @{username}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Appareil demandeur :</span>
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> Ordinateur de bureau
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Heure de la demande :</span>
            <span className="font-mono text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> {deviceTime || 'En direct'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60">
            <span className="text-slate-400">ID de session :</span>
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
              {sessionId || 'session_active'}
            </span>
          </div>
        </div>

        {/* State 1: Awaiting Decision */}
        {status === 'idle' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleApprove}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-emerald-400/40"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>✅ Approuver la Connexion Immédiate</span>
            </button>

            <button
              type="button"
              onClick={handleReject}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all border border-slate-700 hover:border-rose-500/40 cursor-pointer"
            >
              ❌ Ce n'est pas moi (Refuser)
            </button>
          </div>
        )}

        {/* State 2: Approved Confirmation */}
        {status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Connexion Approuvée !
            </h3>
            <p className="text-xs text-slate-300">
              Votre ordinateur va se connecter automatiquement dans un instant.
            </p>

            {approvalPin && (
              <div className="pt-2 border-t border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 block mb-1">
                  Code de confirmation rapide (au besoin) :
                </span>
                <span className="font-mono text-xl font-black text-white tracking-widest bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-400/30 inline-block">
                  {approvalPin}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* State 3: Rejected Confirmation */}
        {status === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Connexion Refusée
            </h3>
            <p className="text-xs text-slate-300">
              La tentative de connexion a été bloquée. Votre compte reste en totale sécurité.
            </p>
          </motion.div>
        )}

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-cyan-400" />
          <span>Chiffrement 256-bit • Protection des candidatures ScholarChina</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function MobileApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
          Chargement de l'approbation sécurisée...
        </div>
      }
    >
      <ApproveContent />
    </Suspense>
  );
}
