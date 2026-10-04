"use client";

import { motion } from "framer-motion";
import { User, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const response = await loginUser({ username, password });

    if (response.data) {
      setToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      router.push("/dashboard");
    } else {
      // Check if needs verification
      const errData = response as any;
      if (errData.needs_verification && errData.email) {
        router.push("/auth/verify?email=" + encodeURIComponent(errData.email));
        return;
      }
      let msg = response.error || "Login failed. Please check your credentials.";
      if (msg === "Invalid credentials.") {
        msg = "Wrong username or password.";
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
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md glow-cyan"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary text-sm mt-1">
            Sign in to access your scholarships
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-purple hover:text-cyan transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-cyan hover:text-purple transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
