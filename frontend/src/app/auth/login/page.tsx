"use client";

import { motion } from "framer-motion";
import { User, Lock, LogIn, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, setToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password;

    const response = await loginUser({
      username: cleanUsername,
      password: cleanPassword,
    });

    if (response.data) {
      setToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("portal_role", response.data.role || "student");
      router.push("/dashboard");
    } else {
      // Check if needs verification
      const errData = response as any;
      if (errData.needs_verification && errData.email) {
        router.push("/auth/verify?email=" + encodeURIComponent(errData.email));
        return;
      }
      let msg = response.error || (lang === "ar" ? "فشل تسجيل الدخول. يرجى التحقق من بياناتك." : "Login failed. Please check your credentials.");
      if (msg === "Invalid credentials.") {
        msg = lang === "ar" ? "اسم المستخدم أو البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Wrong username, email, or password.";
      }
      setError(msg);
    }
    setLoading(false);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md glow-cyan"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            {lang === "ar" ? "تسجيل الدخول إلى " : "Sign In to "}
            <span className="text-blue-500">ScholarChina</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {lang === "ar"
              ? "الوصول إلى مطابقة المنح الدراسية ومسار تقديم الطلبات"
              : "Access your scholarship matches & application pipeline"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex flex-col gap-1.5">
            <div className="font-semibold">{error}</div>
            <div className="text-xs text-text-muted">
              {lang === "ar" ? "نسيت كلمة المرور؟ " : "Forgot password? "}
              <Link href="/auth/forgot-password" className="text-cyan underline font-medium">
                {lang === "ar" ? "استعدها هنا" : "Reset it here"}
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {lang === "ar" ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === "ar" ? "أدخل اسم المستخدم أو البريد الإلكتروني" : "Enter username or email address"}
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary block">
                {lang === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-cyan hover:underline transition-colors"
              >
                {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-11 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? (lang === "ar" ? "جاري الدخول..." : "Signing in...") : (lang === "ar" ? "تسجيل الدخول" : "Sign In")}</span>
          </button>
        </form>

        {/* Quick Demo Access Box */}
        <div className="mt-6 pt-5 border-t border-border-glass">
          <div className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>{lang === "ar" ? "بيانات الدخول السريع:" : "Quick Login Credentials:"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("mehdi", "mehdi123")}
              className="px-2.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-left transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300">
                User: mehdi
              </div>
              <div className="text-[10px] text-text-muted">Pass: mehdi123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("yassine_benali", "student123456")}
              className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-left transition-all cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
                {lang === "ar" ? "طالب تجريبي" : "Demo Student"}
              </div>
              <div className="text-[10px] text-text-muted">student123456</div>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          {lang === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
          <Link
            href="/auth/register"
            className="text-cyan hover:text-purple transition-colors font-medium"
          >
            {lang === "ar" ? "أنشئ حساباً جديداً" : "Create one"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

