"use client";

import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, sendVerificationCode } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(
        lang === "ar"
          ? "يمكن أن يحتوي اسم المستخدم فقط على أحرف وأرقام وشرطات سفلية (بدون مسافات)."
          : "Username can only contain letters, numbers, and underscores (no spaces)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    setLoading(true);

    const response = await registerUser({ username, email, password });

    if (response.data) {
      // Send verification code to email
      await sendVerificationCode(email);
      // Redirect to verify page
      router.push("/auth/verify?email=" + encodeURIComponent(email));
    } else {
      let msg = response.error || (lang === "ar" ? "فشل إنشاء الحساب. يرجى المحاولة مجدداً." : "Registration failed. Please try again.");
      if (msg.includes("[") || msg.includes("{")) {
        try {
          const parsed = JSON.parse(msg);
          const messages = [];
          for (const [field, errors] of Object.entries(parsed)) {
            messages.push(`${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`);
          }
          msg = messages.join(" | ");
        } catch {}
      }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md glow-purple"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            {lang === "ar" ? "انضم إلى " : "Join "}
            <span className="text-blue-500">ScholarChina</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {lang === "ar"
              ? "أنشئ حساباً لاستكشاف أكثر من 100 جامعة ومنح CSC"
              : "Create an account to explore 100+ universities & CSC grants"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {lang === "ar" ? "اسم المستخدم" : "Username"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === "ar" ? "اختر اسم مستخدم" : "Choose a username"}
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {lang === "ar" ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {lang === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "ar" ? "أنشئ كلمة مرور" : "Create a password"}
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang === "ar" ? "أعد إدخال كلمة المرور" : "Confirm your password"}
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50"
          >
            <span>{loading ? (lang === "ar" ? "جاري إنشاء الحساب..." : "Creating account...") : (lang === "ar" ? "إنشاء حساب" : "Create Account")}</span>
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          {lang === "ar" ? "لديك حساب بالفعل؟ " : "Already have an account? "}
          <Link
            href="/auth/login"
            className="text-purple hover:text-cyan transition-colors font-medium"
          >
            {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
