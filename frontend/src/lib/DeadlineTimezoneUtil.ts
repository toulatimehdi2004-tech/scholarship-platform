/**
 * DeadlineTimezoneUtil (Frontend TypeScript)
 * Converts UTC deadlines into:
 * 1. Host university timezone (defaults to Asia/Shanghai, UTC+8 for Chinese universities)
 * 2. User's local browser timezone (automatically detected via Intl API, e.g. Africa/Casablanca, Europe/Paris)
 * 
 * Provides rich countdown calculations, localized formatted strings, and document validity checks.
 */

export interface FormattedTimezone {
  timezone: string;
  formatted: string;
  dateStr: string;
  timeStr: string;
  offsetStr: string;
}

export interface ConvertedDeadlines {
  isSet: boolean;
  rawUtc: string | null;
  utcFormatted: string;
  host: FormattedTimezone;
  user: FormattedTimezone;
  daysRemaining: number;
  hoursRemaining: number;
  totalSeconds: number;
  isPassed: boolean;
  isUrgent: boolean;
  isCritical: boolean;
  humanCountdown: string;
}

export interface DocumentDeadlineConflict {
  hasConflict: boolean;
  severity: "critical" | "warning" | "ok";
  rule: "EXPIRES_BEFORE_DEADLINE" | "EXPIRES_NEAR_DEADLINE" | "VALID";
  daysDifference: number;
  messageEn: string;
  messageFr: string;
  messageAr: string;
}

export class DeadlineTimezoneUtil {
  public static readonly DEFAULT_HOST_TIMEZONE = "Asia/Shanghai";

  /**
   * Automatically detects the user's browser local timezone.
   * Falls back to 'Africa/Casablanca' if undetectable or SSR.
   */
  public static getUserBrowserTimezone(): string {
    if (typeof window !== "undefined") {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) return detected;
      } catch {}
    }
    return "Africa/Casablanca";
  }

  /**
   * Formats a Date object in a specified IANA timezone.
   */
  public static formatInTimezone(
    date: Date,
    timeZone: string,
    lang: "en" | "fr" | "ar" = "en"
  ): FormattedTimezone {
    try {
      const dateStr = new Intl.DateTimeFormat(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US", {
        timeZone,
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);

      const timeStr = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      // Get GMT/UTC offset string
      const offsetPart = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset",
      })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value || "";

      return {
        timezone: timeZone,
        formatted: `${dateStr} ${timeStr} (${timeZone.split("/").pop()?.replace("_", " ")}, ${offsetPart})`,
        dateStr,
        timeStr,
        offsetStr: offsetPart,
      };
    } catch {
      return {
        timezone: timeZone,
        formatted: date.toLocaleString(),
        dateStr: date.toLocaleDateString(),
        timeStr: date.toLocaleTimeString(),
        offsetStr: "UTC",
      };
    }
  }

  /**
   * Converts a UTC deadline ISO string into both the host university's timezone
   * and the user's browser timezone with countdown metadata.
   */
  public static convertDeadline(
    utcInput: string | Date | null | undefined,
    hostTimezone: string = DeadlineTimezoneUtil.DEFAULT_HOST_TIMEZONE,
    userTimezone?: string,
    lang: "en" | "fr" | "ar" = "en"
  ): ConvertedDeadlines {
    const userTz = userTimezone || DeadlineTimezoneUtil.getUserBrowserTimezone();
    const hostTz = hostTimezone || DeadlineTimezoneUtil.DEFAULT_HOST_TIMEZONE;

    if (!utcInput) {
      return {
        isSet: false,
        rawUtc: null,
        utcFormatted: "No deadline specified",
        host: { timezone: hostTz, formatted: "N/A", dateStr: "", timeStr: "", offsetStr: "" },
        user: { timezone: userTz, formatted: "N/A", dateStr: "", timeStr: "", offsetStr: "" },
        daysRemaining: 0,
        hoursRemaining: 0,
        totalSeconds: 0,
        isPassed: false,
        isUrgent: false,
        isCritical: false,
        humanCountdown: "No deadline specified",
      };
    }

    const date = typeof utcInput === "string" ? new Date(utcInput) : utcInput;
    if (isNaN(date.getTime())) {
      return {
        isSet: false,
        rawUtc: null,
        utcFormatted: "Invalid date",
        host: { timezone: hostTz, formatted: "Invalid", dateStr: "", timeStr: "", offsetStr: "" },
        user: { timezone: userTz, formatted: "Invalid", dateStr: "", timeStr: "", offsetStr: "" },
        daysRemaining: 0,
        hoursRemaining: 0,
        totalSeconds: 0,
        isPassed: false,
        isUrgent: false,
        isCritical: false,
        humanCountdown: "Invalid date",
      };
    }

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));

    const isPassed = diffMs < 0;
    const isUrgent = daysRemaining <= 14 && daysRemaining >= 0;
    const isCritical = daysRemaining <= 3 && daysRemaining >= 0;

    const hostFormatted = DeadlineTimezoneUtil.formatInTimezone(date, hostTz, lang);
    const userFormatted = DeadlineTimezoneUtil.formatInTimezone(date, userTz, lang);

    const utcFormatted = date.toUTCString().replace("GMT", "UTC");

    let humanCountdown = "";
    if (isPassed) {
      const absDays = Math.abs(daysRemaining);
      humanCountdown = lang === "ar"
        ? `انتهى الموعد منذ ${absDays} يوم`
        : lang === "fr"
        ? `Expiré il y a ${absDays} jour${absDays > 1 ? "s" : ""}`
        : `Expired ${absDays} day${absDays > 1 ? "s" : ""} ago`;
    } else if (daysRemaining === 0) {
      humanCountdown = lang === "ar" ? "ينتهي اليوم!" : lang === "fr" ? "Se termine aujourd'hui !" : "Closes today!";
    } else if (daysRemaining === 1) {
      humanCountdown = lang === "ar" ? "ينتهي غداً!" : lang === "fr" ? "Dernier jour demain !" : "Closes tomorrow!";
    } else if (isUrgent) {
      humanCountdown = lang === "ar"
        ? `عاجل: متبقي ${daysRemaining} يوم`
        : lang === "fr"
        ? `Urgent : ${daysRemaining} jours restants`
        : `Urgent: ${daysRemaining} days left`;
    } else {
      humanCountdown = lang === "ar"
        ? `متبقي ${daysRemaining} يوم`
        : lang === "fr"
        ? `${daysRemaining} jours restants`
        : `${daysRemaining} days remaining`;
    }

    return {
      isSet: true,
      rawUtc: typeof utcInput === "string" ? utcInput : utcInput.toISOString(),
      utcFormatted,
      host: hostFormatted,
      user: userFormatted,
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining),
      totalSeconds,
      isPassed,
      isUrgent,
      isCritical,
      humanCountdown,
    };
  }

  /**
   * Compares a document expiration date (e.g., '2027-01-15') against a scholarship deadline.
   * Flags critical conflict if document expires BEFORE the scholarship deadline.
   */
  public static evaluateDocAgainstDeadline(
    docExpiryDate: string | Date | null | undefined,
    deadlineUtc: string | Date | null | undefined
  ): DocumentDeadlineConflict {
    if (!docExpiryDate || !deadlineUtc) {
      return {
        hasConflict: false,
        severity: "ok",
        rule: "VALID",
        daysDifference: 999,
        messageEn: "Date verification passed",
        messageFr: "Date valide",
        messageAr: "التاريخ سليم",
      };
    }

    const expiry = typeof docExpiryDate === "string" ? new Date(docExpiryDate) : docExpiryDate;
    const deadline = typeof deadlineUtc === "string" ? new Date(deadlineUtc) : deadlineUtc;

    // Reset hours to compare calendar dates
    const expDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const deadDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

    const diffDays = Math.ceil((expDay.getTime() - deadDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDiff = Math.abs(diffDays);
      return {
        hasConflict: true,
        severity: "critical",
        rule: "EXPIRES_BEFORE_DEADLINE",
        daysDifference: diffDays,
        messageEn: `Document expires ${absDiff} day(s) BEFORE the scholarship deadline. Immediate renewal required!`,
        messageFr: `Le document expire ${absDiff} jour(s) AVANT la date limite de la bourse. Renouvellement impératif !`,
        messageAr: `تنتهي صلاحية الوثيقة قبل موعد المنحة بـ ${absDiff} يوم. يلزم التجديد فوراً!`,
      };
    }

    if (diffDays <= 30) {
      return {
        hasConflict: true,
        severity: "warning",
        rule: "EXPIRES_NEAR_DEADLINE",
        daysDifference: diffDays,
        messageEn: `Document expires only ${diffDays} day(s) after deadline. May risk visa rejection.`,
        messageFr: `Le document expire seulement ${diffDays} jour(s) après la date limite. Risque de rejet pour le visa.`,
        messageAr: `تنتهي صلاحية الوثيقة بعد ${diffDays} يوم فقط من الموعد. يرجى الحذر عند استخراج التأشيرة.`,
      };
    }

    return {
      hasConflict: false,
      severity: "ok",
      rule: "VALID",
      daysDifference: diffDays,
      messageEn: `Valid for submission (${diffDays} days beyond deadline).`,
      messageFr: `Valide (${diffDays} jours après la date limite).`,
      messageAr: `صالحة للتقديم (${diffDays} يوم بعد الموعد).`,
    };
  }
}
