"use client";

import { useState, useEffect } from "react";
import { Sparkles, SlidersHorizontal, Award, GraduationCap, Globe, CheckCircle2 } from "lucide-react";
import {
  getAcademicProfile,
  onAcademicProfileUpdated,
  convertGpaTo100,
  hasCustomAcademicProfile,
  type AcademicProfile,
} from "@/lib/academicProfile";
import AcademicProfileModal from "./AcademicProfileModal";

interface AcademicProfileBannerProps {
  className?: string;
}

export default function AcademicProfileBanner({
  className = "",
}: AcademicProfileBannerProps) {
  const [profile, setProfile] = useState<AcademicProfile>(getAcademicProfile());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCustom, setHasCustom] = useState(false);

  useEffect(() => {
    setProfile(getAcademicProfile());
    setHasCustom(hasCustomAcademicProfile());

    const unsubscribe = onAcademicProfileUpdated((updated) => {
      setProfile(updated);
      setHasCustom(true);
    });

    return unsubscribe;
  }, []);

  const normalized = convertGpaTo100(profile.gpaRaw, profile.gpaScale);
  const scaleText =
    profile.gpaScale === "SCALE_20"
      ? "/ 20 (Maroc)"
      : profile.gpaScale === "SCALE_4"
      ? "/ 4.0 (Global)"
      : "% (Percentage)";

  const degreeText = {
    high_school: "High School (Bac)",
    bachelor: "Bachelor / Licence",
    master: "Master / Ingénieur",
    phd: "PhD / Doctorate",
  }[profile.currentDegree];

  return (
    <>
      <div
        className={`rounded-2xl bg-gradient-to-r from-cyan/15 via-[#0d172e] to-purple-500/15 border border-cyan/30 p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}
      >
        {/* Ambient background light */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan to-blue-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan/20">
            <Sparkles className="w-5 h-5 font-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan/20 text-cyan border border-cyan/30">
                Smart Eligibility Matcher Active
              </span>
              {hasCustom && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Personalized
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mt-1">
              My Academic Profile:{" "}
              <span className="text-cyan font-black">
                {profile.gpaRaw} {scaleText}
              </span>{" "}
              <span className="text-slate-400 text-xs font-normal">
                (Normalized: {normalized}/100)
              </span>
            </h3>

            <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                {degreeText}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan" />
                {profile.nationality}
              </span>
              <span>•</span>
              <span>Age {profile.age || 22}</span>
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan to-blue-500 hover:from-cyan/90 hover:to-blue-500/90 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-cyan/20 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit My GPA & Profile</span>
          </button>
        </div>
      </div>

      <AcademicProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
