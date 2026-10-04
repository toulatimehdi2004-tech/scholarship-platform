'use client';

import { motion } from "framer-motion";
import { PenLine, Download, Copy, Check, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { fetchApi, getToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function SopPage() {
  const { t, lang } = useLang();
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [university, setUniversity] = useState("");
  const [level, setLevel] = useState("master");
  const [background, setBackground] = useState("");
  const [goals, setGoals] = useState("");
  const [letterLang, setLetterLang] = useState("en");
  const [letter, setLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const loggedIn = !!getToken();

  async function generate() {
    if (!fullName.trim() || !program.trim() || !background.trim() || !goals.trim()) return;
    setGenerating(true);
    setError("");
    setLetter("");
    const res = await fetchApi<{ letter: string }>("/sop/", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName.trim(),
        program: program.trim(),
        university: university.trim(),
        level,
        background: background.trim(),
        goals: goals.trim(),
        lang: letterLang,
      }),
    });
    setGenerating(false);
    if (res.data?.letter) {
      setLetter(res.data.letter);
    } else {
      setError(res.error || "Generation failed.");
    }
  }

  async function download(fmt: "pdf" | "docx") {
    const token = getToken();
    const res = await fetch("http://localhost:8000/api/sop/export/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Token " + token } : {}),
      },
      body: JSON.stringify({ letter, format: fmt, full_name: fullName }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motivation-letter.${fmt === "pdf" ? "pdf" : "docx"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copy() {
    try {
      navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const inputCls =
    "glass rounded-xl py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent w-full border border-border-glass";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <PenLine className="w-8 h-8 text-cyan" />
            {t("sop.title")}
          </h1>
          <p className="text-text-secondary">{t("sop.subtitle")}</p>
        </motion.div>

        {!loggedIn ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-text-secondary mb-4">{t("sop.login")}</p>
            <Link href="/auth/login" className="btn-gradient text-sm px-4 py-2 rounded-lg">
              <span>{t("nav.login")}</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="glass rounded-3xl p-6 sm:p-8 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("sop.name")}
                  </label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("sop.namePh")} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("sop.university")}
                  </label>
                  <input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Tsinghua University" className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">
                    {t("sop.program")}
                  </label>
                  <input value={program} onChange={(e) => setProgram(e.target.value)} placeholder={t("sop.programPh")} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">
                      {t("sop.level")}
                    </label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                      <option value="bachelor" className="bg-surface">{t("sch.bachelor")}</option>
                      <option value="master" className="bg-surface">{t("sch.master")}</option>
                      <option value="phd" className="bg-surface">{t("sch.phd")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">
                      {t("sop.language")}
                    </label>
                    <select value={letterLang} onChange={(e) => setLetterLang(e.target.value)} className={inputCls}>
                      <option value="en" className="bg-surface">English</option>
                      <option value="fr" className="bg-surface">Français</option>
                      <option value="ar" className="bg-surface">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-text-secondary mb-2 block">
                  {t("sop.background")}
                </label>
                <textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder={t("sop.backgroundPh")} rows={4} className={inputCls} />
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary mb-2 block">
                  {t("sop.goals")}
                </label>
                <textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder={t("sop.goalsPh")} rows={3} className={inputCls} />
              </div>
              <button
                onClick={generate}
                disabled={generating}
                className="btn-gradient px-8 py-3 rounded-xl font-semibold w-full sm:w-auto disabled:opacity-50"
              >
                <span>{generating ? t("sop.generating") : t("sop.generate")}</span>
              </button>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>

            {letter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple" />
                    {t("sop.result")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan transition-colors px-3 py-2 rounded-lg border border-border-glass">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                      {copied ? t("sop.copied") : t("sop.copy")}
                    </button>
                    {(letterLang === "en" || letterLang === "fr") && (
                      <button onClick={() => download("pdf")} className="flex items-center gap-1.5 text-xs text-text-primary px-3 py-2 rounded-lg bg-cyan/15 hover:bg-cyan/25 transition-all">
                        <Download className="w-3.5 h-3.5" /> {t("sop.downloadPdf")}
                      </button>
                    )}
                    <button onClick={() => download("docx")} className="flex items-center gap-1.5 text-xs text-text-primary px-3 py-2 rounded-lg bg-purple/15 hover:bg-purple/25 transition-all">
                      <Download className="w-3.5 h-3.5" /> {t("sop.downloadDocx")}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line max-h-[500px] overflow-y-auto" dir="auto">
                  {letter}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
