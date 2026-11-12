"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PortalChooser, { type PortalRole } from "@/components/PortalChooser";

export default function RootPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<PortalRole | null>(null);

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
    router.push("/student-portal/");
  }

  return (
    <PortalChooser
      onSelectRole={handleSelectRole}
      currentRole={currentRole}
    />
  );
}
