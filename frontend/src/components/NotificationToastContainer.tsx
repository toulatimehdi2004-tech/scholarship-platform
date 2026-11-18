"use client";

import React, { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import {
  StudentNotification,
  markNotificationAsRead,
  getLocalizedText,
} from "@/lib/notificationEngine";
import MessageDetailModal from "@/components/MessageDetailModal";
import {
  Bell,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

interface ToastItem {
  id: string;
  notification: StudentNotification;
  progress: number;
}

export default function NotificationToastContainer() {
  const { lang } = useLang();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeModalNotification, setActiveModalNotification] = useState<StudentNotification | null>(
    null
  );

  useEffect(() => {
    // Handler for incoming real-time notifications
    const handleNotificationReceived = (event: Event) => {
      const customEvent = event as CustomEvent<StudentNotification>;
      if (!customEvent.detail) return;

      const notif = customEvent.detail;
      const newToast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        notification: notif,
        progress: 100,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep max 3 toasts at once
    };

    // Handler for opening full message detail modal from anywhere
    const handleOpenDetail = (event: Event) => {
      const customEvent = event as CustomEvent<StudentNotification>;
      if (customEvent.detail) {
        setActiveModalNotification(customEvent.detail);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scholarchina_notification_received", handleNotificationReceived);
      window.addEventListener("scholarchina_open_message_detail", handleOpenDetail);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "scholarchina_notification_received",
          handleNotificationReceived
        );
        window.removeEventListener("scholarchina_open_message_detail", handleOpenDetail);
      }
    };
  }, []);

  // Countdown timer for each toast
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      setToasts((prev) =>
        prev
          .map((item) => ({ ...item, progress: item.progress - 2 }))
          .filter((item) => item.progress > 0)
      );
    }, 140); // 140ms * 50 = ~7 seconds

    return () => clearInterval(interval);
  }, [toasts.length]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenToastMessage = (toast: ToastItem) => {
    markNotificationAsRead(toast.notification.id);
    setActiveModalNotification(toast.notification);
    dismissToast(toast.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "admission":
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
      case "scholarship":
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case "document":
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case "message":
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-cyan" />;
    }
  };

  return (
    <>
      {/* Toast Notification Stack at Top-Right */}
      <div
        className="fixed top-20 right-4 z-[9990] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {toasts.map((toast) => {
          const notif = toast.notification;
          const currentLang = (lang === "ar" || lang === "en" || lang === "fr" ? lang : "fr") as "en" | "fr" | "ar";
          const title = getLocalizedText(notif.title, currentLang);
          const snippet = getLocalizedText(notif.snippet, currentLang);

          return (
            <div
              key={toast.id}
              className="pointer-events-auto relative w-full bg-[#0a1224]/95 backdrop-blur-xl border border-cyan/30 rounded-2xl p-4 shadow-2xl shadow-cyan/10 transition-all transform animate-slide-left overflow-hidden text-slate-100 group"
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan to-amber-400" />

              {/* Progress timer bar */}
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan to-blue-500 transition-all duration-150"
                style={{ width: `${toast.progress}%` }}
              />

              <div className="flex items-start gap-3">
                {/* Sender Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                    notif.sender.avatarBg || "from-blue-600 to-cyan-500"
                  } flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20 shrink-0 mt-0.5`}
                >
                  {notif.sender.avatar || notif.sender.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Sender & Badges */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {notif.sender.name}
                      </span>
                      {notif.sender.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {getCategoryIcon(notif.category)}
                      <button
                        onClick={() => dismissToast(toast.id)}
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1 group-hover:text-cyan transition-colors">
                    {title}
                  </h4>

                  {/* Snippet */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {snippet}
                  </p>

                  {/* Quick Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400">
                      {lang === "ar" ? "وصل للتو" : lang === "fr" ? "À l'instant" : "Just now"}
                    </span>

                    <button
                      onClick={() => handleOpenToastMessage(toast)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan/20 to-blue-600/30 hover:from-cyan/30 hover:to-blue-600/50 border border-cyan/40 text-cyan text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>
                        {lang === "ar"
                          ? "قراءة الرسالة"
                          : lang === "fr"
                          ? "Lire le message"
                          : "Read Message"}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Message Detail Modal */}
      {activeModalNotification && (
        <MessageDetailModal
          notification={activeModalNotification}
          onClose={() => setActiveModalNotification(null)}
          onRefresh={() => {
            // Trigger storage sync
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("scholarchina_notifications_updated"));
            }
          }}
        />
      )}
    </>
  );
}
