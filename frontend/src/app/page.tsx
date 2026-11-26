"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalChooser, { type PortalRole } from "@/components/PortalChooser";
import { useApplicationMode } from "@/lib/ApplicationModeContext";

export default function RootPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<PortalRole | null>(null);
  const { openChoiceModal } = useApplicationMode();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portal_role") as PortalRole | null;
      setCurrentRole(saved);

      // If user already has an account with us, take them directly to their profile!
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token || user) {
        router.push("/profile");
      }
    }
  }, [router]);

  function handleSelectRole(role: PortalRole) {
    if (role === "university" || role === "provider") {
      return;
    }
    try {
      localStorage.setItem("portal_role", "student");
    } catch {}

    // If user already has an account with us: no need to refill application, go directly to profile!
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token") || localStorage.getItem("token")
        : null;
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token || user) {
      router.push("/profile");
      return;
    }

    // New student without an account: show orientation questionnaire
    openChoiceModal();
  }

  return (
    <PortalChooser
      onSelectRole={handleSelectRole}
      currentRole={currentRole}
    />
  );
}
