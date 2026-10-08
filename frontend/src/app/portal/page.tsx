"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalChooser, { type PortalRole } from "@/components/PortalChooser";

export default function PortalPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<PortalRole | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portal_role") as PortalRole | null;
      setCurrentRole(saved);
    }
  }, []);

  function handleSelectRole(role: PortalRole) {
    try {
      localStorage.setItem("portal_role", role);
    } catch {}
    if (role === "university") {
      router.push("/university-portal");
    } else if (role === "provider") {
      router.push("/provider-portal");
    } else {
      router.push("/scholarships");
    }
  }

  return <PortalChooser onSelectRole={handleSelectRole} currentRole={currentRole} />;
}
