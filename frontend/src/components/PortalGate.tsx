"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

interface PortalGateProps {
  navbar: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function PortalGate({ navbar, children, footer }: PortalGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const authOk = Boolean(token && userStr);

    if (!authOk) {
      try {
        localStorage.removeItem("is_premium");
        localStorage.removeItem("vip_pass");
      } catch {}
      setIsAuthenticated(false);
      // If unauthenticated and on an internal page, force back to Who Are You root /
      if (pathname !== "/" && !pathname.startsWith("/auth/verify")) {
        router.push("/");
      }
    } else {
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, [pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // The Root page `/` is ALWAYS "Who Are You?" Portal Chooser
  if (pathname === "/") {
    return <main>{children}</main>;
  }

  // Email verification bypass
  if (pathname.startsWith("/auth/verify")) {
    return (
      <>
        {navbar}
        <main className="relative z-10 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
        {footer}
      </>
    );
  }

  // If unauthenticated on any other route: redirecting to /
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated internal routes: render Navbar, Content, and Footer
  return (
    <>
      {navbar}
      <main className="relative z-10 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      {footer}
    </>
  );
}
