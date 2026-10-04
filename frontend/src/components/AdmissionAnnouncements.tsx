'use client';

import { motion } from "framer-motion";
import { Megaphone, Download, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/i18n";

export interface Announcement {
  id: number;
  title: string;
  date: string | null;
  url: string | null;
  kind: string;
}

const KIND_STYLES: Record<string, string> = {
  brochure: "bg-cyan/15 text-cyan border-cyan/30",
  guide: "bg-purple/15 text-purple border-purple/30",
  notice: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  scholarship: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  qa: "bg-blue/15 text-blue border-blue/30",
};

export default function AdmissionAnnouncements({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const { t } = useLang();

  if (!announcements || announcements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="glass rounded-3xl p-6 sm:p-8 mb-8"
    >
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-purple flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {t("ann.title")}
          </h2>
          <p className="text-sm text-text-muted">{t("ann.subtitle")}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-text-muted bg-white/5 px-2.5 py-1 rounded-full">
          {announcements.length}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 py-3.5 group"
          >
            <span
              className={
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border flex-shrink-0 " +
                (KIND_STYLES[a.kind] || KIND_STYLES.notice)
              }
            >
              {t("ann." + a.kind)}
            </span>
            <div className="flex-1 min-w-0">
              {a.url ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-primary group-hover:text-cyan transition-colors line-clamp-2 leading-snug"
                >
                  {a.title}
                </a>
              ) : (
                <p className="text-sm text-text-primary line-clamp-2 leading-snug">
                  {a.title}
                </p>
              )}
              {a.date && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  {new Date(a.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                title={t("ann.download")}
                className="flex-shrink-0 w-9 h-9 rounded-xl glass-light border border-border-glass flex items-center justify-center text-text-muted hover:text-cyan hover:border-cyan/40 transition-all"
              >
                {/\.pdf(\?|$)/i.test(a.url) ? (
                  <Download className="w-4 h-4" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
