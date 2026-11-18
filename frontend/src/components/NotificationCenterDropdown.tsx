"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import {
  StudentNotification,
  getStudentNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  simulateIncomingMessage,
  requestBrowserNotificationPermission,
  getLocalizedText,
} from "@/lib/notificationEngine";
import MessageDetailModal from "@/components/MessageDetailModal";
import {
  Bell,
  CheckCheck,
  Sparkles,
  GraduationCap,
  FileText,
  MessageSquare,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  Volume2,
  Send,
  Zap,
} from "lucide-react";

interface NotificationCenterDropdownProps {
  variant?: "portal" | "navbar";
}

export default function NotificationCenterDropdown({
  variant = "portal",
}: NotificationCenterDropdownProps) {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "admissions" | "messages">("all");
  const [selectedNotification, setSelectedNotification] = useState<StudentNotification | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications from engine
  const refreshNotifications = () => {
    const list = getStudentNotifications();
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.read).length);
  };

  useEffect(() => {
    refreshNotifications();

    if (typeof window !== "undefined" && "Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }

    // Listen for storage / custom events
    const handleUpdate = () => {
      refreshNotifications();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scholarchina_notifications_updated", handleUpdate);
      window.addEventListener("scholarchina_notification_received", handleUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scholarchina_notifications_updated", handleUpdate);
        window.removeEventListener("scholarchina_notification_received", handleUpdate);
      }
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllNotificationsAsRead();
    refreshNotifications();
  };

  const handleItemClick = (notif: StudentNotification) => {
    markNotificationAsRead(notif.id);
    refreshNotifications();
    setSelectedNotification(notif);
    setIsOpen(false);
  };

  const handleSimulate = (type: "admission" | "csc" | "translator" | "advisor") => {
    simulateIncomingMessage(type);
    refreshNotifications();
  };

  const handleEnablePush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const granted = await requestBrowserNotificationPermission();
    setHasPermission(granted);
    if (granted) {
      simulateIncomingMessage("advisor", {
        title: {
          en: "Browser Push Notifications Active!",
          fr: "Notifications Bureau Activées avec Succès !",
          ar: "تم تفعيل إشعارات سطح المكتب بنجاح!",
        },
        snippet: {
          en: "You will now receive instant push alerts whenever a university or mentor sends a message.",
          fr: "Vous recevrez désormais des alertes directes à chaque nouveau message d'une université.",
          ar: "ستصلك الآن تنبيهات مباشرة عند وصول أي رسالة من الجامعات أو المستشار.",
        },
      });
    }
  };

  const filteredList = notifications.filter((item) => {
    if (activeFilter === "unread") return !item.read;
    if (activeFilter === "admissions")
      return item.category === "admission" || item.category === "scholarship";
    if (activeFilter === "messages")
      return item.category === "message" || item.category === "document";
    return true;
  });

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return lang === "ar" ? "الآن" : lang === "fr" ? "À l'instant" : "Just now";
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return lang === "ar" ? `منذ ${mins} دقيقة` : lang === "fr" ? `Il y a ${mins} min` : `${mins}m ago`;
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return lang === "ar" ? `منذ ${hours} ساعة` : lang === "fr" ? `Il y a ${hours}h` : `${hours}h ago`;
    }
    const days = Math.floor(diff / 86400);
    return lang === "ar" ? `منذ ${days} يوم` : lang === "fr" ? `Il y a ${days}j` : `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          variant === "portal"
            ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
            : "text-slate-300 hover:text-cyan hover:bg-white/5"
        } ${isOpen ? "ring-2 ring-cyan/50 bg-white/10" : ""}`}
        title={lang === "ar" ? "مركز الإشعارات والرسائل" : "Notifications & Messages"}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse border border-[#030712]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-[9995] top-full mt-2.5 w-[340px] sm:w-[420px] max-w-[95vw] bg-[#0a1224]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan/10 overflow-hidden text-slate-100 animate-fade-in ${
            lang === "ar" ? "left-0 sm:left-auto sm:right-0" : "right-0"
          }`}
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {/* Header Bar */}
          <div className="p-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan/10 text-cyan">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{lang === "ar" ? "مركز الإشعارات والرسائل" : "Notifications & Messages"}</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan/20 text-cyan border border-cyan/30">
                      {unreadCount} {lang === "ar" ? "جديدة" : "nouvelles"}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-slate-400 hover:text-cyan flex items-center gap-1 transition-colors"
                title={lang === "ar" ? "تحديد الكل كمقروء" : "Tout marquer comme lu"}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === "ar" ? "تحديد كمقروء" : "Tout marquer lu"}
                </span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2.5 pb-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {lang === "ar" ? "الكل" : "Toutes"} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("unread")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeFilter === "unread"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {lang === "ar" ? "غير مقروءة" : "Non lues"} ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter("admissions")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeFilter === "admissions"
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {lang === "ar" ? "القبول والمنح" : "Admissions & CSC"}
            </button>
            <button
              onClick={() => setActiveFilter("messages")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeFilter === "messages"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {lang === "ar" ? "المستشار والوثائق" : "Conseillers & Docs"}
            </button>
          </div>

          {/* Quick Simulation Banner (for testing incoming messages) */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 border-b border-white/5 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5 truncate">
              <Zap className="w-3 h-3 text-cyan shrink-0" />
              <span>{lang === "ar" ? "اختبار وصول رسالة جديدة:" : "Simuler un message entrant :"}</span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSimulate("admission")}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-cyan/30 text-cyan text-[10px] font-semibold transition-colors"
                title="Simuler message d'admission Université"
              >
                {lang === "ar" ? "جامعة" : "Fac"}
              </button>
              <button
                onClick={() => handleSimulate("csc")}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold transition-colors"
                title="Simuler notification CSC Beijing"
              >
                CSC
              </button>
              <button
                onClick={() => handleSimulate("advisor")}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition-colors"
                title="Simuler message Conseiller"
              >
                {lang === "ar" ? "مستشار" : "Advisor"}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {lang === "ar" ? "لا توجد إشعارات في هذا القسم" : "Aucune notification ici"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === "ar"
                    ? "ستظهر الرسائل الجديدة فور وصولها"
                    : "Vos nouveaux messages apparaîtront automatiquement"}
                </p>
              </div>
            ) : (
              filteredList.map((notif) => {
                const currentLang = (lang === "ar" || lang === "en" || lang === "fr" ? lang : "fr") as "en" | "fr" | "ar";
                const title = getLocalizedText(notif.title, currentLang);
                const snippet = getLocalizedText(notif.snippet, currentLang);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 sm:p-4 hover:bg-white/[0.04] transition-all cursor-pointer flex items-start gap-3 relative group ${
                      !notif.read ? "bg-white/[0.02]" : "opacity-85"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.read && (
                      <span className="absolute top-4 left-2 sm:left-2.5 w-1.5 h-1.5 rounded-full bg-cyan shadow-sm shadow-cyan animate-pulse" />
                    )}

                    {/* Sender Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                        notif.sender.avatarBg || "from-blue-600 to-cyan-500"
                      } flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/10 shrink-0 mt-0.5`}
                    >
                      {notif.sender.avatar || notif.sender.name.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-white truncate group-hover:text-cyan transition-colors">
                            {notif.sender.name}
                          </span>
                          {notif.sender.verified && (
                            <ShieldCheck className="w-3 h-3 text-cyan shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {getRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-medium text-slate-200 line-clamp-1 mb-1 ${
                          !notif.read ? "font-semibold text-white" : ""
                        }`}
                      >
                        {title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {snippet}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-[10px] text-slate-500">
                        <span className="truncate">{notif.sender.organization || notif.sender.role}</span>
                        <span className="text-cyan font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          {lang === "ar" ? "قراءة" : "Lire"}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 text-[11px]">
            {!hasPermission ? (
              <button
                onClick={handleEnablePush}
                className="text-cyan hover:underline font-semibold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {lang === "ar"
                    ? "تفعيل إشعارات سطح المكتب"
                    : "Activer les notifications bureau"}
                </span>
              </button>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {lang === "ar" ? "التنبيهات الفورية مفعّلة" : "Alertes en temps réel actives"}
              </span>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                if (notifications.length > 0) {
                  setSelectedNotification(notifications[0]);
                }
              }}
              className="text-slate-400 hover:text-white font-medium"
            >
              {lang === "ar" ? "فتح الأحدث" : "Ouvrir le dernier"}
            </button>
          </div>
        </div>
      )}

      {/* Reader Modal when a notification is clicked from dropdown */}
      {selectedNotification && (
        <MessageDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onRefresh={refreshNotifications}
        />
      )}
    </div>
  );
}
