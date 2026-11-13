"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type ApplicationMode = "self" | "assisted";

interface ApplicationModeContextType {
  mode: ApplicationMode;
  setMode: (mode: ApplicationMode, navigate?: boolean) => void;
  toggleMode: (navigate?: boolean) => void;
  hasChosenMode: boolean;
  showChoiceModal: boolean;
  openChoiceModal: () => void;
  closeChoiceModal: () => void;
  chooseMode: (chosenMode: ApplicationMode) => void;
  resetChoiceImposition: () => void;
}

const ApplicationModeContext = createContext<ApplicationModeContextType>({
  mode: "self",
  setMode: () => {},
  toggleMode: () => {},
  hasChosenMode: false,
  showChoiceModal: false,
  openChoiceModal: () => {},
  closeChoiceModal: () => {},
  chooseMode: () => {},
  resetChoiceImposition: () => {},
});

const STORAGE_KEY = "student_application_mode";
const CHOSEN_KEY = "student_application_mode_chosen";

export function ApplicationModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ApplicationMode>("self");
  const [hasChosenMode, setHasChosenMode] = useState<boolean>(false);
  const [showChoiceModal, setShowChoiceModal] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as ApplicationMode | null;
        const chosen = localStorage.getItem(CHOSEN_KEY) === "true";
        const requireChoice = sessionStorage.getItem("require_application_choice") === "true";

        if (stored === "assisted" || stored === "self") {
          setModeState(stored);
        } else if (pathname?.startsWith("/assisted-service")) {
          setModeState("assisted");
          localStorage.setItem(STORAGE_KEY, "assisted");
        }

        setHasChosenMode(chosen);

        // If not chosen yet or forced via session, open the choice modal on student pages
        const isStudentPath =
          pathname === "/student-portal" ||
          pathname?.startsWith("/student-portal") ||
          pathname?.startsWith("/scholarships") ||
          pathname?.startsWith("/assisted-service") ||
          pathname?.startsWith("/tracker") ||
          pathname?.startsWith("/universities");

        if (!chosen || requireChoice) {
          if (isStudentPath) {
            setShowChoiceModal(true);
          }
        }
      } catch {}

      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && (e.newValue === "self" || e.newValue === "assisted")) {
          setModeState(e.newValue);
        }
        if (e.key === CHOSEN_KEY) {
          setHasChosenMode(e.newValue === "true");
        }
      };

      const handleCustom = (e: Event) => {
        const customEvent = e as CustomEvent<ApplicationMode>;
        if (customEvent.detail === "self" || customEvent.detail === "assisted") {
          setModeState(customEvent.detail);
        }
      };

      const handleRequireChoice = () => {
        setShowChoiceModal(true);
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener("application_mode_changed", handleCustom);
      window.addEventListener("require_application_choice", handleRequireChoice);
      window.addEventListener("open_application_choice_modal", handleRequireChoice);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("application_mode_changed", handleCustom);
        window.removeEventListener("require_application_choice", handleRequireChoice);
        window.removeEventListener("open_application_choice_modal", handleRequireChoice);
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

  const chooseMode = (chosenMode: ApplicationMode) => {
    setModeState(chosenMode);
    setHasChosenMode(true);
    setShowChoiceModal(false);

    try {
      localStorage.setItem(STORAGE_KEY, chosenMode);
      localStorage.setItem(CHOSEN_KEY, "true");
      sessionStorage.removeItem("require_application_choice");
      window.dispatchEvent(
        new CustomEvent("application_mode_changed", { detail: chosenMode })
      );
    } catch {}

    if (chosenMode === "assisted") {
      router.push("/assisted-service");
    } else {
      if (pathname?.startsWith("/assisted-service")) {
        router.push("/student-portal");
      }
    }
  };

  const toggleMode = (navigate = true) => {
    const nextMode = mode === "self" ? "assisted" : "self";
    setMode(nextMode, navigate);
  };

  const openChoiceModal = () => setShowChoiceModal(true);
  const closeChoiceModal = () => setShowChoiceModal(false);

  const resetChoiceImposition = () => {
    try {
      localStorage.removeItem(CHOSEN_KEY);
      sessionStorage.setItem("require_application_choice", "true");
    } catch {}
    setHasChosenMode(false);
    setShowChoiceModal(true);
  };

  return (
    <ApplicationModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        hasChosenMode,
        showChoiceModal,
        openChoiceModal,
        closeChoiceModal,
        chooseMode,
        resetChoiceImposition,
      }}
    >
      {children}
    </ApplicationModeContext.Provider>
  );
}

export function useApplicationMode() {
  const ctx = useContext(ApplicationModeContext);
  return ctx;
}
