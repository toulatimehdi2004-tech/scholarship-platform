"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Share2,
  Copy,
  Check,
  HelpCircle,
  GraduationCap,
  Building2,
  FileText,
  Clock,
  Layers,
  HeartHandshake,
} from "lucide-react";
import LifetimePassModal from "@/components/LifetimePassModal";
import AuthGateModal from "@/components/AuthGateModal";
import { getToken, getCurrentUser, type User } from "@/lib/api";
import { useEffect } from "react";

type Currency = "MAD" | "USD" | "EUR" | "RMB";

const CURRENCY_CONFIG: Record<
  Currency,
  { label: string; symbol: string; vipPrice: string; originalPrice: string; flag: string }
> = {
  MAD: { label: "Moroccan Dirham", symbol: "DH", vipPrice: "290 DH", originalPrice: "990 DH", flag: "🇲🇦" },
  USD: { label: "US Dollar", symbol: "$", vipPrice: "$29", originalPrice: "$99", flag: "🇺🇸" },
  EUR: { label: "Euro", symbol: "€", vipPrice: "27 €", originalPrice: "90 €", flag: "🇪🇺" },
  RMB: { label: "Chinese Yuan", symbol: "¥", vipPrice: "210 ¥", originalPrice: "700 ¥", flag: "🇨🇳" },
};

const COMPARISON_FEATURES = [
  { feature: "Top Chinese Universities", free: "Top 7 Universities", vip: "All 100+ Campuses (3D VR Tours)" },
  { feature: "CSC & Provincial Scholarships", free: "5 per category", vip: "400+ Verified Real Grants" },
  { feature: "Direct Official Portal Links", free: false, vip: true },
  { feature: "ScholarChina Application Pipeline CRM", free: "Limited (3 apps)", vip: "Unlimited In-Flight Pipeline" },
  { feature: "Document Checklist & Deadline Alerts", free: "Basic", vip: "Full Auto-Calculated Progress" },
  { feature: "AI Scholarship Matching Chatbot", free: "3 messages / day", vip: "Unlimited AI Inquiries" },
  { feature: "SOP & Motivation Letter Generator", free: false, vip: "Unlimited (PDF & DOCX Export)" },
  { feature: "Funding Breakdown & Net Cost Meter", free: true, vip: true },
  { feature: "Admissions Office Direct Contacts", free: false, vip: true },
  { feature: "Zero Agency Middleman Fees", free: true, vip: true },
];

const FAQS = [
  {
    q: "Is this really a one-time payment, or will I be charged every month?",
    a: "It is 100% a one-time payment. You pay $29 (~290 DH) once and receive permanent, lifetime access to all current and future universities, scholarships, and AI matching tools. Zero recurring fees, zero surprises.",
  },
  {
    q: "How does this compare to hiring a study abroad agency in Morocco?",
    a: "Traditional agencies in Morocco charge between 15,000 DH and 35,000 DH ($1,500 - $3,500) to submit Chinese university applications. ScholarChina provides you with direct links to the official university and CSC portals, required document checklists, and acceptance benchmarks so you can apply directly and keep 100% of your money.",
  },
  {
    q: "Which scholarships are included in the Lifetime VIP pass?",
    a: "All major Chinese government and university scholarships, including CSC Type A (Bilateral Program), CSC Type B (University Program), Provincial Government Scholarships (e.g., Jiangsu, Zhejiang, Shanghai), and University Presidential Full Waivers.",
  },
  {
    q: "What happens right after I activate the VIP Pass?",
    a: "Your account is immediately upgraded to VIP status. All university cards, official portal links, document checklists, and unlimited AI chat become instantly accessible on your desktop and phone.",
  },
  {
    q: "Can I share this VIP plan with my friends?",
    a: "Yes! Use the 'Share Link' button on this page to send the link directly to friends or classmates via WhatsApp or Telegram so they can view the full scholarship database.",
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("MAD");
  const [user, setUser] = useState<User | null>(null);
  const [showLifetimeModal, setShowLifetimeModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (getToken()) {
      getCurrentUser().then((res) => {
        if (res.data) setUser(res.data);
      });
    }
  }, []);

  const handleCtaClick = () => {
    if (!getToken()) {
      setShowAuthGate(true);
    } else {
      setShowLifetimeModal(true);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://moroccanscholar.com/pricing";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentPrice = CURRENCY_CONFIG[currency];

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30 mb-4 animate-shimmer"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>One-Time Investment • Lifetime Scholar Access</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            Invest In Your Future in China,{" "}
            <span className="gradient-text">Not In Agency Fees</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Full direct access to 100+ Chinese universities, 400+ CSC full scholarships, and our interactive
            ScholarChina pipeline. Pay once. Never pay recurring subscriptions.
          </motion.p>

          {/* Currency Switcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 inline-flex items-center p-1.5 rounded-2xl glass border border-border-glass shadow-md"
          >
            {(["MAD", "USD", "EUR", "RMB"] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currency === cur
                    ? "bg-cyan text-white shadow-md shadow-cyan/20 scale-105"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                <span>{CURRENCY_CONFIG[cur].flag}</span>
                <span>{cur}</span>
              </button>
            ))}
          </motion.div>

          {/* Share Link Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-cyan transition-colors px-3 py-1 rounded-lg hover:bg-cyan/10"
              title="Copy link to send to a friend"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Link copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share this VIP plan with a friend</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 items-stretch">
          {/* Free Explorer Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-border-glass relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Free Explorer
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-text-secondary">
                  No Card Required
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-text-primary">$0</span>
                  <span className="text-sm text-text-muted">/ forever</span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-2">
                  Sample our platform and browse basic university listings.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Included in Free:
                </div>
                {[
                  "Preview top 7 Chinese Universities",
                  "5 scholarships preview per category",
                  "3 AI Assistant queries per day",
                  "Basic funding breakdown calculator",
                  "General public forum guides",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
                {[
                  "Locked official portal application links",
                  "No automated Kanban CRM pipeline",
                  "No statement of purpose (SOP) generator",
                  "No deadline alerts or document checklist",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-text-muted opacity-60">
                    <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-through">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/scholarships"
              className="w-full py-3.5 px-6 rounded-2xl glass text-center text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all border border-border-glass"
            >
              Browse Free Preview
            </Link>
          </motion.div>

          {/* Scholar Lifetime VIP Pass Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 relative overflow-hidden"
          >
            {/* Top Ribbon */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-md">
              👑 Most Popular • Lifetime VIP
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                  Scholar VIP Pass
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  SAVE 70%
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-text-primary">
                    {currentPrice.vipPrice}
                  </span>
                  <span className="text-sm text-text-muted line-through">
                    {currentPrice.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-cyan ml-1">
                    One-Time Only
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-2">
                  Pay once, own forever. Zero monthly fees, zero hidden agency markups.
                </p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Everything You Unlock For Life:
                </div>
                {[
                  "All 100+ Chinese Universities & 3D VR Campuses",
                  "400+ Verified CSC, Provincial & Presidential Grants",
                  "Direct Official University Application Portal Links",
                  "ScholarChina Pipeline CRM (Drag & Drop Kanban)",
                  "Custom Document Checklists & Deadline Countdown",
                  "Unlimited AI Scholarship Matching & Chat",
                  "AI Motivation Letter (SOP) Writer with DOCX Export",
                  "Line-by-Line Funding Breakdown (0 DH Net Cost)",
                  "Past Admits Benchmark & Realistic Acceptance Odds",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-text-primary font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {user?.student_profile?.is_premium ? (
                <div className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VIP Pass Active on Your Account</span>
                </div>
              ) : (
                <button
                  onClick={handleCtaClick}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:opacity-95 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Crown className="w-5 h-5 text-amber-200" />
                  <span>Unlock VIP Lifetime Pass ({currentPrice.vipPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted mt-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  100% Secure Checkout
                </span>
                <span>•</span>
                <span>Instant Activation</span>
                <span>•</span>
                <span>Pay Once</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Agency Cost Comparison Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 glass rounded-3xl p-6 sm:p-8 border border-border-glass bg-gradient-to-br from-cyan/5 via-transparent to-purple/5"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-cyan">
                <HeartHandshake className="w-4 h-4" />
                Empowering Moroccan Students
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                Why Pay 20,000 DH to an Agency When You Can Apply Directly?
              </h3>
              <p className="text-sm text-text-secondary max-w-2xl">
                Commercial agencies in Morocco charge students between 15,000 DH and 30,000 DH simply to copy-paste documents into official university portals. ScholarChina gives you the exact direct portal links, requirements, and document templates for a one-time 290 DH investment.
              </p>
            </div>
            <button
              onClick={handleCtaClick}
              className="btn-gradient text-sm px-6 py-3 rounded-xl flex-shrink-0 cursor-pointer"
            >
              <span>Get Direct Access Now</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Full Feature Comparison
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              See how the Free Explorer stacks up against the Lifetime VIP Pass.
            </p>
          </div>

          <div className="glass rounded-3xl border border-border-glass overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-glass bg-white/5">
                    <th className="py-4 px-6 font-bold text-text-primary">Features & Resources</th>
                    <th className="py-4 px-6 font-bold text-text-secondary w-44">Free Explorer</th>
                    <th className="py-4 px-6 font-bold text-cyan w-56 bg-cyan/5">
                      Scholar VIP Pass
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-glass">
                  {COMPARISON_FEATURES.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 text-text-primary font-medium">{item.feature}</td>
                      <td className="py-3.5 px-6 text-text-secondary">
                        {typeof item.free === "boolean" ? (
                          item.free ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400 opacity-60" />
                          )
                        ) : (
                          item.free
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-text-primary bg-cyan/5">
                        {typeof item.vip === "boolean" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          item.vip
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Frequently Asked Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Everything you need to know about the Scholar Lifetime VIP Pass.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5 border border-border-glass hover:border-cyan/30 transition-all"
              >
                <h4 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center p-8 glass rounded-3xl border border-amber-500/30">
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Ready to Win Your Chinese University Scholarship?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Join ambitious scholars studying across China on ScholarChina. One single payment of {currentPrice.vipPrice}.
            </p>
            <button
              onClick={handleCtaClick}
              className="btn-gradient text-sm px-8 py-3.5 rounded-xl cursor-pointer"
            >
              <span>Unlock All 100+ Universities Now</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Global Modals */}
      <LifetimePassModal
        isOpen={showLifetimeModal}
        onClose={() => setShowLifetimeModal(false)}
        onSuccess={() => {
          getCurrentUser().then((res) => {
            if (res.data) setUser(res.data);
          });
        }}
      />

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to Unlock VIP Access"
        subtitle="Create a student account or sign in to activate your lifetime scholarship pass."
      />
    </div>
  );
}
