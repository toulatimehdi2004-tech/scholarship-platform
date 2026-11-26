"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { PhoneWelcomeMessage } from "@/lib/phoneWelcomeEngine";
import {
  Mail,
  CheckCircle2,
  X,
  ExternalLink,
  Info,
  Inbox,
  Sparkles,
} from "lucide-react";

export default function PhoneWelcomeToast() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<PhoneWelcomeMessage[]>([]);

  useEffect(() => {
    const handleEmailDispatched = (event: Event) => {
      const customEvent = event as CustomEvent<PhoneWelcomeMessage>;
      if (!customEvent.detail) return;
      const msg = customEvent.detail;
      setMessages((prev) => [msg, ...prev.slice(0, 1)]); // Show latest incoming welcome email
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scholarchina_email_welcome_dispatched", handleEmailDispatched);
      window.addEventListener("scholarchina_phone_sms_received", handleEmailDispatched);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scholarchina_email_welcome_dispatched", handleEmailDispatched);
        window.removeEventListener("scholarchina_phone_sms_received", handleEmailDispatched);
      }
    };
  }, []);

  const dismiss = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  if (messages.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {messages.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto relative w-full bg-[#0a1528]/95 backdrop-blur-2xl border-2 border-cyan/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-cyan/20 transition-all transform animate-slide-up overflow-hidden text-slate-100"
        >
          {/* Top Cyan Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan to-emerald-400" />

          {/* Incoming Email Banner Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan/20 text-cyan flex items-center justify-center shadow-md shadow-cyan/25 shrink-0">
                <Mail className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                    {lang === "ar"
                      ? "تم إرسال بريد الترحيب تلقائياً"
                      : lang === "fr"
                      ? "Email de Bienvenue Envoyé Automatiquement"
                      : "Welcome Email Dispatched Automatically"}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>ScholarChina Admissions Gateway</span>
                  <span>•</span>
                  <span>{lang === "ar" ? "الآن" : "À l'instant"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => dismiss(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Recipient Email Info Pill */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs truncate">
                <span className="text-slate-400 text-[10px] block">
                  {lang === "ar" ? "صندوق البريد المستلم:" : "Boîte de réception destinataire :"}
                </span>
                <span className="font-mono font-bold text-white tracking-wide truncate block">
                  {item.recipientEmail}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              {lang === "ar" ? "تم الإرسال 📬" : "Envoyé 📬"}
            </span>
          </div>

          {/* Message Body Bubble */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs sm:text-[13px] leading-relaxed text-slate-200 whitespace-pre-line font-normal mb-3 shadow-inner max-h-44 overflow-y-auto">
            {item.messageText}
          </div>

          {/* Direct 1-Click Inbox Button */}
          <div className="space-y-2 mb-2.5">
            {item.inboxUrl && (
              <a
                href={item.inboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dismiss(item.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan to-blue-600 hover:from-cyan/90 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan/25 transition-all transform hover:scale-[1.01] cursor-pointer"
              >
                <Inbox className="w-4 h-4" />
                <span>
                  {lang === "ar"
                    ? `📬 فتح صندوق الوارد (${item.providerName || "البريد الإلكتروني"})`
                    : `📬 Ouvrir ma boîte ${item.providerName || "E-mail"} (1 Clic)`}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}
          </div>

          {/* Automatic Dispatch Explanation Note */}
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] text-slate-300 leading-snug flex items-start gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
            <span>
              {lang === "ar"
                ? "تم إرسال رسالة التأكيد ومعلومات المنحة تلقائياً إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها Spams)."
                : "L'e-mail officiel avec vos détails d'admissions a été envoyé automatiquement à votre boîte mail. Pensez à vérifier votre boîte de réception ainsi que vos courriers indésirables (Spams)."}
            </span>
          </div>

          {/* Dismiss button */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => dismiss(item.id)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
            >
              {lang === "ar" ? "فهمت، إغلاق" : "Compris, fermer"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
