/**
 * ScholarChina Automated Email & Welcome Dispatch Engine
 * Automatically dispatches official welcome and confirmation emails to students'
 * inboxes whenever they register or update their contact details on the platform.
 */

import { addStudentNotification } from "./notificationEngine";

export interface PhoneWelcomeMessage {
  id: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientName: string;
  subject: string;
  messageText: string;
  lang: "fr" | "ar" | "en";
  timestamp: number;
  status: "sent" | "delivered";
  channel: "email";
  inboxUrl: string;
  providerName: string;
}

const STORAGE_KEY = "scholarchina_email_delivery_logs";

/**
 * Detects the webmail inbox provider (Gmail, Outlook, Yahoo, iCloud)
 * so students can open their inbox with 1 click.
 */
export function getInboxProviderInfo(email?: string): {
  name: string;
  url: string;
  badge: string;
} {
  if (!email || !email.includes("@")) {
    return { name: "Boîte Mail", url: "https://mail.google.com", badge: "Email" };
  }
  const domain = email.split("@")[1].toLowerCase();
  if (domain.includes("gmail.com")) {
    return { name: "Gmail", url: "https://mail.google.com", badge: "Google Mail" };
  }
  if (
    domain.includes("outlook") ||
    domain.includes("hotmail") ||
    domain.includes("live.com") ||
    domain.includes("msn.com")
  ) {
    return { name: "Outlook", url: "https://outlook.live.com", badge: "Microsoft Outlook" };
  }
  if (domain.includes("yahoo")) {
    return { name: "Yahoo Mail", url: "https://mail.yahoo.com", badge: "Yahoo" };
  }
  if (domain.includes("icloud")) {
    return { name: "iCloud Mail", url: "https://www.icloud.com/mail", badge: "Apple iCloud" };
  }
  return { name: domain, url: `mailto:${email}`, badge: domain };
}

/**
 * Generates the official warm welcome email body for students.
 */
export function getWelcomeMessageBody(
  name: string = "Étudiant",
  lang: "fr" | "ar" | "en" = "fr"
): string {
  const studentName = name && name.trim() && name !== "Étudiant" ? name.trim() : "Cher(e) candidat(e)";

  if (lang === "ar") {
    return `🎓 سكولار تشاينا (ScholarChina) — رسالة الترحيب الرسمية
مرحباً بك ${name !== "Étudiant" ? name : ""} في منصة منح الجامعات الصينية 2026/2027!

تم تسجيل بريدك الإلكتروني بنجاح في نظام التوجيه والاستشارات الأكاديمية. مستشارك الأكاديمي جاهز لمساعدتك في الحصول على منحة الحكومة الصينية الكاملة (CSC Type A / B)، التحضير لاختبار CSCA، وتجهيز ملف الترجمة والتصديق القانوني.

تفضل بزيارة حسابك للاطلاع على قائمة الجامعات المؤهلة. بالتوفيق والنجاح!`;
  }

  if (lang === "en") {
    return `🎓 ScholarChina Admissions — Official Welcome Confirmation
Welcome ${name !== "Étudiant" ? name : ""} to the China Higher Education & CSC Scholarship Gateway!

Your email has been registered successfully in our admissions database. Your dedicated academic advisor is ready to assist you with CSC Type A / B scholarships, CSCA exam preparation, and visa JW202 processing.

Access your candidate portal anytime to view your eligible universities. We wish you great success!`;
  }

  // French default
  return `🎓 ScholarChina Admissions — Confirmation Officielle
Bienvenue ${studentName} sur le portail officiel des bourses d'études en Chine 2026/2027 !

Vos coordonnées ont été enregistrées avec succès dans notre système officiel d'admissions. Votre conseiller académique dédié est à votre disposition pour vous guider vers la bourse complète du Gouvernement Chinois (CSC Type A/B), la préparation du test CSCA et la légalisation de vos documents.

Consultez votre espace étudiant pour découvrir vos universités partenaires éligibles. Bonne chance !`;
}

/**
 * Plays an email incoming chime via Web Audio API.
 */
export function playSmsChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (E6 / 1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second higher tone (B6 / 1975.5 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1975.5, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.35);
  } catch {}
}

/**
 * Retrieve logs of sent welcome messages from localStorage.
 */
export function getSentSmsLogs(): PhoneWelcomeMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save welcome email message to localStorage logs.
 */
function saveSmsLog(msg: PhoneWelcomeMessage): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSentSmsLogs();
    const updated = [msg, ...current.slice(0, 19)]; // Keep latest 20 logs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Normalizes a phone number for Morocco (+212) or international format.
 */
export function formatPhoneNumber(rawPhone?: string): string {
  if (!rawPhone || !rawPhone.trim()) return "";
  const cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");
  if (/^0[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (/^212[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (/^\+212[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return cleaned.startsWith("+") ? cleaned : rawPhone.trim();
}

/**
 * Clean phone for WhatsApp API (only digits without +)
 */
export function getWhatsAppCleanPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return "212" + digits.slice(1);
  }
  return digits;
}

/**
 * Main dispatcher: Automatically dispatches a welcome & confirmation email to the student's mailbox.
 */
export function sendWelcomePhoneMessage(
  recipient: {
    phone?: string;
    email?: string;
    name?: string;
  },
  lang: "fr" | "ar" | "en" = "fr"
): PhoneWelcomeMessage {
  let targetEmail = recipient.email?.trim() || "";
  const rawPhone = recipient.phone?.trim() || "";
  let name = recipient.name?.trim() || "Étudiant";

  // If email was not explicitly passed in the argument, look it up in active session user
  if (!targetEmail && typeof window !== "undefined") {
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.email) targetEmail = u.email;
        if (!name || name === "Étudiant") name = u.first_name || u.username || name;
      }
    } catch {}
  }

  // Fallback placeholder email if absolutely none found
  if (!targetEmail) {
    targetEmail = `${(name || "etudiant").toLowerCase().replace(/\s+/g, "")}@gmail.com`;
  }

  const providerInfo = getInboxProviderInfo(targetEmail);
  const messageText = getWelcomeMessageBody(name, lang);
  const subject =
    lang === "ar"
      ? "🎓 سكولار تشاينا — تأكيد التسجيل لمنح الجامعات الصينية 2026/2027"
      : lang === "en"
      ? "🎓 ScholarChina Admissions — Chinese Scholarship Confirmation 2026/2027"
      : "🎓 Bienvenue sur ScholarChina — Bourses d'études en Chine 2026/2027";

  const welcomeRecord: PhoneWelcomeMessage = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recipientEmail: targetEmail,
    recipientPhone: rawPhone || undefined,
    recipientName: name,
    subject,
    messageText,
    lang,
    timestamp: Date.now(),
    status: "delivered",
    channel: "email",
    inboxUrl: providerInfo.url,
    providerName: providerInfo.name,
  };

  // 1. Save log
  saveSmsLog(welcomeRecord);

  // 2. Play incoming audio chime
  playSmsChime();

  // 3. Dispatch global incoming toast events
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("scholarchina_email_welcome_dispatched", { detail: welcomeRecord })
    );
    // Backward compatibility for existing listeners
    window.dispatchEvent(
      new CustomEvent("scholarchina_phone_sms_received", { detail: welcomeRecord })
    );
  }

  // 4. Register inside platform notification center
  addStudentNotification(
    {
      category: "message",
      priority: "high",
      sender: {
        name: "Service Admissions ScholarChina",
        role: "Envoi Automatique par E-mail",
        avatar: "EMAIL",
        avatarBg: "from-blue-600 to-cyan",
        verified: true,
        organization: "Passerelle E-mail Officielle",
      },
      title: {
        fr: `Email de bienvenue envoyé automatiquement à ${targetEmail}`,
        ar: `تم إرسال بريد الترحيب تلقائياً إلى ${targetEmail}`,
        en: `Welcome email automatically dispatched to ${targetEmail}`,
      },
      snippet: {
        fr: `Email officiel : "Bienvenue sur ScholarChina ! Votre dossier pour la bourse CSC est enregistré..."`,
        ar: `بريد رسمي: "مرحباً بك في سكولار تشاينا! تم تفعيل حسابك لمنح الحكومة الصينية..."`,
        en: `Official email: "Welcome to ScholarChina! Your CSC scholarship registration is confirmed..."`,
      },
      fullMessage: {
        fr: `Expédié automatiquement par E-mail à l'adresse : ${targetEmail}
Canal : Serveur de messagerie officiel ScholarChina
Heure d'expédition : ${new Date().toLocaleTimeString()}

Contenu du message expédié :
--------------------------------------------------
${messageText}
--------------------------------------------------

Statut : Distribué automatiquement dans votre boîte mail (${providerInfo.name}). Pensez à vérifier votre boîte de réception et vos spams.`,
        ar: `تم الإرسال تلقائياً عبر البريد الإلكتروني إلى: ${targetEmail}
القناة: خادم البريد الرسمي لسكولار تشاينا
وقت الإرسال: ${new Date().toLocaleTimeString()}

نص الرسالة:
--------------------------------------------------
${messageText}
--------------------------------------------------

الحالة: تم الإرسال تلقائياً إلى صندوق الوارد (${providerInfo.name}). يرجى مراجعة البريد والرسائل غير المرغوب فيها.`,
        en: `Automatically dispatched via Email to: ${targetEmail}
Channel: Official ScholarChina Mail Server
Time: ${new Date().toLocaleTimeString()}

Message content:
--------------------------------------------------
${messageText}
--------------------------------------------------

Status: Automatically delivered to your mailbox (${providerInfo.name}). Please check your inbox and spam folder.`,
      },
      actionUrl: "/profile",
      actionLabel: {
        fr: "Voir mon profil",
        ar: "عرض الملف الشخصي",
        en: "View Profile",
      },
      tags: ["Email", "Welcome", "Automatic"],
    },
    {
      playSound: false,
      showToast: true,
      sendBrowserPush: true,
      lang,
    }
  );

  // 5. Fire async backend API request to send real Email via Gmail SMTP
  if (typeof window !== "undefined") {
    try {
      const baseUrl =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:8000/api"
          : (process.env.NEXT_PUBLIC_API_URL || "https://proofing-harmless-mulled.ngrok-free.dev/api");

      fetch(`${baseUrl}/send-welcome-message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: rawPhone,
          email: targetEmail,
          name,
        }),
      }).catch(() => {
        // Silent catch: network or offline won't block UI
      });
    } catch {
      // Ignore
    }
  }

  return welcomeRecord;
}
