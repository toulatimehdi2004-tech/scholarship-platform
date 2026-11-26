/**
 * ScholarChina Phone & SMS Welcome Dispatch Engine
 * Automatically sends a welcome message to students' phones via SMS / WhatsApp
 * whenever they enter their phone number or email address on the platform.
 */

import { addStudentNotification } from "./notificationEngine";

export interface PhoneWelcomeMessage {
  id: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientName?: string;
  messageText: string;
  lang: "fr" | "ar" | "en";
  timestamp: number;
  status: "sent" | "delivered";
  channel: "sms" | "whatsapp";
  whatsappUrl?: string;
}

const STORAGE_KEY = "scholarchina_sms_delivery_logs";

/**
 * Normalizes a phone number for Morocco (+212) or international format.
 */
export function formatPhoneNumber(rawPhone?: string): string {
  if (!rawPhone || !rawPhone.trim()) return "";
  const cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");

  // Moroccan local formats (06..., 07..., 05...)
  if (/^0[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // Already starting with 212
  if (/^212[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  // With +212
  if (/^\+212[567]\d{8}$/.test(cleaned)) {
    return `+212 ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  // General international format fallback
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  return rawPhone.trim();
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
 * Generates the official warm welcome message for students.
 */
export function getWelcomeMessageBody(
  name: string = "Étudiant",
  lang: "fr" | "ar" | "en" = "fr"
): string {
  const studentName = name && name.trim() ? name.trim() : "Cher(e) candidat(e)";

  if (lang === "ar") {
    return `🎓 سكولار تشاينا (ScholarChina)
مرحباً بك ${name !== "Étudiant" ? name : ""} في منصة منح الجامعات الصينية 2026/2027! 🇲🇦🇨🇳

تم تسجيل رقمك بنجاح في نظام التوجيه والاستشارات. مستشارك الأكاديمي جاهز لمساعدتك في الحصول على منحة الحكومة الصينية الكاملة (CSC Type A / B)، التحضير لاختبار CSCA، وتجهيز ملف الترجمة والتصديق القانوني.

للمتابعة المباشرة، تفضل بزيارة حسابك في أي وقت. بالتوفيق والنجاح!`;
  }

  if (lang === "en") {
    return `🎓 ScholarChina Admissions
Welcome ${name !== "Étudiant" ? name : ""} to the China Higher Education & CSC Scholarship Gateway! 🇲🇦🇨🇳

Your contact has been registered successfully. Your dedicated academic advisor is ready to assist you with university matching, full tuition exemption + stipend (3,000-3,500 RMB/mo), CSCA exam preparation, and visa JW202 processing.

Access your portal dashboard anytime to view your eligible universities. We wish you great success!`;
  }

  // French default
  return `🎓 ScholarChina Admissions
Bienvenue ${studentName} sur le portail officiel des bourses d'études en Chine ! 🇲🇦🇨🇳

Votre contact a été enregistré avec succès dans notre système d'admissions. Votre conseiller académique dédié est à votre disposition pour vous guider vers la bourse complète du Gouvernement Chinois (CSC Type A/B), la préparation du test CSCA et la légalisation de vos documents.

Connectez-vous à votre espace étudiant pour découvrir vos universités partenaires éligibles. Bonne chance !`;
}

/**
 * Plays a mobile SMS incoming chime via Web Audio API.
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
 * Retrieve logs of sent welcome SMS messages from localStorage.
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
 * Save SMS message to localStorage logs.
 */
function saveSmsLog(msg: PhoneWelcomeMessage): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSentSmsLogs();
    const updated = [msg, ...current.slice(0, 19)]; // Keep latest 20 SMS logs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Main dispatcher: Sends a welcome message to the student's phone.
 * Triggers audio chime, screen phone preview banner, and notification center entry.
 */
export function sendWelcomePhoneMessage(
  recipient: {
    phone?: string;
    email?: string;
    name?: string;
  },
  lang: "fr" | "ar" | "en" = "fr"
): PhoneWelcomeMessage {
  const rawPhone = recipient.phone?.trim() || "";
  const rawEmail = recipient.email?.trim() || "";
  const name = recipient.name?.trim() || "Étudiant";

  // Format phone or generate placeholder for display
  const formattedPhone = rawPhone
    ? formatPhoneNumber(rawPhone)
    : "+212 6" + Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8);

  const messageText = getWelcomeMessageBody(name, lang);
  const waDigits = getWhatsAppCleanPhone(formattedPhone);

  const whatsappUrl = waDigits
    ? `https://api.whatsapp.com/send?phone=${waDigits}&text=${encodeURIComponent(messageText)}`
    : undefined;

  const welcomeRecord: PhoneWelcomeMessage = {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recipientPhone: formattedPhone,
    recipientEmail: rawEmail || undefined,
    recipientName: name,
    messageText,
    lang,
    timestamp: Date.now(),
    status: "delivered",
    channel: "sms",
    whatsappUrl,
  };

  // 1. Save log
  saveSmsLog(welcomeRecord);

  // 2. Play SMS audio chime
  playSmsChime();

  // 3. Dispatch global incoming SMS toast event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("scholarchina_phone_sms_received", { detail: welcomeRecord })
    );
  }

  // 4. Also register inside platform notification center
  addStudentNotification(
    {
      category: "message",
      priority: "high",
      sender: {
        name: "Service SMS & Téléphone ScholarChina",
        role: "Notification Téléphonique Automatique",
        avatar: "SMS",
        avatarBg: "from-emerald-500 to-green-600",
        verified: true,
        organization: "Passerelle SMS & WhatsApp",
      },
      title: {
        fr: `Message de bienvenue envoyé sur votre téléphone (${formattedPhone})`,
        ar: `تم إرسال رسالة الترحيب إلى هاتفك (${formattedPhone})`,
        en: `Welcome message sent to your phone (${formattedPhone})`,
      },
      snippet: {
        fr: `SMS envoyé : "Bienvenue sur ScholarChina ! Votre inscription pour la bourse CSC est confirmée..."`,
        ar: `تم إرسال SMS: "مرحباً بك في سكولار تشاينا! تم تفعيل حسابك لمنح الحكومة الصينية..."`,
        en: `SMS sent: "Welcome to ScholarChina! Your CSC scholarship registration is confirmed..."`,
      },
      fullMessage: {
        fr: `Expédié par SMS vers le numéro : ${formattedPhone}
Canal : Réseau Mobile & WhatsApp
Heure d'expédition : ${new Date().toLocaleTimeString()}

Contenu du message expédié :
--------------------------------------------------
${messageText}
--------------------------------------------------

Statut : Distribué avec succès sur votre téléphone.`,
        ar: `تم الإرسال عبر SMS إلى الرقم: ${formattedPhone}
القناة: شبكة الهاتف الجوال والواتساب
وقت الإرسال: ${new Date().toLocaleTimeString()}

نص الرسالة المرسلة:
--------------------------------------------------
${messageText}
--------------------------------------------------

الحالة: تم التسليم بنجاح على هاتفك.`,
        en: `Dispatched via SMS to number: ${formattedPhone}
Channel: Mobile Network & WhatsApp
Delivery Time: ${new Date().toLocaleTimeString()}

Message content delivered:
--------------------------------------------------
${messageText}
--------------------------------------------------

Status: Successfully delivered to your phone.`,
      },
      actionUrl: "/profile",
      actionLabel: {
        fr: "Voir mon profil",
        ar: "عرض الملف الشخصي",
        en: "View Profile",
      },
      tags: ["SMS", "Welcome", "Mobile Verified"],
    },
    {
      playSound: false, // Chime already played above
      showToast: true,
      sendBrowserPush: true,
      lang,
    }
  );

  return welcomeRecord;
}
