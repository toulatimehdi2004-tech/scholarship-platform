"use client";

import { motion } from "framer-motion";
import { Mail, Lock, KeyRound, ArrowRight, RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotPassword, resetPassword, sendVerificationCode } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await forgotPassword(email);
    if (res.data) {
      setSuccess("If an account exists with this email, a reset code has been sent.");
      setStep("code");
      setCountdown(60);
    } else {
      setError(res.error || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById("code-" + (index + 1));
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById("code-" + (index - 1));
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setCode(newCode);
      const lastFilled = Math.min(pasted.length, 5);
      const next = document.getElementById("code-" + lastFilled);
      next?.focus();
    }
  };

  const handleResetPassword = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await resetPassword(email, fullCode, newPassword);
    if (res.data) {
      setStep("done");
      setSuccess("Password reset successful!");
    } else {
      setError(res.error || "Reset failed. Please try again.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccess("");
    const res = await sendVerificationCode(email);
    if (res.data) {
      setSuccess("New reset code sent! Check your inbox.");
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
    } else {
      setError(res.error || "Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md glow-purple"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center mx-auto mb-4">
            {step === "done" ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : step === "code" ? (
              <KeyRound className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-7 h-7 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {step === "done"
              ? "Password Reset!"
              : step === "code"
              ? "Enter Reset Code"
              : "Forgot Password?"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {step === "done"
              ? "Your password has been updated successfully."
              : step === "code"
              ? `We sent a 6-digit code to ${email}`
              : "Enter your email to receive a password reset code"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && step !== "done" && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === "email" && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
                />
              </div>
            </div>

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Sending..." : "Send Reset Code"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </span>
            </button>
          </div>
        )}

        {/* Step 2: Enter Code + New Password */}
        {step === "code" && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-3 block">
                6-Digit Code
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={"code-" + i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold glass rounded-xl text-text-primary outline-none input-glow transition-all"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
                />
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Resetting..." : "Reset Password"}
                {!loading && <ShieldCheck className="w-4 h-4" />}
              </span>
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-text-muted hover:text-cyan transition-colors disabled:opacity-40"
              >
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Code
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setStep("email");
                  setCode(["", "", "", "", "", ""]);
                  setError("");
                  setSuccess("");
                }}
                className="text-text-muted hover:text-purple transition-colors"
              >
                Change email
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-text-primary font-medium">
                Your password has been reset successfully!
              </p>
              <p className="text-text-muted text-sm mt-1">
                You can now sign in with your new password.
              </p>
            </div>

            <button
              onClick={() => router.push("/auth/login")}
              className="w-full btn-gradient py-3.5 rounded-xl text-base"
            >
              <span className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-cyan hover:text-purple transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
