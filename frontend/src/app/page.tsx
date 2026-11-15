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
    }
  }, []);

  function handleSelectRole(role: PortalRole) {
    if (role === "university" || role === "provider") {
      return;
    }
    try {
      localStorage.setItem("portal_role", "student");
    } catch {}

    // When they choose they are a student, immediately show/impose the questionnaire!
    openChoiceModal();
  }

  return (
    <PortalChooser
      onSelectRole={handleSelectRole}
      currentRole={currentRole}
    />
  );
}
