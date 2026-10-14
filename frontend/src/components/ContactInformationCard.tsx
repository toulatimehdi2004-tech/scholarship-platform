"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  Building2,
  Send,
  FileText,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  findAccreditedUniversity,
  getUniversityHotline,
} from "@/lib/universityRegistry";

interface ContactInformationCardProps {
  universityName: string;
  universityId?: number;
  contactEmail?: string | null;
  contactPhone?: string | null;
  secondaryEmail?: string | null;
  scholarshipTitle?: string;
  agencyCode?: string | null;
  className?: string;
}

/**
 * Fallback copy function supporting both modern navigator.clipboard and legacy execCommand
 */
async function copyText(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function ContactInformationCard({
  universityName,
  universityId,
  contactEmail,
  contactPhone,
  secondaryEmail,
  scholarshipTitle,
  agencyCode,
  className = "",
}: ContactInformationCardProps) {
  const { t, lang } = useLang();

  // Registry lookup for accredited emails and official domains
  const accredited = findAccreditedUniversity(universityId || universityName);

  // Resolved primary email
  const cleanEmail =
    contactEmail &&
    contactEmail !== "None" &&
    contactEmail !== "null" &&
    contactEmail.trim().length > 0
      ? contactEmail.trim()
      : accredited?.admissions_email || "admission@csc.edu.cn";

  // Resolved secondary email (Gmail desk)
  const cleanSecondaryEmail =
    secondaryEmail && secondaryEmail.trim().length > 0
      ? secondaryEmail.trim()
      : accredited?.secondary_email || null;

  // Resolved phone
  const cleanPhone =
    contactPhone &&
    contactPhone !== "None" &&
    contactPhone !== "null" &&
    contactPhone.trim().length > 0
      ? contactPhone.trim()
      : getUniversityHotline(universityName);

  // Moroccan Student Advisor WhatsApp
  const advisorWhatsApp = "+212 6 61 89 45 23";
  const advisorWhatsAppClean = "212661894523";

  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string, label: string) => {
    const success = await copyText(text);
    if (success) {
      setCopiedKey(key);
      setToastMessage(`✓ ${label} : ${text}`);
      setTimeout(() => {
        setCopiedKey(null);
        setToastMessage(null);
      }, 3500);
    }
  };

  // Pre-formatted Inquiry Email subject and body
  const subject = scholarshipTitle
    ? `Inquiry: Application for ${scholarshipTitle} (${universityName})`
    : `Inquiry: International Student Admissions - ${universityName}`;

  const inquiryBody =
    lang === "fr"
      ? `Madame, Monsieur le Bureau des Admissions Internationales,\n\nJe suis un(e) candidat(e) marocain(e) vivement intéressé(e) par ${
          scholarshipTitle ? `la bourse "${scholarshipTitle}"` : "vos programmes d'études"
        } au sein de votre établissement (${universityName}) pour l'année universitaire 2026/2027.\n\n${
          agencyCode ? `Code d'agence CSC : ${agencyCode}\n` : ""
        }Pourriez-vous s'il vous plaît me confirmer les modalités de dépôt de dossier, les dates limites officielles et les documents spécifiques requis pour les étudiants titulaires d'un diplôme marocain (Baccalauréat / Licence / Master) ?\n\nInformations du candidat :\n- Nom & Prénom : \n- Nationalité : Marocaine\n- Niveau d'études visé : \n- Spécialité : \n- Numéro de Passeport : \n\nJe vous remercie chaleureusement pour votre assistance et reste dans l'attente de votre réponse.\n\nCordialement,\n[Votre Nom Complet]\nMaroc`
      : lang === "ar"
      ? `إلى مكتب قبول الطلاب الدوليين المحترم في جامعة ${universityName}،\n\nتحية طيبة وبعد،\nأنا طالب(ة) مغربي(ة) وأرغب في التقدم لـ ${
          scholarshipTitle ? `منحة "${scholarshipTitle}"` : "برامجكم الدراسية"
        } للعام الجامعي 2026/2027.\n\n${
          agencyCode ? `رمز وكالة CSC: ${agencyCode}\n` : ""
        }يرجى التكرم بتوضيح إجراءات التقديم والوثائق المطلوبة للمترشحين المغاربة.\n\nبيانات المترشح:\n- الاسم الكامل: \n- الجنسية: مغربية\n- المستوى الدراسي المطلوب: \n- التخصص: \n- رقم جواز السفر: \n\nوتفضلوا بقبول فائق التقدير والاحترام.\n[الاسم الكامل]`
      : `Dear International Admissions Office at ${universityName},\n\nI am a Moroccan applicant very interested in ${
          scholarshipTitle ? `the "${scholarshipTitle}"` : "studating at your university"
        } for the 2026/2027 academic year.\n\n${
          agencyCode ? `CSC Agency Number: ${agencyCode}\n` : ""
        }Could you kindly confirm the official application deadlines and specific document requirements for Moroccan applicants (Baccalaureate / Bachelor / Master holders)?\n\nApplicant Details:\n- Full Name: \n- Nationality: Moroccan\n- Target Degree Level: \n- Major / Field: \n- Passport Number: \n\nThank you very much for your time, guidance, and assistance.\n\nSincerely,\n[Your Full Name]\nMorocco`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    cleanEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryBody)}`;

  const mailtoUrl = `mailto:${cleanEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(inquiryBody)}`;

  const whatsAppMessage = scholarshipTitle
    ? `Salam, je souhaite avoir des conseils et un accompagnement pour postuler à la bourse : "${scholarshipTitle}" à ${universityName}.`
    : `Salam, je souhaite avoir des conseils pour postuler à l'université : ${universityName}.`;

  const whatsAppAdvisorUrl = `https://wa.me/${advisorWhatsAppClean}?text=${encodeURIComponent(
    whatsAppMessage
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-cyan/5 to-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-emerald-300 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-sm font-semibold max-w-md w-full mx-4"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Verified Accreditation Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan/20 to-purple/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-text-primary">
                {t("det.contactDesk")}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {t("det.verifiedAdmissions")}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {universityName} • {accredited?.official_domain || "Admissions Internationales"}
            </p>
          </div>
        </div>

        {/* Quick action: Copy inquiry letter */}
        <button
          onClick={() =>
            handleCopy(
              inquiryBody,
              "template",
              t("det.copiedTemplate")
            )
          }
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan border border-cyan/30 hover:border-cyan/50 transition-all flex items-center gap-2 group shadow-sm"
          title="Copier un modèle de lettre de candidature officielle prêt à l'envoi"
        >
          {copiedKey === "template" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">{t("det.copiedTemplate")}</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{t("det.inquiryTemplate")}</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Contact Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10 mb-6">
        {/* Card 1: Official University Admissions Email */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan uppercase tracking-wider">
                <Mail className="w-4 h-4 text-cyan" />
                <span>Email Officiel des Admissions</span>
              </div>
              <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                Principal
              </span>
            </div>

            <div
              onClick={() =>
                handleCopy(cleanEmail, "primary_email", t("det.copiedEmail"))
              }
              className="group cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-cyan/30 transition-all flex items-center justify-between gap-2"
              title="Cliquer pour copier l'adresse email"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan/10 text-cyan flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm sm:text-base font-semibold text-text-primary group-hover:text-cyan transition-colors truncate">
                  {cleanEmail}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {copiedKey === "primary_email" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                    {t("det.copiedEmail")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary group-hover:text-cyan px-2 py-1 rounded-lg bg-white/5 group-hover:bg-cyan/10 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                    {t("det.copyEmail")}
                  </span>
                )}
              </div>
            </div>

            {/* Secondary Gmail Desk if available */}
            {cleanSecondaryEmail && cleanSecondaryEmail !== cleanEmail && (
              <div className="mt-2.5 pt-2.5 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                  <span>Guichet Admissions Gmail (Accrédité) :</span>
                </div>
                <div
                  onClick={() =>
                    handleCopy(
                      cleanSecondaryEmail,
                      "secondary_email",
                      t("det.copiedEmail")
                    )
                  }
                  className="group cursor-pointer p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-mono text-text-secondary group-hover:text-text-primary truncate">
                    {cleanSecondaryEmail}
                  </span>
                  <span className="text-[11px] text-text-muted group-hover:text-cyan flex items-center gap-1 flex-shrink-0">
                    {copiedKey === "secondary_email" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direct Action Buttons for Email */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            {/* Button 1: Open in Gmail Webmail (100% works in browser) */}
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 border border-red-500/30 hover:border-red-500/50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              title="Ouvrir instantanément un brouillon prêt dans Gmail"
            >
              <Send className="w-3.5 h-3.5 text-red-400" />
              <span>{t("det.openGmail")}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            {/* Button 2: Mailto fallback */}
            <a
              href={mailtoUrl}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              title="Ouvrir dans l'application mail par défaut de votre système (Outlook, Mail, etc.)"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("det.openMailApp")}</span>
              <span className="sm:hidden">App Mail</span>
            </a>
          </div>
        </div>

        {/* Card 2: Phone Hotline & Moroccan WhatsApp Advisor */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Secrétariat Téléphonique & WhatsApp</span>
              </div>
              <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">
                International
              </span>
            </div>

            {/* University Hotline */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <a
                    href={`tel:${cleanPhone.replace(/[^0-9+]/g, "")}`}
                    className="font-mono text-sm sm:text-base font-semibold text-text-primary hover:text-emerald-400 transition-colors block"
                    title="Cliquer pour composer le numéro"
                  >
                    {cleanPhone}
                  </a>
                  <span className="text-[10px] text-text-muted block">
                    Secrétariat des admissions (Chine)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={`tel:${cleanPhone.replace(/[^0-9+]/g, "")}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{t("det.directCall")}</span>
                </a>
                <button
                  onClick={() =>
                    handleCopy(cleanPhone, "phone", t("det.copiedPhone"))
                  }
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                  title="Copier le numéro"
                >
                  {copiedKey === "phone" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Moroccan Student Advisor WhatsApp Hotline */}
            <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-emerald-300 block truncate">
                    {advisorWhatsApp}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block">
                    Conseiller Marocain Résident (Casablanca & Rabat)
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    advisorWhatsApp,
                    "advisor_wa",
                    "Numéro WhatsApp copié !"
                  )
                }
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                title="Copier le numéro WhatsApp"
              >
                {copiedKey === "advisor_wa" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Action button for WhatsApp */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <a
              href={whatsAppAdvisorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500/60 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{t("det.whatsappAdvisor")}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Helpful admissions info footer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-secondary relative z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{t("det.admissionsHours")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
          <span>{t("det.admissionsAdvice")}</span>
        </div>
      </div>
    </motion.div>
  );
}
