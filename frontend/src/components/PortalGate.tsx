"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/api";
import PortalChooser, { type PortalRole } from "./PortalChooser";

interface PortalGateProps {
  children: React.ReactNode;
}

export default function PortalGate({ children }: PortalGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!token || !userStr) {
      // Purge any orphan/stale premium flags when unauthenticated
      try {
        localStorage.removeItem("is_premium");
        localStorage.removeItem("vip_pass");
      } catch {}
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, [pathname]);

  // While checking local storage on initial mount, show a clean minimal splash
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Allow verification page to render without token if completing email verification
  if (pathname.startsWith("/auth/verify")) {
    return <>{children}</>;
  }

  // If unauthenticated: The ONLY view presented is the "Who Are You?" Portal Chooser
  if (!isAuthenticated) {
    return (
      <PortalChooser
        onSelectRole={(role: PortalRole) => {
          setIsAuthenticated(true);
          try {
            localStorage.setItem("portal_role", role);
          } catch {}
          if (role === "university") {
            router.push("/university-portal");
          } else if (role === "provider") {
            router.push("/provider-portal");
          } else {
            router.push("/");
          }
        }}
      />
    );
  }

  // If authenticated: Render internal application content with navbar and footer
  return <>{children}</>;
}
