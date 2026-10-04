"use client";

import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, sendVerificationCode } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
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
      setError("Username can only contain letters, numbers, and underscores (no spaces).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const response = await registerUser({ username, email, password });

    if (response.data) {
      // Send verification code to email
      const codeRes = await sendVerificationCode(email);
      // Redirect to verify page
      router.push("/auth/verify?email=" + encodeURIComponent(email));
    } else {
      let msg = response.error || "Registration failed. Please try again.";
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary text-sm mt-1">
            Join the scholarship community
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
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Email
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
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full glass rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
            <span>{loading ? "Creating account..." : "Create Account"}</span>
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-purple hover:text-cyan transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
