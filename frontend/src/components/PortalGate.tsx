"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import LiveCommunicationWidget from "@/components/LiveCommunicationWidget";

interface PortalGateProps {
  navbar: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function PortalGate({ navbar, children, footer }: PortalGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
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

        const savedRole = localStorage.getItem("portal_role") || "student";
        setUserRole(savedRole);
      } catch {}
    }
    setMounted(true);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09]">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  // The Root page `/` is ALWAYS "Who Are You?" Portal Chooser
  if (pathname === "/") {
    return (
      <>
        <main>{children}</main>
        <LiveCommunicationWidget />
      </>
    );
  }

  // Email verification bypass
  if (pathname.startsWith("/auth/verify")) {
    return (
      <>
        {navbar}
        <main className="relative z-10 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
        {footer}
        <LiveCommunicationWidget />
      </>
    );
  }

  // Dedicated Dashboard Layout with Left Sidebar (matching Screenshot 1)
  if (
    pathname === "/student-portal" ||
    pathname === "/student-portal/" ||
    pathname === "/scholarships" ||
    pathname === "/scholarships/" ||
    pathname.startsWith("/scholarships/")
  ) {
    return (
      <>
        <main className="relative z-10 min-h-screen bg-transparent">{children}</main>
        <LiveCommunicationWidget />
      </>
    );
  }

  // University and Provider Portals full screen layout
  if (pathname.startsWith("/university-portal") || pathname.startsWith("/provider-portal")) {
    return (
      <>
        <main className="relative z-10 min-h-screen">{children}</main>
        <LiveCommunicationWidget />
      </>
    );
  }

  // All other public routes: scholarships, universities, tracker, csca, etc.
  return (
    <>
      {navbar}
      <main className="relative z-10 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      {footer}
      <LiveCommunicationWidget />
    </>
  );
}
