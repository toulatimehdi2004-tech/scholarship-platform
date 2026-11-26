"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { PhoneWelcomeMessage } from "@/lib/phoneWelcomeEngine";
import {
  Smartphone,
  MessageSquare,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function PhoneWelcomeToast() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<PhoneWelcomeMessage[]>([]);

  useEffect(() => {
    const handleSmsReceived = (event: Event) => {
      const customEvent = event as CustomEvent<PhoneWelcomeMessage>;
      if (!customEvent.detail) return;
      const msg = customEvent.detail;
      setMessages((prev) => [msg, ...prev.slice(0, 1)]); // Show latest incoming SMS
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scholarchina_phone_sms_received", handleSmsReceived);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scholarchina_phone_sms_received", handleSmsReceived);
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
          className="pointer-events-auto relative w-full bg-[#0a1424]/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-emerald-500/20 transition-all transform animate-slide-up overflow-hidden text-slate-100"
        >
          {/* Top Emerald Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan" />

          {/* Incoming Phone Banner Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Smartphone className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    {lang === "ar"
                      ? "رسالة هاتفية واردة (SMS)"
                      : lang === "fr"
                      ? "SMS Reçu sur votre Téléphone"
                      : "SMS Received on Your Phone"}
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Recipient Phone Info Pill */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs truncate">
                <span className="text-slate-400 text-[11px] block">
                  {lang === "ar" ? "المستلم:" : "Numéro destinataire :"}
                </span>
                <span className="font-mono font-bold text-white tracking-wide">
                  {item.recipientPhone}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {lang === "ar" ? "تم التسليم" : "Distribué"}
            </span>
          </div>

          {/* SMS Body Bubble */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs sm:text-[13px] leading-relaxed text-slate-200 whitespace-pre-line font-normal mb-3 shadow-inner">
            {item.messageText}
          </div>

          {/* Bottom Actions: WhatsApp 1-Click + Dismiss */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-500">
              {lang === "ar" ? "تأكيد فوري عبر SMS" : "Confirmation instantanée par SMS"}
            </span>

            <div className="flex items-center gap-2">
              {item.whatsappUrl && (
                <a
                  href={item.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all transform hover:scale-[1.02]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "فتح في WhatsApp" : "Ouvrir WhatsApp"}</span>
                </a>
              )}

              <button
                onClick={() => dismiss(item.id)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-colors"
              >
                {lang === "ar" ? "حسناً" : "Compris"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
