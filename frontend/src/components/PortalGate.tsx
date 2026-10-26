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
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("is_premium");
        localStorage.removeItem("vip_pass");
        localStorage.removeItem("vip_pass_1");
        localStorage.removeItem("vip_pass_undefined");

        // Keep user in localStorage strictly in sync with paid_vip_accounts
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          const paid = JSON.parse(localStorage.getItem("paid_vip_accounts") || "[]");
          const isPaid = paid.includes(u.username?.toLowerCase());
          if (u.student_profile && u.student_profile.is_premium !== isPaid) {
            u.student_profile.is_premium = isPaid;
            localStorage.setItem("user", JSON.stringify(u));
          }
        }
      } catch {}
    }

    const token = getToken();
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const authOk = Boolean(token && userStr);

    if (!authOk) {
      setIsAuthenticated(false);
      // If unauthenticated and on an internal page, force back to Who Are You root /
      if (pathname !== "/" && !pathname.startsWith("/auth/verify")) {
        router.replace("/");
      }
      setMounted(true);
      return;
    }

    setIsAuthenticated(true);

    // Resolve strict user role
    let role = "student";
    try {
      if (userStr) {
        const parsed = JSON.parse(userStr);
        role = parsed.role || "student";
      }
    } catch {}
    setUserRole(role);
    try {
      localStorage.setItem("portal_role", role);
    } catch {}

    // Strict Role Route Boundaries:
    // A student can NEVER access university or provider portals.
    if (role === "student") {
      if (pathname.startsWith("/university-portal") || pathname.startsWith("/provider-portal")) {
        router.replace("/student-portal");
        return;
      }
    } else if (role === "university") {
      // A university can NEVER access student portal or provider portal
      if (
        pathname.startsWith("/student-portal") ||
        pathname.startsWith("/provider-portal") ||
        pathname.startsWith("/tracker") ||
        pathname.startsWith("/crm") ||
        pathname.startsWith("/pipeline") ||
        pathname.startsWith("/vip") ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/pre-departure") ||
        pathname.startsWith("/agency-services") ||
        pathname.startsWith("/apply")
      ) {
        router.replace("/university-portal");
        return;
      }
    } else if (role === "provider") {
      // A service provider can NEVER access student portal or university portal
      if (
        pathname.startsWith("/student-portal") ||
        pathname.startsWith("/university-portal") ||
        pathname.startsWith("/tracker") ||
        pathname.startsWith("/crm") ||
        pathname.startsWith("/pipeline") ||
        pathname.startsWith("/vip") ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/pre-departure") ||
        pathname.startsWith("/agency-services") ||
        pathname.startsWith("/apply")
      ) {
        router.replace("/provider-portal");
        return;
      }
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

  // Strict barrier: never render forbidden content during navigation
  const isForbidden =
    (userRole === "student" && (pathname.startsWith("/university-portal") || pathname.startsWith("/provider-portal"))) ||
    (userRole === "university" && (
      pathname.startsWith("/student-portal") ||
      pathname.startsWith("/provider-portal") ||
      pathname.startsWith("/tracker") ||
      pathname.startsWith("/crm") ||
      pathname.startsWith("/pipeline") ||
      pathname.startsWith("/vip") ||
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/pre-departure") ||
      pathname.startsWith("/agency-services") ||
      pathname.startsWith("/apply")
    )) ||
    (userRole === "provider" && (
      pathname.startsWith("/student-portal") ||
      pathname.startsWith("/university-portal") ||
      pathname.startsWith("/tracker") ||
      pathname.startsWith("/crm") ||
      pathname.startsWith("/pipeline") ||
      pathname.startsWith("/vip") ||
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/pre-departure") ||
      pathname.startsWith("/agency-services") ||
      pathname.startsWith("/apply")
    ));

  if (isForbidden) {
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
