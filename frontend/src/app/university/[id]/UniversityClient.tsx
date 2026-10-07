"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Globe,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import CampusTour, { type Landmark } from "@/components/CampusTour";
import AutoText from "@/components/AutoText";
import SmartBack from "@/components/SmartBack";
import { fetchApi, type Scholarship, getToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface UniversityDetail {
  id: number;
  name: string;
  description: string;
  website: string;
  country: string;
  city: string;
  address: string | null;
  founding_year: number | null;
  motto: string | null;
  latitude: number | null;
  longitude: number | null;
  tagline: string | null;
  is_verified: boolean;
  scholarships_count: number;
  landmarks: Landmark[];
  about?: string | null;
  about_ar?: string | null;
  wikipedia_url?: string | null;
}

export default function UniversityClient() {
  const params = useParams();
  const router = useRouter();
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();
  const uniId = params?.id;

  useEffect(() => {
    if (!uniId) return;

    async function load() {
      setLoading(true);
      const [uniRes, schRes] = await Promise.all([
        fetchApi<UniversityDetail>("/universities/" + uniId + "/"),
        fetchApi<Scholarship[]>("/scholarships/"),
      ]);

      if (uniRes.data) {
        setUniversity(uniRes.data);
      }
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <SmartBack fallback="/universities" label={t("ud.back")} />
        </motion.div>

        {/* University Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 sm:p-10 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                  {university.name}
                </h1>
                {university.is_verified && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("ud.verified")}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-500/20 to-cyan/20 text-cyan border border-cyan/30 px-2.5 py-1 rounded-full font-semibold">
                  🥽 3D VR Console Available
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan" />
                  {university.city}, {university.country}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-purple" />
                  {university.scholarships_count} {t("ud.scholarships")}
                </span>
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan hover:text-purple transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {t("ud.visitWebsite")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {university.description && (
                <p className="text-text-secondary leading-relaxed">
                  <AutoText text={university.description} />
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Virtual Campus Tour */}
        <CampusTour
          name={university.name}
          latitude={university.latitude}
          longitude={university.longitude}
          tagline={university.tagline ?? undefined}
          address={university.address ?? undefined}
          landmarks={university.landmarks ?? []}
        />

        {/* Quick Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: t("ud.location"),
              value: university.city + ", " + university.country,
              icon: <MapPin className="w-5 h-5 text-cyan" />,
            },
            {
              label: t("ud.founded"),
              value: university.founding_year ? String(university.founding_year) : "—",
              icon: <Clock className="w-5 h-5 text-purple" />,
            },
            {
              label: t("ud.scholarships"),
              value: String(university.scholarships_count),
              icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
            },
            {
              label: t("ud.motto"),
              value: university.motto || "—",
              icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
            },
          ].map((fact) => (
            <div key={fact.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                {fact.icon}
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {fact.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary truncate">
                {fact.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* About the University */}
        {university.about && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.17 }}
            className="glass rounded-3xl p-6 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue to-purple flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {t("about.title")}
              </h2>
            </div>
            <div className="space-y-4">
              {(lang === "ar" && university.about_ar
                ? university.about_ar.split("\n\n")
                : university.about.split("\n\n")
              ).map((para, i) =>
                lang === "ar" && university.about_ar ? (
                  <p
                    key={i}
                    dir="auto"
                    className="text-text-secondary leading-relaxed text-[15px]"
                  >
                    {para}
                  </p>
                ) : (
                  <p
                    key={i}
                    className="text-text-secondary leading-relaxed text-[15px]"
                  >
                    <AutoText text={para} />
                  </p>
                )
              )}
            </div>
            {university.wikipedia_url && (
              <a
                href={university.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-text-muted hover:text-cyan transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t("about.source")}
              </a>
            )}
          </motion.div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {scholarships.map((s, i) => (
                <ScholarshipCard key={s.id} scholarship={s} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-text-secondary">
                {t("ud.noSch")}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
