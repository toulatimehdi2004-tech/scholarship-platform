"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type ApplicationMode = "self" | "assisted";

interface ApplicationModeContextType {
  mode: ApplicationMode;
  setMode: (mode: ApplicationMode, navigate?: boolean) => void;
  toggleMode: (navigate?: boolean) => void;
}

const ApplicationModeContext = createContext<ApplicationModeContextType>({
  mode: "self",
  setMode: () => {},
  toggleMode: () => {},
});

const STORAGE_KEY = "student_application_mode";

export function ApplicationModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ApplicationMode>("self");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as ApplicationMode | null;
        if (stored === "assisted" || stored === "self") {
          setModeState(stored);
        } else if (pathname?.startsWith("/assisted-service")) {
          setModeState("assisted");
          localStorage.setItem(STORAGE_KEY, "assisted");
        }
      } catch {}

      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && (e.newValue === "self" || e.newValue === "assisted")) {
          setModeState(e.newValue);
        }
      };

      const handleCustom = (e: Event) => {
        const customEvent = e as CustomEvent<ApplicationMode>;
        if (customEvent.detail === "self" || customEvent.detail === "assisted") {
          setModeState(customEvent.detail);
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener("application_mode_changed", handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("application_mode_changed", handleCustom);
      };
    }
  }, [pathname]);

  const setMode = (newMode: ApplicationMode, navigate = true) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      window.dispatchEvent(
        new CustomEvent("application_mode_changed", { detail: newMode })
      );
    } catch {}

    if (navigate) {
      if (newMode === "assisted") {
        if (!pathname?.startsWith("/assisted-service")) {
          router.push("/assisted-service");
        }
      } else {
        if (pathname?.startsWith("/assisted-service")) {
          router.push("/scholarships");
        }
      }
    }
  };

  const toggleMode = (navigate = true) => {
    const nextMode = mode === "self" ? "assisted" : "self";
    setMode(nextMode, navigate);
  };

  return (
    <ApplicationModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ApplicationModeContext.Provider>
  );
}

export function useApplicationMode() {
  const ctx = useContext(ApplicationModeContext);
  return ctx;
}
