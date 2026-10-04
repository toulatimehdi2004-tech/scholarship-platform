"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import SmartBack from "@/components/SmartBack";
import { fetchApi, type Scholarship } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface ApplyUniversity {
  id: number;
  name: string;
  website: string;
  country: string;
  city: string;
}

export default function ApplyClient() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLang();
  const [university, setUniversity] = useState<ApplyUniversity | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const uniId = params?.id;

  useEffect(() => {
    if (!uniId) return;
    async function load() {
      setLoading(true);
      const [uniRes, schRes] = await Promise.all([
        fetchApi<ApplyUniversity>("/universities/" + uniId + "/"),
        fetchApi<Scholarship[]>("/scholarships/"),
      ]);
      if (uniRes.data) setUniversity(uniRes.data);
      if (schRes.data) {
        setScholarships(
          schRes.data.filter(
            (s) =>
              String(s.university) === String(uniId) ||
              (s as any).university?.id === Number(uniId)
          )
        );
      }
      setLoading(false);
    }
    load();
  }, [uniId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4" />
          <div className="h-4 bg-white/10 rounded w-64" />
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-text-secondary text-lg mb-4">
            {t("ud.notFound")}
          </p>
          <Link
            href="/scholarships"
            className="text-cyan hover:text-purple transition-colors"
          >
            {t("ud.backToSch")}
          </Link>
        </div>
      </div>
    );
  }

  const applicationSteps = [
    {
      step: 1,
      icon: <BookOpen className="w-5 h-5" />,
      title: t("ud.s1t"),
      description: t("ud.s1d", { name: university.name }),
      color: "from-cyan to-blue",
      borderColor: "border-cyan/30",
      bgColor: "bg-cyan/10",
    },
    {
      step: 2,
      icon: <FileText className="w-5 h-5" />,
      title: t("ud.s2t"),
      description: t("ud.s2d"),
      color: "from-purple to-blue",
      borderColor: "border-purple/30",
      bgColor: "bg-purple/10",
    },
    {
      step: 3,
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: t("ud.s3t"),
      description: t("ud.s3d"),
      color: "from-emerald-500 to-cyan",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
    },
    {
      step: 4,
      icon: <Send className="w-5 h-5" />,
      title: t("ud.s4t"),
      description: t("ud.s4d"),
      color: "from-amber-500 to-purple",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
    },
    {
      step: 5,
      icon: <Clock className="w-5 h-5" />,
      title: t("ud.s5t"),
      description: t("ud.s5d"),
      color: "from-blue to-purple",
      borderColor: "border-blue/30",
      bgColor: "bg-blue/10",
    },
  ];

  const applyUrl =
    scholarships.find((s) => s.application_link)?.application_link ||
    university.website ||
    "#";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <SmartBack
            fallback={uniId ? "/university/" + uniId : "/universities"}
            label={t("ud.back")}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {t("ud.howToApply")}
              </h1>
              <p className="text-sm text-text-muted">
                {t("ud.howToApplySub", { name: university.name })}
              </p>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan via-purple to-amber-500 hidden sm:block" />

            <div className="space-y-6">
              {applicationSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="relative flex gap-4 sm:gap-6"
                >
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={
                        "w-12 h-12 rounded-2xl bg-gradient-to-br " +
                        item.color +
                        " flex items-center justify-center text-white shadow-lg"
                      }
                    >
                      {item.icon}
                    </div>
                  </div>

                  <div
                    className={
                      "flex-1 glass-light rounded-2xl p-5 border " +
                      item.borderColor +
                      " hover:shadow-lg transition-all"
                    }
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={
                          "text-xs font-bold px-2 py-0.5 rounded " +
                          item.bgColor +
                          " text-text-primary"
                        }
                      >
                        {t("ud.step")} {item.step}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-gradient px-8 py-3.5 rounded-xl text-base font-semibold w-full sm:w-auto justify-center"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t("ud.applyNowAt", { name: university.name })}
                <ExternalLink className="w-4 h-4" />
              </span>
            </a>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <AlertCircle className="w-4 h-4" />
              <span>{t("ud.redirectNote")}</span>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan/5 via-purple/5 to-amber-500/5 border border-border-glass">
            <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {t("ud.quickTips")}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
              {[t("ud.tip1"), t("ud.tip2"), t("ud.tip3"), t("ud.tip4")].map(
                (tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                )
              )}
            </ul>
          </div>
        </motion.div>

        {/* Scholarships at this University */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">
            {t("ud.available")} ({scholarships.length})
          </h2>
          {scholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-text-secondary">{t("ud.noSch")}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
