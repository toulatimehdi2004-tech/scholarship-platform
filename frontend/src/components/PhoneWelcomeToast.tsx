"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { PhoneWelcomeMessage } from "@/lib/phoneWelcomeEngine";
import {
  Smartphone,
  MessageSquare,
  CheckCircle2,
  X,
  Send,
  MessageCircle,
  ExternalLink,
  Info,
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
          className="pointer-events-auto relative w-full bg-[#0a1424]/95 backdrop-blur-2xl border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-emerald-500/25 transition-all transform animate-slide-up overflow-hidden text-slate-100"
        >
          {/* Top Emerald Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan" />

          {/* Incoming Phone Banner Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    {lang === "ar"
                      ? "رسالة الترحيب جاهزة لهاتفك"
                      : lang === "fr"
                      ? "Message de Bienvenue pour votre Téléphone"
                      : "Welcome Message for Your Phone"}
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

          {/* Recipient Phone Info Pill */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs truncate">
                <span className="text-slate-400 text-[10px] block">
                  {lang === "ar" ? "الرقم المسجل:" : "Numéro enregistré :"}
                </span>
                <span className="font-mono font-bold text-white tracking-wide">
                  {item.recipientPhone}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {lang === "ar" ? "جاهز للتسليم" : "Prêt à envoyer"}
            </span>
          </div>

          {/* Message Body Bubble */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs sm:text-[13px] leading-relaxed text-slate-200 whitespace-pre-line font-normal mb-3 shadow-inner max-h-48 overflow-y-auto">
            {item.messageText}
          </div>

          {/* Real Delivery Action Buttons (WhatsApp & SMS App) */}
          <div className="space-y-2 mb-2">
            {item.whatsappUrl && (
              <a
                href={item.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dismiss(item.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-[1.01] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {lang === "ar"
                    ? "📲 إرسال واستلام فوري عبر WhatsApp"
                    : "📲 Envoyer et recevoir sur mon WhatsApp"}
                </span>
              </a>
            )}

            {item.smsAppUrl && (
              <a
                href={item.smsAppUrl}
                onClick={() => dismiss(item.id)}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-cyan" />
                <span>
                  {lang === "ar"
                    ? "💬 فتح في تطبيق الرسائل القصيرة (SMS) للهاتف"
                    : "💬 Ouvrir dans l'application SMS du téléphone"}
                </span>
              </a>
            )}
          </div>

          {/* Transparent explanation note */}
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] text-slate-300 leading-snug flex items-start gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
            <span>
              {lang === "ar"
                ? "لتلقي الرسالة مباشرة على هاتفك، اضغط على زر WhatsApp أو تطبيق الرسائل أعلاه. لإرسال SMS مباشر عبر شبكة الاتصالات دون فتح التطبيق، يلزم ربط مفتاح Twilio / Infobip."
                : "Pour recevoir le message directement sur votre téléphone, cliquez sur WhatsApp ou SMS ci-dessus. L'envoi automatique direct sans interaction nécessite une passerelle GSM (Twilio / Infobip)."}
            </span>
          </div>

          {/* Dismiss button */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => dismiss(item.id)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              {lang === "ar" ? "إغلاق" : "Fermer"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
