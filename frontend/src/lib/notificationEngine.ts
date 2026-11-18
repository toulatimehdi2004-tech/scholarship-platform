/**
 * ScholarChina Notification Engine
 * Handles real-time message notifications, unread badges, audio chimes,
 * browser desktop push notifications, and persistent notification storage.
 */

export type NotificationCategory = "admission" | "scholarship" | "message" | "document" | "system";
export type NotificationPriority = "urgent" | "high" | "normal";

export interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

export function getLocalizedText(
  text?: LocalizedText | string,
  lang: "en" | "fr" | "ar" = "fr"
): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] || text.fr || text.en || text.ar || "";
}

export interface StudentNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  sender: {
    name: string;
    role: string;
    avatar?: string;
    avatarBg?: string;
    verified?: boolean;
    organization?: string;
  };
  title: LocalizedText;
  snippet: LocalizedText;
  fullMessage: LocalizedText;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  actionLabel?: LocalizedText;
  tags?: string[];
  attachments?: { name: string; size: string; type: string }[];
}

const STORAGE_PREFIX = "scholarchina_notifications_";

// Initial realistic default notifications for students
export const DEFAULT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif-zju-admission-001",
    category: "admission",
    priority: "urgent",
    sender: {
      name: "Dr. Zhang Lin",
      role: "Director of International Admissions",
      avatar: "ZJU",
      avatarBg: "from-blue-600 to-cyan-500",
      verified: true,
      organization: "Zhejiang University (ZJU) — International College",
    },
    title: {
      en: "Zhejiang University: Pre-Admission Appraisal Passed (CSC Type A)",
      fr: "Université du Zhejiang : Pré-admission validée (Bourse CSC Type A)",
      ar: "جامعة تشيجيانغ: اجتياز تقييم القبول المبدئي (منحة CSC نوع A)",
    },
    snippet: {
      en: "Your application for Computer Science & AI has passed faculty appraisal. Please review your interview slot.",
      fr: "Votre dossier en Informatique & IA a été validé par la faculté. Veuillez vérifier le créneau de votre entretien.",
      ar: "تمت الموافقة الأكاديمية على ملفك لبرنامج علوم الحاسوب والذكاء الاصطناعي. يرجى مراجعة موعد المقابلة.",
    },
    fullMessage: {
      en: `Dear Candidate,

We are pleased to inform you that your academic background and statement of purpose for the Bachelor/Master in Computer Science & Artificial Intelligence have passed the first-round faculty appraisal at Zhejiang University.

Your application is being forwarded to the China Scholarship Council (CSC) under Agency Code 10335.

Key Next Steps:
1. Online Admission Interview: Scheduled for the upcoming Friday via VooV / Zoom.
2. Verified Physical Examination: Submit your completed Foreigner Physical Examination Form (with blood tests and chest X-ray) before May 20th.
3. CSCA Exam: Confirm your CSCA Mathematics score match in your portal tracker.

We wish you great success in your application to Zhejiang University!

Office of International Admissions
Zhejiang University, Zijingang Campus, Hangzhou, China`,
      fr: `Cher(e) Candidat(e),

Nous avons le plaisir de vous informer que votre dossier académique et votre lettre de motivation (SOP) pour le cursus Informatique & Intelligence Artificielle ont franchi la première phase d'évaluation facultaire à l'Université du Zhejiang.

Votre dossier est en cours de transmission au Conseil des Bourses de Chine (CSC) sous le code agence 10335.

Prochaines étapes indispensables :
1. Entretien d'admission en ligne : Programmé ce vendredi via VooV / Zoom.
2. Formulaire Médical Certifié : Déposez le formulaire officiel Foreigner Physical Examination Form (avec analyses sanguines et radio pulmonaire) avant le 20 mai.
3. Examen CSCA : Vérifiez la synchronisation de votre note de Mathématiques CSCA dans votre tracker.

Nous vous souhaitons pleine réussite dans votre intégration à l'Université du Zhejiang !

Bureau des Admissions Internationales
Université du Zhejiang, Campus Zijingang, Hangzhou, Chine`,
      ar: `عزيزي المترشح / عزيزتي المترشحة،

يسرنا إبلاغك بأن ملفك الأكاديمي وخطاب النوايا لبرنامج علوم الحاسوب والذكاء الاصطناعي قد اجتازا بنجاح التقييم الأكاديمي الأولي لدى كلية الهندسة وتكنولوجيا المعلومات بجامعة تشيجيانغ.

يتم حالياً إحالة ملفك إلى مجلس المنح الصيني (CSC) تحت كود الوكالة الجامعية 10335.

الخطوات القادمة الضرورية:
1. المقابلة الشخصية عبر الإنترنت: محددة يوم الجمعة المقبل عبر منصة VooV / Zoom.
2. الفحص الطبي المعتمد: رفع استمارة الفحص الطبي للأجانب (شاملة تحاليل الدم وأشعة الصدر) قبل 20 مايو.
3. اختبار CSCA: التأكد من مطابقة نتيجة اختبار الرياضيات في متتبع طلبك.

نتمنى لك خالص التوفيق في مسيرتك الجامعية بالصين!

مكتب قبول الطلاب الدوليين
جامعة تشيجيانغ، حرم زيجينغانغ، هانغتشو، الصين`,
    },
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    read: false,
    actionUrl: "/tracker",
    actionLabel: {
      en: "View Tracker & Interview Details",
      fr: "Consulter le Tracker & Détails Entretien",
      ar: "عرض متتبع القبول وتفاصيل المقابلة",
    },
    tags: ["CSC Type A", "Full Tuition Exemption", "Zhejiang University"],
    attachments: [
      { name: "ZJU_Pre_Admission_Notice_2026.pdf", size: "1.4 MB", type: "PDF" },
      { name: "Foreigner_Physical_Exam_Form_Template.pdf", size: "850 KB", type: "PDF" },
    ],
  },
  {
    id: "notif-csc-beijing-002",
    category: "scholarship",
    priority: "high",
    sender: {
      name: "CSC Secretariat Beijing",
      role: "China Scholarship Council Headquarters",
      avatar: "CSC",
      avatarBg: "from-amber-500 to-rose-600",
      verified: true,
      organization: "China Scholarship Council (Ministry of Education, PRC)",
    },
    title: {
      en: "CSC Council: Bilateral Program Stipend & Accommodation Package Confirmed",
      fr: "Conseil CSC : Package Bourse Complète (Allocation & Logement) Validé",
      ar: "مجلس المنح CSC: تأكيد باقة المنحة الكاملة (الراتب والسكن الجامعي)",
    },
    snippet: {
      en: "Your CSC Bilateral Full Funding allocation includes full tuition waiver, free single room, and 3,000-3,500 RMB monthly stipend.",
      fr: "Votre allocation CSC comprend l'exonération totale des frais, une chambre individuelle gratuite et 3 000 à 3 500 RMB d'allocation mensuelle.",
      ar: "تشمل مخصصات منحة CSC إعفاءً كاملاً من المصاريف، غرفة فردية مجانية، وراتباً شهرياً بين 3000 و3500 يوان.",
    },
    fullMessage: {
      en: `Official Notice from the China Scholarship Council (CSC), Beijing:

Your scholarship file under the Sino-International Bilateral Agreement has completed agency quota verification.

Approved Full Scholarship Entitlements:
- Tuition Fees: 100% Fully Waived (Standard RMB 32,000 - 48,000/year covered directly).
- Campus Accommodation: Free on-campus international student residence (single or double studio).
- Monthly Living Allowance:
  * Bachelor Students: 3,000 RMB / month (transferred automatically each 15th to your Chinese ICBC/Bank of China card).
  * Master / Postgraduate Students: 3,500 RMB / month.
- Comprehensive Medical Insurance: Fully covered by Ping An Health Insurance (800 RMB/year).

Your JW202 (Visa Application Form for Study in China) electronic barcode is queued for dispatch once final university matching is stamped.`,
      fr: `Notification Officielle du Conseil des Bourses de Chine (CSC), Pékin :

Votre dossier de bourse dans le cadre de l'Accord Bilatéral a franchi la vérification des quotas d'agence.

Avantages Confirmés de la Bourse Complète :
- Frais de Scolarité : Exonération à 100% (valeur 32 000 à 48 000 RMB/an directement prise en charge).
- Logement Universitaire : Chambre gratuite en résidence internationale sur le campus universitaire.
- Allocation Mensuelle de Subsistance :
  * Étudiants en Licence (Bachelor) : 3 000 RMB / mois (versés chaque 15 du mois sur votre carte bancaire chinoise).
  * Étudiants en Master : 3 500 RMB / mois.
- Assurance Maladie Complète : Couverte à 100% par l'assurance Ping An (800 RMB/an).

Votre visa JW202 (Formulaire officiel d'études en Chine) est en file de génération avec code-barres officiel.`,
      ar: `إشعار رسمي من مجلس المنح الصيني (CSC) - الأمانة العامة ببكين:

اكتملت مرحلة مطابقة الكوتا والترميز لملف المنحة الخاص بك ضمن الاتفاقية الثنائية للتبادل الأكاديمي.

مزايا المنحة الكاملة المعتمدة رسمياً:
- المصاريف الدراسية: إعفاء كامل بنسبة 100% (تغطي ما قيمته 32,000 إلى 48,000 يوان صيني سنوياً).
- السكن الجامعي: غرفة مجانية مؤثثة داخل الحرم الجامعي المخصص للطلاب الدوليين.
- الراتب الشهري المعيشي:
  * طلاب البكالوريوس: 3000 يوان صيني شهرياً (تودع تلقائياً كل يوم 15 في بطاقتك البنكية الصينية).
  * طلاب الماستر والدراسات العليا: 3500 يوان صيني شهرياً.
- التأمين الصحي الشامل: مدفوع بالكامل طوال مدة الدراسة.

استمارة التأشيرة الإلكترونية JW202 قيد المعالجة لإصدار الباركود الرسمي للسفارة.`,
    },
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    read: false,
    actionUrl: "/scholarships",
    actionLabel: {
      en: "View Scholarship Breakdown",
      fr: "Détails de la Bourse Complète",
      ar: "تفاصيل تغطية المنحة الكاملة",
    },
    tags: ["CSC Bilateral", "Full Stipend", "JW202 Visa"],
  },
  {
    id: "notif-translator-doc-003",
    category: "document",
    priority: "normal",
    sender: {
      name: "Me. Alami & Sworn Translators Desk",
      role: "Certified Court Translator & Legalization",
      avatar: "DOC",
      avatarBg: "from-purple-600 to-indigo-600",
      verified: true,
      organization: "ScholarChina Sworn Legalization Hub",
    },
    title: {
      en: "Sworn Translation Complete: Baccalaureate Transcript & Clean Criminal Record",
      fr: "Traduction Assermentée Terminée : Baccalauréat & Casier Judiciaire",
      ar: "اكتمال الترجمة المحلفة: شهادة البكالوريا وحسن السيرة بالأبوستيل",
    },
    snippet: {
      en: "Your sworn English/Chinese translations with official Apostille stamps are now uploaded and certified.",
      fr: "Vos traductions assermentées en anglais/chinois avec cachet officiel Apostille sont prêtes dans votre coffre-fort.",
      ar: "تم الانتهاء من الترجمة المحلفة للإنجليزية والصينية مع طابع الأبوستيل القانوني وجاهزة للتحميل.",
    },
    fullMessage: {
      en: `Hello,

Your requested sworn translation order for the 2026/2027 Chinese University admissions cycle has been successfully processed by our certified court translators:

Documents Translated & Certified:
1. High School National Diploma & Regional Transcript (Certified English / Chinese bilingual edition).
2. Clean Police Clearance / Criminal Record Certificate (Affixed with Ministry Apostille legal seal).
3. Medical Physical Examination Form (Standard PRC format).

All digital certified copies with official QR seal verification have been stored in your ScholarChina Document Vault. You can attach them directly to your CSC portal submissions.`,
      fr: `Bonjour,

Votre commande de traduction assermentée pour la rentrée universitaire en Chine 2026/2027 a été finalisée par nos traducteurs assermentés agréés :

Documents traduits et certifiés :
1. Diplôme du Baccalauréat & Relevé de Notes (Édition bilingue certifiée Français / Anglais / Chinois).
2. Extrait de Casier Judiciaire (Revêtu de l'Apostille de la Cour d'Appel).
3. Formulaire d'Examen Médical pour Étrangers (Format standard officiel RPC).

Toutes les copies certifiées numériques avec code de vérification sont téléchargeables dans votre coffre-fort documentaire. Vous pouvez les joindre directement à vos dossiers universitaires.`,
      ar: `مرحباً بك،

تمت معالجة طلبك للترجمة المحلفة والمصادقة القانونية بنجاح عبر مترجمينا المحلفين المعتمدين لدى المحاكم والسفارات:

الوثائق المترجمة والمصدقة:
1. شهادة البكالوريا وكشف النقاط (نسخة رسمية مترجمة ومعتمدة).
2. شهادة السجل العدلي / حسن السيرة (ممهورة بختم الأبوستيل الدولي).
3. استمارة الفحص الطبي للأجانب (وفق المعايير الصحية المعتمدة بالصين).

النسخ الرقمية المعتمدة عالية الدقة والمزودة برمز التحقق QR متوفرة الآن في خزنة وثائقك على المنصة، وجاهزة للإرفاق في طلب المنحة.`,
    },
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    read: true,
    actionUrl: "/documents",
    actionLabel: {
      en: "Open Document Vault",
      fr: "Ouvrir le Coffre-fort Documentaire",
      ar: "فتح خزنة الوثائق",
    },
    tags: ["Apostille", "Sworn Translation", "Certified"],
    attachments: [
      { name: "Certified_Apostille_Dossier_2026.pdf", size: "3.2 MB", type: "PDF" },
    ],
  },
  {
    id: "notif-advisor-chat-004",
    category: "message",
    priority: "normal",
    sender: {
      name: "Dr. Wei Chen (Scholar AI)",
      role: "Senior China Academic Advisor",
      avatar: "AI",
      avatarBg: "from-emerald-500 to-teal-600",
      verified: true,
      organization: "ScholarChina Academic Advising Board",
    },
    title: {
      en: "Advisor Message: Personalized Study in China Roadmap Ready",
      fr: "Message Conseiller : Votre feuille de route personnalisée est prête",
      ar: "رسالة المستشار: خطتك الدراسية المخصصة في الصين جاهزة",
    },
    snippet: {
      en: "I have reviewed your desired major and city preferences. Click to open live chat and discuss application strategy.",
      fr: "J'ai analysé vos préférences de filière et de villes. Cliquez pour échanger en direct sur votre stratégie.",
      ar: "قمت بتحليل اختياراتك للتخصص والمدن الصينية. اضغط لفتح المحادثة المباشرة ومناقشة الخطة.",
    },
    fullMessage: {
      en: `Welcome to your ScholarChina Student Portal!

I am Dr. Wei Chen, your dedicated China scholarship and academic consultant. 

Based on your academic profile, here are 3 high-probability university matches for full CSC scholarships:
1. Zhejiang University (Hangzhou) — High stipend, international campus, top CS & Engineering labs.
2. Tsinghua University / Beihang (Beijing) — World-class STEM ranking, excellent corporate partnerships.
3. Fudan University / Shanghai Jiao Tong (Shanghai) — Leading economics, business, and medical programs.

If you have any questions regarding recommendation letters, writing your Statement of Purpose (SOP), or preparing for the CSCA mathematics exam, click 'Reply' below to talk to me in real time!`,
      fr: `Bienvenue sur votre Espace Étudiant ScholarChina !

Je suis Dr. Wei Chen, votre conseiller dédié aux bourses d'études et admissions en Chine.

Sur la base de votre profil académique, voici 3 universités offrant les meilleures probabilités de bourse complète CSC :
1. Université du Zhejiang (Hangzhou) : Excellente bourse, campus ultra-moderne, laboratoires de pointe.
2. Université Tsinghua / Beihang (Pékin) : Top mondial en sciences et ingénierie, réseau d'anciens exceptionnel.
3. Université Fudan / Shanghai Jiao Tong (Shanghai) : Référence en économie, commerce et technologies.

Pour toute question concernant vos lettres de recommandation, la rédaction de votre SOP ou l'examen CSCA, cliquez sur 'Répondre' ci-dessous pour discuter directement avec moi !`,
      ar: `أهلاً بك في منصتك الطلابية الرسمية ScholarChina!

أنا الدكتور وي تشن، مستشارك الأكاديمي المتخصص في المنح الصينية والجامعات المصنفة عالمياً.

بناءً على ملفك الأكاديمي، إليك 3 جامعات صينية ذات أعلى نسبة قبول لمنحة CSC الممولة بالكامل:
1. جامعة تشيجيانغ (هانغتشو): بيئة دولية ممتازة، ومختبرات تكنولوجية متطورة.
2. جامعة تسينغهوا / بيهانغ (بكين): صدارة عالمية في مجالات الهندسة والعلوم والتكنولوجيا.
3. جامعة فودان / جياوتونغ (شنغهاي): ريادة في الاقتصاد، إدارة الأعمال، والعلوم الطبية.

لأي استفسار حول خطابات التوصية، صياغة خطاب النوايا (SOP)، أو اختبار CSCA، اضغط على 'الرد' بالأسفل للتحدث معي مباشرة!`,
    },
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    read: true,
    actionUrl: "/ai-chat",
    actionLabel: {
      en: "Reply in Live Chat",
      fr: "Répondre en Direct",
      ar: "الرد في المحادثة المباشرة",
    },
    tags: ["Advising", "SOP Review", "Live Support"],
  },
];

// Helper to determine active username key
function getStorageKey(username?: string): string {
  if (typeof window === "undefined") return `${STORAGE_PREFIX}guest`;
  let user = username;
  if (!user) {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        user = parsed.username;
      }
    } catch {}
  }
  return `${STORAGE_PREFIX}${user || "guest"}`;
}

// Get all notifications for current student
export function getStudentNotifications(username?: string): StudentNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const key = getStorageKey(username);
    const data = localStorage.getItem(key);
    if (!data) {
      // Seed with default notifications
      localStorage.setItem(key, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

// Save notifications
export function saveStudentNotifications(notifications: StudentNotification[], username?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(username);
    localStorage.setItem(key, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent("scholarchina_notifications_updated"));
  } catch {}
}

// Get unread count
export function getUnreadNotificationCount(username?: string): number {
  const notifs = getStudentNotifications(username);
  return notifs.filter((n) => !n.read).length;
}

// Mark single notification as read
export function markNotificationAsRead(id: string, username?: string): void {
  const list = getStudentNotifications(username);
  const updated = list.map((item) => (item.id === id ? { ...item, read: true } : item));
  saveStudentNotifications(updated, username);
}

// Mark single notification as unread
export function markNotificationAsUnread(id: string, username?: string): void {
  const list = getStudentNotifications(username);
  const updated = list.map((item) => (item.id === id ? { ...item, read: false } : item));
  saveStudentNotifications(updated, username);
}

// Mark all as read
export function markAllNotificationsAsRead(username?: string): void {
  const list = getStudentNotifications(username);
  const updated = list.map((item) => ({ ...item, read: true }));
  saveStudentNotifications(updated, username);
}

// Delete a notification
export function deleteStudentNotification(id: string, username?: string): void {
  const list = getStudentNotifications(username);
  const updated = list.filter((item) => item.id !== id);
  saveStudentNotifications(updated, username);
}

// Play modern clean notification chime via Web Audio API (cross-browser, no assets needed)
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Harmonic double chime (D5: 587.33Hz -> A5: 880Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell chime 90ms later
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now + 0.09);
    gain2.gain.setValueAtTime(0.18, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.55);
  } catch {}
}

// Request Desktop Web Notification Permission
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch {
      return false;
    }
  }
  return false;
}

// Show native browser notification if enabled
export function sendBrowserPushNotification(
  title: string,
  body: string,
  onClick?: () => void
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "scholarchina-msg",
      });
      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    } catch {}
  }
}

// Add new notification and broadcast to toasts, audio, and badge
export function addStudentNotification(
  notification: Omit<StudentNotification, "id" | "timestamp" | "read"> & {
    id?: string;
    timestamp?: number;
    read?: boolean;
  },
  options: {
    playSound?: boolean;
    showToast?: boolean;
    sendBrowserPush?: boolean;
    username?: string;
    lang?: "en" | "fr" | "ar";
  } = {}
): StudentNotification {
  const { playSound = true, showToast = true, sendBrowserPush = true, username, lang = "fr" } = options;

  const fullNotif: StudentNotification = {
    id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: notification.timestamp || Date.now(),
    read: notification.read ?? false,
    ...notification,
  };

  const current = getStudentNotifications(username);
  const updated = [fullNotif, ...current];
  saveStudentNotifications(updated, username);

  if (playSound) {
    playNotificationSound();
  }

  // Pick text in active language
  const titleText =
    typeof fullNotif.title === "string"
      ? fullNotif.title
      : fullNotif.title[lang] || fullNotif.title.en || fullNotif.title.fr;
  const snippetText =
    typeof fullNotif.snippet === "string"
      ? fullNotif.snippet
      : fullNotif.snippet[lang] || fullNotif.snippet.en || fullNotif.snippet.fr;

  if (sendBrowserPush) {
    sendBrowserPushNotification(
      `ScholarChina: ${fullNotif.sender.name}`,
      `${titleText} — ${snippetText}`,
      () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("scholarchina_open_message_detail", { detail: fullNotif })
          );
        }
      }
    );
  }

  if (showToast && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("scholarchina_notification_received", { detail: fullNotif })
    );
  }

  return fullNotif;
}

// Helper to simulate realistic incoming messages for testing
export function simulateIncomingMessage(
  type: "admission" | "csc" | "translator" | "advisor" | "custom",
  customPayload?: Partial<StudentNotification>
): StudentNotification {
  const time = Date.now();

  if (type === "admission") {
    return addStudentNotification({
      category: "admission",
      priority: "urgent",
      sender: {
        name: "Prof. Liu Wei",
        role: "Tsinghua University — Admissions Committee",
        avatar: "THU",
        avatarBg: "from-purple-700 to-indigo-800",
        verified: true,
        organization: "Tsinghua University (THU), Beijing",
      },
      title: {
        en: "Tsinghua University: Admission Interview Invitation for CS & AI",
        fr: "Université Tsinghua : Convocation à l'Entretien d'Admission IA",
        ar: "جامعة تسينغهوا: دعوة رسمية لمقابلة القبول في الذكاء الاصطناعي",
      },
      snippet: {
        en: "Your profile is shortlisted for the Schwarzman / CSC Type A scholarship round. Please confirm attendance.",
        fr: "Votre profil a été retenu pour le tour de bourse CSC Type A. Veuillez confirmer votre présence.",
        ar: "تم ترشيح ملفك ضمن قائمة النخبة لمنحة CSC نوع A. يرجى تأكيد حضور المقابلة.",
      },
      fullMessage: {
        en: `Dear Applicant,

Following evaluation of your academic transcripts and CSCA scores, the Admissions Committee of Tsinghua University invites you to an online academic assessment session.

Interview Date: Next Monday, 14:00 (Beijing Time, UTC+8)
Meeting Platform: Tencent Meeting / VooV (Meeting ID will be provided in your tracker)
Duration: 25 minutes (10 mins presentation + 15 mins technical Q&A in English/Chinese)

Please ensure your high-speed internet connection, quiet environment, and original passport ready for identity verification.

Tsinghua International Admissions Office, Haidian District, Beijing`,
        fr: `Cher(e) Candidat(e),

À la suite de l'évaluation de vos relevés de notes et de vos résultats CSCA, la commission des admissions de l'Université Tsinghua a le plaisir de vous convoquer à une session d'évaluation académique en direct.

Date de l'entretien : Lundi prochain à 14h00 (Heure de Pékin, UTC+8)
Plateforme : Tencent Meeting / VooV (L'identifiant de réunion sera synchronisé dans votre tracker)
Durée : 25 minutes (10 minutes de présentation + 15 minutes d'échange technique en anglais/chinois)

Veuillez vous munir de votre passeport original pour la vérification de conformité.

Bureau des Admissions Internationales, Université Tsinghua, Pékin`,
        ar: `عزيزي المتقدم،

بعد التدقيق الأكاديمي الشامل لملفك واختبارات CSCA، يسعد لجنة قبول الطلاب الدوليين بجامعة تسينغهوا دعوتك لمقابلة القبول الأكاديمية عبر الإنترنت.

موعد المقابلة: يوم الإثنين المقبل الساعة 14:00 (بتوقيت بكين، UTC+8)
المنصة: Tencent Meeting / VooV (سيتم إدراج رابط الجلسة في لوحة تحكمك)
المدة: 25 دقيقة (عرض تقديمي + أسئلة تخصصية باللغة الإنجليزية أو الصينية)

يرجى إحضار جواز السفر الأصلي للتحقق من الهوية وضمان اتصال إنترنت مستقر.

مكتب القبول الدولي، جامعة تسينغهوا، هايديان، بكين`,
      },
      actionUrl: "/tracker",
      actionLabel: {
        en: "Confirm Interview in Tracker",
        fr: "Confirmer l'entretien dans le Tracker",
        ar: "تأكيد موعد المقابلة في المتتبع",
      },
      tags: ["Tsinghua University", "CSC Interview", "Urgent"],
    });
  }

  if (type === "csc") {
    return addStudentNotification({
      category: "scholarship",
      priority: "high",
      sender: {
        name: "CSC Official Desk",
        role: "Bilateral Scholarship Appraisal Section",
        avatar: "CSC",
        avatarBg: "from-amber-600 to-rose-600",
        verified: true,
        organization: "China Scholarship Council",
      },
      title: {
        en: "CSC Notice: Monthly Living Stipend Credit & Medical Insurance Dispatched",
        fr: "Avis CSC : Versement Allocation de Vie & Carte Assurance Médicale",
        ar: "إشعار CSC: اعتماد صرف المنحة الشهرية والتأمين الطبي الشامل",
      },
      snippet: {
        en: "Your monthly living stipend certificate (3,000 RMB / month) is generated for embassy visa processing.",
        fr: "Votre attestation d'allocation mensuelle (3 000 RMB / mois) est prête pour votre dossier de visa.",
        ar: "تم إصدار شهادة الراتب الشهري (3000 يوان/شهرياً) لاستكمال متطلبات تأشيرة السفارة.",
      },
      fullMessage: {
        en: `Official Dispatch from China Scholarship Council:

We confirm the allocation of your CSC Type A Full Scholarship funding pack:
- Monthly Living Allowance: 3,000 RMB/month deposited monthly.
- Accommodation Voucher: On-campus international student apartment included.
- Medical Coverage: 100% comprehensive health insurance policy number generated.

You may present this letter to the PRC Embassy/Consulate for your X1 Student Visa application together with your official JW202 form.`,
        fr: `Dépêche Officielle du Conseil des Bourses de Chine :

Nous vous confirmons l'attribution intégrale de votre pack de bourse CSC Type A :
- Allocation Mensuelle : 3 000 RMB/mois versés chaque mois sans interruption.
- Hébergement sur le Campus : Studio universitaire étudiant international inclus.
- Couverture Médicale : Police d'assurance santé à 100% émise.

Cette attestation fait foi auprès du Consulat / Ambassade de Chine pour la délivrance de votre visa étudiant X1.`,
        ar: `إفادة رسمية من مجلس المنح الدراسية بالصين (CSC):

نؤكد اعتماد باقة التمويل الكامل لمنحة الحكومة الصينية CSC Type A الخاصة بك:
- المخصص الشهري: 3000 يوان صيني يودع شهرياً بدون انقطاع.
- السكن الجامعي: شقة مخصصة في سكن الطلاب الدوليين مجاناً.
- التأمين الصحي: تغطية صحية كاملة بنسبة 100%.

يمكنك تقديم هذه الوثيقة مباشرة للسفارة أو القنصلية الصينية للحصول على تأشيرة الطالب X1 برفقة استمارة JW202.`,
      },
      actionUrl: "/scholarships",
      actionLabel: {
        en: "View Full CSC Award Letter",
        fr: "Consulter la lettre d'attribution",
        ar: "عرض خطاب المنحة الرسمي",
      },
      tags: ["CSC Beijing", "Living Allowance", "Full Scholarship"],
    });
  }

  if (type === "translator") {
    return addStudentNotification({
      category: "document",
      priority: "normal",
      sender: {
        name: "Service Traduction & Apostille",
        role: "Certified Translation Service Desk",
        avatar: "EXP",
        avatarBg: "from-blue-600 to-indigo-700",
        verified: true,
        organization: "ScholarChina Sworn Legalization Desk",
      },
      title: {
        en: "Document Desk: Embassy Apostille Verification Sealed",
        fr: "Service Documents : Sceau Apostille Ambassade Apposé",
        ar: "قسم الوثائق: ختم التصديق والأبوستيل جاهز للتحميل",
      },
      snippet: {
        en: "Your sworn translated degree certificate has passed consular legalization and is now in your vault.",
        fr: "Votre diplôme traduit et légalisé a passé la conformité consulaire et est disponible.",
        ar: "اجتازت شهادتك المترجمة الفحص القانوني المعتمد وأصبحت جاهزة في خزنة الوثائق.",
      },
      fullMessage: {
        en: `Dear Student,

Your legal document pack for China university registration has been stamped with the certified Hague Apostille seal.

Certified Documents:
- High School / Bachelor Graduation Certificate (Trilingual French-English-Chinese)
- Official Grade Transcripts (Grade conversion stamped)
- Police Clearance Letter

You can download high-resolution PDF copies with QR authentication from your Document Vault.`,
        fr: `Cher(e) Étudiant(e),

Votre dossier de légalisation pour l'inscription universitaire en Chine a reçu le visa Apostille officiel de la Haye.

Documents traités :
- Diplôme de fin d'études (Traduction trilingue assermentée)
- Relevés de notes officiels (Tableau d'équivalence certifié)
- Certificat de casier judiciaire

Téléchargez vos scans haute résolution avec QR code de certification depuis votre espace documents.`,
        ar: `عزيزي الطالب / عزيزتي الطالبة،

تم ختم ملفك القانوني للالتحاق بالجامعات الصينية رسمياً بختم الأبوستيل الدولي (Hague Apostille).

الوثائق المنجزة:
- شهادة التخرج (ترجمة محلفة ثلاثية اللغات)
- كشوف النقاط الرسمية المعتمدة
- السجل العدلي المصادق عليه

يمكنك تحميل النسخ الرقمية المعتمدة مع باركود المصادقة مباشرة من قسم الوثائق.`,
      },
      actionUrl: "/documents",
      actionLabel: {
        en: "Open Document Vault",
        fr: "Ouvrir l'Espace Documents",
        ar: "فتح قسم الوثائق",
      },
      tags: ["Apostille", "Sworn Docs", "Ready"],
    });
  }

  // Advisor / default
  return addStudentNotification({
    category: "message",
    priority: "normal",
    sender: {
      name: "Dr. Wei Chen",
      role: "Senior China Academic Advisor",
      avatar: "ADV",
      avatarBg: "from-emerald-600 to-teal-700",
      verified: true,
      organization: "ScholarChina Advising Team",
    },
    title: {
      en: "Advisor Follow-up: SOP Review & University Selection",
      fr: "Suivi Conseiller : Révision de votre SOP & Choix des Villes",
      ar: "متابعة المستشار: مراجعة خطاب النوايا واختيار المدن",
    },
    snippet: {
      en: "I made suggestions on your Statement of Purpose to maximize your CSC full scholarship score.",
      fr: "J'ai apporté des améliorations à votre lettre de motivation pour maximiser vos chances CSC.",
      ar: "وضعت ملاحظات وتعديلات هامة على خطاب النوايا لتعزيز فرصك في الحصول على المنحة الكاملة.",
    },
    fullMessage: {
      en: `Hello,

I reviewed your Statement of Purpose (SOP) draft. Your research motivation is strong, and I added specific references to your target university's national key laboratories to make your application stand out to the CSC review committee.

Please check the live chat or open a direct messaging session so we can finalize it together.

Best regards,
Dr. Wei Chen, Senior Advisor`,
      fr: `Bonjour,

J'ai relu votre projet de lettre de motivation (SOP). Votre motivation académique est excellente ! J'ai ajouté des références ciblées aux laboratoires clés de votre université de choix pour vous démarquer auprès du jury de la bourse CSC.

N'hésitez pas à ouvrir le chat en direct pour que nous validions la version finale ensemble.

Bien à vous,
Dr. Wei Chen, Conseiller Senior`,
      ar: `مرحباً بك،

راجعت مسودة خطاب النوايا (SOP) الخاصة بك. دافعك الأكاديمي ممتاز جداً! قمت بإضافة تفاصيل دقيقة حول مختبرات الأبحاث بالجامعة التي اخترتها لمنح ملفك تميزاً كبيراً أمام لجنة تقييم منحة CSC.

تفضل بفتح المحادثة المباشرة لنعتمد النسخة النهائية معاً.

تحياتي،
د. وي تشن، المستشار الأكاديمي`,
    },
    actionUrl: "/ai-chat",
    actionLabel: {
      en: "Open Advisor Chat",
      fr: "Ouvrir le Chat Conseiller",
      ar: "فتح محادثة المستشار",
    },
    tags: ["Advising", "SOP Optimization"],
    ...customPayload,
  });
}
