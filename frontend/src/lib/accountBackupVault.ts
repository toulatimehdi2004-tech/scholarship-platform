/**
 * ScholarChina Emergency Account Backup Vault & Fail-Safe System
 * 
 * Provides bulletproof resilience:
 * 1. 1-Click Emergency Backup Student Account (pre-configured VIP access)
 * 2. 1-Click Emergency Backup Admin Account (master portal access)
 * 3. Automatic Snapshot Auto-Vault (saves student progress locally to prevent data loss)
 * 4. 1-Click Account Restore if a bug or network error interrupts the session
 */

import { User, StudentProfile, AuthResponse } from "@/lib/api";

export const BACKUP_STORAGE_KEY = "scholar_account_backup_vault";
export const BACKUP_TIMESTAMP_KEY = "scholar_account_backup_timestamp";
export const EVENT_ACCOUNT_RESTORED = "scholar_account_restored";

export interface AccountSnapshot {
  user: User;
  token: string;
  profile?: StudentProfile;
  timestamp: number;
  formattedDate: string;
}

// 🎓 Ready-to-use Emergency Student Account
export const BACKUP_STUDENT_PRESET: { user: User; token: string; profile: StudentProfile } = {
  user: {
    id: 999,
    username: "backup_student",
    email: "backup_student@scholar.ma",
    first_name: "Étudiant",
    last_name: "Secours",
    is_staff: false,
    is_superuser: false,
    role: "student",
    student_profile: {
      id: 999,
      phone: "+212 600000000",
      country: "Morocco",
      city: "Rabat",
      education_level: "Bachelor's Degree / Licence",
      field_of_study: "Computer Science",
      gpa: 3.8,
      is_premium: true,
      saved_scholarships: [1, 2, 3],
    },
  },
  token: "token_backup_student_fail_safe_vault_2026",
  profile: {
    id: 999,
    phone: "+212 600000000",
    country: "Morocco",
    city: "Rabat",
    education_level: "Bachelor's Degree / Licence",
    field_of_study: "Computer Science",
    gpa: 3.8,
    is_premium: true,
    saved_scholarships: [1, 2, 3],
  },
};

// 🛡️ Ready-to-use Emergency Admin Master Account
export const BACKUP_ADMIN_PRESET: { user: User; token: string } = {
  user: {
    id: 998,
    username: "admin_backup",
    email: "backup_admin@scholar.ma",
    first_name: "Admin",
    last_name: "Master Secours",
    is_staff: true,
    is_superuser: true,
    role: "admin",
  },
  token: "token_backup_admin_master_vault_2026",
};

/**
 * Automatically captures and persists an account snapshot to the local vault.
 */
export function saveAccountSnapshot(
  user: User,
  extra?: { profile?: StudentProfile; token?: string }
): void {
  if (typeof window === "undefined" || !user) return;

  try {
    const existingToken =
      extra?.token ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      `token_vault_${btoa(user.username || "user").slice(0, 12)}_${Date.now()}`;

    const profile = extra?.profile || user.student_profile || undefined;

    const snapshot: AccountSnapshot = {
      user: {
        ...user,
        student_profile: profile || user.student_profile,
      },
      token: existingToken,
      profile: profile || (user.student_profile as StudentProfile | undefined),
      timestamp: Date.now(),
      formattedDate: new Date().toLocaleString(),
    };

    // Save current active vault
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(snapshot));
    localStorage.setItem(BACKUP_TIMESTAMP_KEY, String(snapshot.timestamp));

    // Save per-username vault history
    if (user.username) {
      localStorage.setItem(
        `scholar_vault_user_${user.username.toLowerCase()}`,
        JSON.stringify(snapshot)
      );
    }
    if (user.email) {
      localStorage.setItem(
        `scholar_vault_email_${user.email.toLowerCase()}`,
        JSON.stringify(snapshot)
      );
    }
  } catch (err) {
    console.warn("Could not save account snapshot to vault:", err);
  }
}

/**
 * Checks whether an emergency restorable account snapshot is available.
 */
export function hasLocalBackup(usernameOrEmail?: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (usernameOrEmail) {
      const clean = usernameOrEmail.trim().toLowerCase();
      if (
        localStorage.getItem(`scholar_vault_user_${clean}`) ||
        localStorage.getItem(`scholar_vault_email_${clean}`)
      ) {
        return true;
      }
    }
    return !!localStorage.getItem(BACKUP_STORAGE_KEY);
  } catch {
    return false;
  }
}

/**
 * Retrieves the latest account snapshot from the local vault.
 */
export function getLocalBackupSnapshot(usernameOrEmail?: string): AccountSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    if (usernameOrEmail) {
      const clean = usernameOrEmail.trim().toLowerCase();
      const perUser =
        localStorage.getItem(`scholar_vault_user_${clean}`) ||
        localStorage.getItem(`scholar_vault_email_${clean}`);
      if (perUser) return JSON.parse(perUser);
    }

    const general = localStorage.getItem(BACKUP_STORAGE_KEY);
    return general ? JSON.parse(general) : null;
  } catch {
    return null;
  }
}

/**
 * Restores an account from the local vault back into active session.
 */
export function restoreAccountFromSnapshot(usernameOrEmail?: string): {
  success: boolean;
  user?: User;
  token?: string;
} {
  if (typeof window === "undefined") return { success: false };

  const snapshot = getLocalBackupSnapshot(usernameOrEmail);
  if (!snapshot || !snapshot.user) return { success: false };

  try {
    localStorage.setItem("user", JSON.stringify(snapshot.user));
    localStorage.setItem("auth_token", snapshot.token);
    localStorage.setItem("token", snapshot.token);

    if (snapshot.profile) {
      localStorage.setItem("student_profile", JSON.stringify(snapshot.profile));
    } else if (snapshot.user.student_profile) {
      localStorage.setItem("student_profile", JSON.stringify(snapshot.user.student_profile));
    }

    localStorage.setItem("student_application_mode_chosen", "vip");

    // Notify all active listeners across the app
    window.dispatchEvent(
      new CustomEvent(EVENT_ACCOUNT_RESTORED, {
        detail: { user: snapshot.user, token: snapshot.token, restoredFrom: "vault" },
      })
    );

    return {
      success: true,
      user: snapshot.user,
      token: snapshot.token,
    };
  } catch (err) {
    console.error("Failed to restore account from snapshot:", err);
    return { success: false };
  }
}

/**
 * Activates the emergency Student Backup Account with 1 click.
 * Guaranteed to work offline or online with full VIP privileges.
 */
export function loginWithBackupStudent(): AuthResponse {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(BACKUP_STUDENT_PRESET.user));
    localStorage.setItem("auth_token", BACKUP_STUDENT_PRESET.token);
    localStorage.setItem("token", BACKUP_STUDENT_PRESET.token);
    localStorage.setItem("student_profile", JSON.stringify(BACKUP_STUDENT_PRESET.profile));
    localStorage.setItem("student_application_mode_chosen", "vip");
    localStorage.setItem("is_premium", "true");
    localStorage.setItem("vip_pass", "true");

    // Register role
    try {
      const raw = localStorage.getItem("user_role_registry");
      const registry = raw ? JSON.parse(raw) : {};
      registry["backup_student"] = "student";
      localStorage.setItem("user_role_registry", JSON.stringify(registry));
    } catch {}

    // Save as snapshot
    saveAccountSnapshot(BACKUP_STUDENT_PRESET.user, {
      profile: BACKUP_STUDENT_PRESET.profile,
      token: BACKUP_STUDENT_PRESET.token,
    });

    window.dispatchEvent(
      new CustomEvent(EVENT_ACCOUNT_RESTORED, {
        detail: {
          user: BACKUP_STUDENT_PRESET.user,
          token: BACKUP_STUDENT_PRESET.token,
          restoredFrom: "student_preset",
        },
      })
    );
  }

  return {
    message: "Connexion réussie avec le compte étudiant de secours (Fail-Safe)",
    token: BACKUP_STUDENT_PRESET.token,
    role: "student",
    user: BACKUP_STUDENT_PRESET.user,
  };
}

/**
 * Activates the emergency Admin Backup Master Account with 1 click.
 */
export function loginWithBackupAdmin(): AuthResponse {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(BACKUP_ADMIN_PRESET.user));
    localStorage.setItem("auth_token", BACKUP_ADMIN_PRESET.token);
    localStorage.setItem("token", BACKUP_ADMIN_PRESET.token);

    try {
      const raw = localStorage.getItem("user_role_registry");
      const registry = raw ? JSON.parse(raw) : {};
      registry["admin_backup"] = "admin";
      localStorage.setItem("user_role_registry", JSON.stringify(registry));
    } catch {}

    saveAccountSnapshot(BACKUP_ADMIN_PRESET.user, {
      token: BACKUP_ADMIN_PRESET.token,
    });

    window.dispatchEvent(
      new CustomEvent(EVENT_ACCOUNT_RESTORED, {
        detail: {
          user: BACKUP_ADMIN_PRESET.user,
          token: BACKUP_ADMIN_PRESET.token,
          restoredFrom: "admin_preset",
        },
      })
    );
  }

  return {
    message: "Connexion réussie avec le compte administrateur de secours (Master Access)",
    token: BACKUP_ADMIN_PRESET.token,
    role: "admin",
    user: BACKUP_ADMIN_PRESET.user,
  };
}
