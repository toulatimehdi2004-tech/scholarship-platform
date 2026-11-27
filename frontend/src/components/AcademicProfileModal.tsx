"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GraduationCap,
  Award,
  Globe,
  Calendar,
  Sparkles,
  Check,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getAcademicProfile,
  saveAcademicProfile,
  convertGpaTo100,
  type AcademicProfile,
  type GpaScale,
} from "@/lib/academicProfile";

interface AcademicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (profile: AcademicProfile) => void;
}

const COUNTRIES = [
  { code: "MA", name: "Morocco (المملكة المغربية)" },
  { code: "DZ", name: "Algeria (الجزائر)" },
  { code: "TN", name: "Tunisia (تونس)" },
  { code: "EG", name: "Egypt (مصر)" },
  { code: "FR", name: "France" },
  { code: "SN", name: "Senegal" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "NG", name: "Nigeria" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "ID", name: "Indonesia" },
  { code: "GLOBAL", name: "Other / International" },
];

const DEGREES: Array<{
  value: "high_school" | "bachelor" | "master" | "phd";
  label: string;
  sub: string;
}> = [
  {
    value: "high_school",
    label: "High School (Baccalauréat)",
    sub: "Eligible for Bachelor's & Language programs",
  },
  {
    value: "bachelor",
    label: "Bachelor's Degree / Licence",
    sub: "Eligible for Master's programs",
  },
  {
    value: "master",
    label: "Master's Degree / Ingénieur",
    sub: "Eligible for PhD & Postgrad programs",
  },
  {
    value: "phd",
    label: "PhD / Doctorate",
    sub: "Eligible for Postdoc & Research Fellowships",
  },
];

export default function AcademicProfileModal({
  isOpen,
  onClose,
  onSaved,
}: AcademicProfileModalProps) {
  const [profile, setProfile] = useState<AcademicProfile>(getAcademicProfile());
  const [gpaRaw, setGpaRaw] = useState(profile.gpaRaw);
  const [gpaScale, setGpaScale] = useState<GpaScale>(profile.gpaScale);
  const [currentDegree, setCurrentDegree] = useState(profile.currentDegree);
  const [nationality, setNationality] = useState(profile.nationality);
  const [age, setAge] = useState(profile.age || 22);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getAcademicProfile();
      setProfile(current);
      setGpaRaw(current.gpaRaw);
      setGpaScale(current.gpaScale);
      setCurrentDegree(current.currentDegree);
      setNationality(current.nationality);
      setAge(current.age || 22);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const normalizedScore = convertGpaTo100(gpaRaw, gpaScale);

  function getGradeBracket(score: number): { text: string; color: string } {
    if (score >= 85) return { text: "Outstanding / Mention Très Bien (A+)", color: "text-emerald-400" };
    if (score >= 75) return { text: "Very Good / Mention Bien (A)", color: "text-cyan" };
    if (score >= 65) return { text: "Good / Mention Assez Bien (B)", color: "text-amber-400" };
    if (score >= 55) return { text: "Passable / Average (C)", color: "text-orange-400" };
    return { text: "Below Average (May limit competitive scholarships)", color: "text-rose-400" };
  }

  const bracket = getGradeBracket(normalizedScore);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updated: AcademicProfile = {
      ...profile,
      gpaRaw: gpaRaw.trim() || "15.0",
      gpaScale,
      currentDegree,
      nationality: nationality.trim() || "Morocco",
      age: Number(age) || 22,
    };

    saveAcademicProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    if (onSaved) onSaved(updated);

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0c1424] border border-cyan/30 shadow-2xl shadow-cyan/10 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between bg-gradient-to-r from-cyan/10 via-purple-500/10 to-transparent">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Academic Profile</span>
              </div>
              <h3 className="text-lg font-black text-white">
                My Academic Profile & Eligibility
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your GPA in your local grading scale. All scholarship cards will instantly compute your match score!
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
            {/* 1. GPA Scale Selection & Input */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Grade Point Average (GPA / Moyenne)
              </label>

              {/* Scale Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGpaScale("SCALE_20")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    gpaScale === "SCALE_20"
                      ? "bg-cyan text-slate-950 border-cyan shadow-md shadow-cyan/20"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-black text-sm">/ 20</span>
                  <span className="block text-[10px] opacity-80">Maroc / France</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGpaScale("SCALE_100")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    gpaScale === "SCALE_100"
                      ? "bg-cyan text-slate-950 border-cyan shadow-md shadow-cyan/20"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-black text-sm">/ 100</span>
                  <span className="block text-[10px] opacity-80">Percentage %</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGpaScale("SCALE_4")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    gpaScale === "SCALE_4"
                      ? "bg-cyan text-slate-950 border-cyan shadow-md shadow-cyan/20"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-black text-sm">/ 4.0</span>
                  <span className="block text-[10px] opacity-80">US / Global</span>
                </button>
              </div>

              {/* Input Value */}
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={gpaRaw}
                  onChange={(e) => setGpaRaw(e.target.value)}
                  placeholder={
                    gpaScale === "SCALE_20"
                      ? "e.g. 15.5 or 16/20"
                      : gpaScale === "SCALE_4"
                      ? "e.g. 3.6 or 3.8/4.0"
                      : "e.g. 82 or 85%"
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan"
                />
              </div>

              {/* Real-time normalized preview banner */}
              <div className="rounded-xl bg-black/40 border border-white/10 p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Standardized Normalized Score:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {normalizedScore} / 100
                </span>
              </div>
              <p className={`text-[11px] font-semibold ${bracket.color}`}>
                • Bracket: {bracket.text}
              </p>
            </div>

            {/* 2. Highest Completed Academic Degree */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                2. Highest Completed Degree
              </label>
              <div className="space-y-2">
                {DEGREES.map((deg) => (
                  <label
                    key={deg.value}
                    onClick={() => setCurrentDegree(deg.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      currentDegree === deg.value
                        ? "bg-cyan/15 border-cyan text-white shadow-sm"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="degree"
                      value={deg.value}
                      checked={currentDegree === deg.value}
                      onChange={() => setCurrentDegree(deg.value)}
                      className="mt-1 accent-cyan"
                    />
                    <div>
                      <span className="text-xs font-bold block">{deg.label}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {deg.sub}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Nationality & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Country of Citizenship
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Age (Years)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min={15}
                    max={60}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savedSuccess}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan via-blue-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan/20 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Profile Saved! Updating All Scholarships...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Save Profile & Calculate Matches Instantly</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
