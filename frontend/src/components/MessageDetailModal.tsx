"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import {
  StudentNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteStudentNotification,
  getLocalizedText,
} from "@/lib/notificationEngine";
import {
  X,
  CheckCircle,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageSquare,
  Download,
  Trash2,
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface MessageDetailModalProps {
  notification: StudentNotification | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function MessageDetailModal({
  notification,
  onClose,
  onRefresh,
}: MessageDetailModalProps) {
  const router = useRouter();
  const { lang } = useLang();

  if (!notification) return null;

  const currentLang = (lang === "ar" || lang === "en" || lang === "fr" ? lang : "fr") as "en" | "fr" | "ar";
  const title = getLocalizedText(notification.title, currentLang);
  const fullMessage = getLocalizedText(notification.fullMessage, currentLang);
  const actionLabel = notification.actionLabel
    ? getLocalizedText(notification.actionLabel, currentLang)
    : currentLang === "ar"
    ? "متابعة الإجراء"
    : currentLang === "fr"
    ? "Suivre la démarche"
    : "Proceed to Action";

  const dateStr = new Date(notification.timestamp).toLocaleString(
    lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const getCategoryBadge = () => {
    switch (notification.category) {
      case "admission":
        return {
          label: lang === "ar" ? "قبول جامعي" : lang === "fr" ? "Admission Universitaire" : "University Admission",
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: <GraduationCap className="w-3.5 h-3.5" />,
        };
      case "scholarship":
        return {
          label: lang === "ar" ? "منحة CSC كاملة" : lang === "fr" ? "Bourse Complète CSC" : "CSC Full Scholarship",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case "document":
        return {
          label: lang === "ar" ? "ترجمة وتصديق" : lang === "fr" ? "Traduction & Apostille" : "Legalized Docs",
          color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          icon: <FileText className="w-3.5 h-3.5" />,
        };
      case "message":
      default:
        return {
          label: lang === "ar" ? "رسالة مستشار" : lang === "fr" ? "Message Conseiller" : "Advisor Message",
          color: "bg-cyan/20 text-cyan border-cyan/30",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getCategoryBadge();

  const handleToggleRead = () => {
    if (notification.read) {
      markNotificationAsUnread(notification.id);
    } else {
      markNotificationAsRead(notification.id);
    }
    onRefresh?.();
  };

  const handleDelete = () => {
    deleteStudentNotification(notification.id);
    onRefresh?.();
    onClose();
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      onClose();
      router.push(notification.actionUrl);
    }
  };

  const handleOpenAdvisorChat = () => {
    onClose();
    if (typeof window !== "undefined") {
      // Trigger opening Live Advisor widget
      window.dispatchEvent(new CustomEvent("scholarchina_open_advisor_chat", {
        detail: {
          initialMessage: `Concernant la notification : "${title}"`,
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#091122] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Top Header Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan to-amber-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-start gap-3.5">
            {/* Sender Avatar */}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                notification.sender.avatarBg || "from-blue-600 to-cyan-500"
              } flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20 shrink-0`}
            >
              {notification.sender.avatar || notification.sender.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-white text-base flex items-center gap-1.5">
                  {notification.sender.name}
                  {notification.sender.verified && (
                    <span title="Officiellement Vérifié" className="text-cyan">
                      <ShieldCheck className="w-4 h-4 fill-cyan/20" />
                    </span>
                  )}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>

                {notification.priority === "urgent" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    {lang === "ar" ? "عاجل" : lang === "fr" ? "Urgent" : "Urgent"}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {notification.sender.organization || notification.sender.role}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {dateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={lang === "ar" ? "إغلاق" : "Fermer"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Message Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-200">
          {/* Subject Line */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              {lang === "ar" ? "موضوع الرسالة" : lang === "fr" ? "Objet du Message" : "Subject"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
          </div>

          {/* Message Paragraphs */}
          <div className="whitespace-pre-line font-normal text-slate-300 space-y-3 p-1">
            {fullMessage}
          </div>

          {/* Attachments Section (if available) */}
          {notification.attachments && notification.attachments.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan" />
                {lang === "ar"
                  ? "المرفقات والشهادات الرسمية"
                  : lang === "fr"
                  ? "Pièces Jointes & Certificats Officiels"
                  : "Official Attachments & Certificates"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {notification.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {att.type}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate group-hover:text-cyan transition-colors">
                          {att.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        alert(
                          lang === "ar"
                            ? `جاري فتح الوثيقة الرسمية: ${att.name}`
                            : `Ouverture de la pièce jointe officielle : ${att.name}`
                        );
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 group-hover:text-cyan transition-colors"
                      title={lang === "ar" ? "تحميل / معاينة" : "Télécharger / Consulter"}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {notification.tags && notification.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {notification.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-400 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 flex-wrap">
          {/* Left actions: Toggle Read & Delete */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRead}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-cyan" />
              <span>
                {notification.read
                  ? lang === "ar"
                    ? "تحديد كغير مقروء"
                    : "Marquer comme non lu"
                  : lang === "ar"
                  ? "تحديد كمقروء"
                  : "Marquer comme lu"}
              </span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title={lang === "ar" ? "حذف الرسالة" : "Supprimer la notification"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right actions: Chat & Direct Portal Action */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAdvisorChat}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan" />
              <span>
                {lang === "ar" ? "مراسلة المستشار" : lang === "fr" ? "Contacter le Conseiller" : "Message Advisor"}
              </span>
            </button>

            {notification.actionUrl && (
              <button
                onClick={handleActionClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan to-blue-600 hover:from-cyan/90 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan/20 transition-all transform hover:scale-[1.02]"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
