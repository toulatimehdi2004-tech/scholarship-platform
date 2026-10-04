"use client";

import { motion } from "framer-motion";
import { Mail, KeyRound, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  sendVerificationCode,
  verifyEmailCode,
  resendVerificationCode,
  setToken,
} from "@/lib/api";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromParams);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(!!emailFromParams);
  const [countdown, setCountdown] = useState(0);

  // Auto-send code if email is provided
  useEffect(() => {
    if (emailFromParams && !codeSent) {
      handleSendCode(emailFromParams);
    }
  }, [emailFromParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (emailAddr: string) => {
    if (!emailAddr.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setSending(true);
    const res = await sendVerificationCode(emailAddr);
    if (res.data) {
      setCodeSent(true);
      setSuccess("Verification code sent! Check your inbox.");
      setCountdown(60);
    } else {
      setError(res.error || "Failed to send code.");
    }
    setSending(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
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

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await verifyEmailCode(email, fullCode);
    if (res.data) {
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Email verified! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setError(res.error || "Verification failed.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccess("");
    const res = await resendVerificationCode();
    if (res.data) {
      setSuccess("New code sent! Check your inbox.");
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
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md glow-cyan"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {codeSent ? "Enter Verification Code" : "Verify Your Email"}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {codeSent
              ? `We sent a 6-digit code to ${email}`
              : "Enter your email to receive a verification code"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {!codeSent ? (
          /* Step 1: Enter email */
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
              onClick={() => handleSendCode(email)}
              disabled={sending}
              className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {sending ? "Sending..." : "Send Verification Code"}
                {!sending && <ArrowRight className="w-4 h-4" />}
              </span>
            </button>
          </div>
        ) : (
          /* Step 2: Enter 6-digit code */
          <div className="space-y-6">
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

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full btn-gradient py-3.5 rounded-xl text-base disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Verifying..." : "Verify & Continue"}
                {!loading && <ShieldCheck className="w-4 h-4" />}
              </span>
            </button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-sm text-text-muted hover:text-cyan transition-colors disabled:opacity-40"
              >
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <span className="flex items-center gap-1.5 justify-center mx-auto">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend Code
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setCodeSent(false);
                setCode(["", "", "", "", "", ""]);
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm text-text-muted hover:text-purple transition-colors"
            >
              Change email address
            </button>
          </div>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Already verified?{" "}
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
