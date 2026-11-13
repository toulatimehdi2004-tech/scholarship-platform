"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Clock,
  Sparkles,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  ChevronDown,
  Volume2,
  VolumeX,
  HelpCircle,
  FileText,
  User,
  ShieldCheck,
  Headphones,
  Award,
  Calendar,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Mic,
  ImagePlus,
  UploadCloud,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getToken, getCurrentUser, type User as UserType } from "@/lib/api";
import MarkdownContent from "@/components/MarkdownContent";
import { analyzeChatImage, generateAiChatResponse, speakText, stopSpeaking } from "@/lib/aiChatEngine";

interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isTicketConfirmation?: boolean;
  ticketId?: string;
  attachment?: {
    url: string;
    name: string;
    type?: string;
  };
}

interface CallbackRequest {
  id: string;
  fullName: string;
  phone: string;
  topic: string;
  preferredTime: string;
  createdAt: string;
  status: "pending" | "contacted";
  channel?: "call" | "whatsapp";
  note?: string;
}

// Web Audio API friendly notification sound
function playAdvisorPing() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

const QUICK_QUESTIONS = [
  {
    id: "csca_exam",
    labelFr: "Quelles épreuves passer pour le test CSCA ?",
    labelAr: "ما هي المواد الإجبارية لاختبار CSCA؟",
    labelEn: "Which subjects to take for the CSCA test?",
  },
  {
    id: "full_funding",
    labelFr: "Comment obtenir 100% de bourse (logement + allocation) ?",
    labelAr: "كيف أحصل على منحة ممولة بالكامل 100% مع السكن؟",
    labelEn: "How to get a 100% full scholarship + stipend?",
  },
  {
    id: "apostille_legal",
    labelFr: "Procédure d'Apostille & Légalisation au Maroc",
    labelAr: "إجراءات الأبوستيل وتصديق الشهادات في المغرب",
    labelEn: "Moroccan Apostille & Legalization procedure",
  },
  {
    id: "jw202_visa",
    labelFr: "Délais formulaire JW202 & Visa X1 à Rabat",
    labelAr: "مواعيد استمارة JW202 وفيزا X1 بسفارة الصين بالرباط",
    labelEn: "JW202 form timelines & X1 Visa in Rabat",
  },
  {
    id: "contact_human",
    labelFr: "Je souhaite parler directement à un conseiller",
    labelAr: "أريد التحدث هاتفياً أو عبر واتساب مع مستشار",
    labelEn: "I want to talk directly with an advisor",
  },
];

export default function LiveCommunicationWidget() {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "whatsapp" | "callback" | "tickets">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // Callback Form states
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackTopic, setCallbackTopic] = useState("CSCA Exam Guidance");
  const [callbackTime, setCallbackTime] = useState("morning");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [myTickets, setMyTickets] = useState<CallbackRequest[]>([]);

  // WhatsApp Message Request Form states
  const [whatsappName, setWhatsappName] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappTopic, setWhatsappTopic] = useState("CSC Scholarship Application");
  const [whatsappNote, setWhatsappNote] = useState("");
  const [whatsappSubmitted, setWhatsappSubmitted] = useState(false);
  const [whatsappSubmittedTicket, setWhatsappSubmittedTicket] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Attachment & Vocal States
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [listening, setListening] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        processImageFile(file);
      }
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPendingAttachment({
          url: event.target.result as string,
          name: file.name || "uploaded-document.jpg",
          type: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleListen = () => {
    if (listening) {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      setListening(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    try {
      const rec = new SR();
      rec.lang = lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US";
      rec.interimResults = true;
      rec.continuous = false;

      rec.onresult = (e: any) => {
        let transcript = "";
        for (const r of e.results) {
          transcript += r[0].transcript;
        }
        if (transcript.trim()) {
          setInputMessage((prev) => (prev ? prev + " " + transcript : transcript).trim());
        }
      };

      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  // Load User & Saved History
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMessages = localStorage.getItem("scholarchina_live_chat_messages");
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          // Default initial greeting
          const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const welcomeMsg: ChatMessage = {
            id: "welcome-1",
            sender: "advisor",
            text:
              lang === "ar"
                ? "مرحباً بك! 👋 أنا المهدي من مكتب الاستشارات والتوجيه بالرباط وبكين. نحن هنا لمساعدتك في كل ما يخص المنح الصينية (CSC)، امتحان CSCA الجديد، وتجهيز ملفك الرسمي. كيف يمكنني مساعدتك الآن؟"
                : lang === "fr"
                ? "Bonjour ! 👋 Je suis Mehdi du bureau de conseil et d'admissions ScholarChina à Rabat. Je suis en ligne pour répondre en direct à toutes vos questions sur les bourses chinoises, le nouveau test CSCA, l'Apostille ou le suivi de votre candidature. Que souhaitez-vous savoir ?"
                : "Hello! 👋 I'm Mehdi from the ScholarChina advisory desk in Rabat & Beijing. I'm live right now to answer any questions about Chinese Government Scholarships, CSCA exams, Moroccan Apostille, or your admission status. How can I help you today?",
            timestamp: initialTime,
            status: "read",
          };
          setMessages([welcomeMsg]);
          localStorage.setItem("scholarchina_live_chat_messages", JSON.stringify([welcomeMsg]));
        }

        const savedTickets = localStorage.getItem("scholarchina_callback_tickets");
        if (savedTickets) {
          setMyTickets(JSON.parse(savedTickets));
        }
      } catch {}

      if (getToken()) {
        getCurrentUser().then((res) => {
          if (res.data) {
            setUser(res.data);
            setCallbackName(res.data.username || "");
            setWhatsappName(res.data.username || "");
            if (res.data.email) setCallbackPhone(res.data.email);
          }
        });
      }

      // Global custom event listener to open live chat from anywhere
      const handleOpenCustom = () => {
        setIsOpen(true);
        setHasUnread(false);
        setShowGreetingBubble(false);
        setTimeout(() => inputRef.current?.focus(), 300);
      };
      window.addEventListener("open_live_chat", handleOpenCustom);

      // Show gentle greeting pill after 4 seconds if chat hasn't been opened
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem("live_chat_greeting_dismissed");
        if (!dismissed) {
          setShowGreetingBubble(true);
          setHasUnread(true);
        }
      }, 4000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("open_live_chat", handleOpenCustom);
      };
    }
  }, [lang]);

  // Save messages on update
  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem("scholarchina_live_chat_messages", JSON.stringify(messages));
      } catch {}
    }
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setHasUnread(false);
      setShowGreetingBubble(false);
      sessionStorage.setItem("live_chat_greeting_dismissed", "true");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content && !pendingAttachment) return;

    const attached = pendingAttachment;
    setPendingAttachment(null);

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text:
        content ||
        (attached
          ? lang === "ar"
            ? "قمت بإرفاق هذه الصورة/الوثيقة، يرجى فحصها والتعرف عليها 100%."
            : "Voici une image/document pour analyse et reconnaissance visuelle 100%."
          : ""),
      timestamp: timeStr,
      status: "delivered",
      attachment: attached || undefined,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    // Realistic human-advisor typing simulation
    const replyDelay = Math.min(1800, Math.max(900, (content || "").length * 15));

    setTimeout(async () => {
      let replyText = "";
      let isTicket = false;
      let ticketId: string | undefined = undefined;

      if (attached) {
        replyText = await analyzeChatImage(attached, content, lang);
      } else {
        const standardAdvisor = generateAdvisorResponse(content, lang, user?.username);
        // If matched one of the specific direct topics (WhatsApp, CSCA, Full funding, Apostille, Visa)
        if (!standardAdvisor.isTicket) {
          replyText = standardAdvisor.text;
        } else {
          // If not in the 4 hardcoded topics, answer ANY question (math, coding, halal food, VPN, weather, life in China, etc.)!
          replyText = await generateAiChatResponse(content, undefined, lang, user);
        }
      }

      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const advisorMsg: ChatMessage = {
        id: "adv-" + Date.now(),
        sender: "advisor",
        text: replyText,
        timestamp: replyTime,
        status: "read",
        isTicketConfirmation: isTicket,
        ticketId: ticketId,
      };

      setMessages((prev) => [...prev, advisorMsg]);
      setIsTyping(false);

      if (soundEnabled && !isOpen) {
        playAdvisorPing();
        setHasUnread(true);
      } else if (soundEnabled && isOpen) {
        playAdvisorPing();
      }
    }, replyDelay);
  };

  const handleQuickQuestion = (qId: string) => {
    let questionText = "";
    if (qId === "csca_exam") {
      questionText =
        lang === "ar"
          ? "ما هي المواد الإجبارية لاختبار CSCA حسب تخصصي (Software, E-commerce, Medicine)؟"
          : "Quelles sont les épreuves du test CSCA selon ma filière (Génie Logiciel, E-Commerce, Médecine) ?";
    } else if (qId === "full_funding") {
      questionText =
        lang === "ar"
          ? "كيف أحصل على منحة الحكومة الصينية CSC الممولة بالكامل (إعفاء دراسي + سكن مجاني + راتب شهري)؟"
          : "Comment obtenir la bourse complète du Gouvernement Chinois (CSC Type A / B avec logement et allocation mensuelle) ?";
    } else if (qId === "apostille_legal") {
      questionText =
        lang === "ar"
          ? "ما هي خطوات تصديق الأبوستيل بالمغرب (apostille.ma) وترجمة الشهادات للتقديم في الصين؟"
          : "Quelles sont les étapes pour l'Apostille au Maroc (apostille.ma) et la traduction assermentée des diplômes ?";
    } else if (qId === "jw202_visa") {
      questionText =
        lang === "ar"
          ? "كم يستغرق استخراج استمارة الفيزا JW202 وكيف أحصل على فيزا X1 بسفارة الصين بالرباط؟"
          : "Quels sont les délais d'émission du formulaire visa JW202 et la procédure visa X1 à l'Ambassade de Chine à Rabat ?";
    } else {
      questionText =
        lang === "ar"
          ? "أرغب في التحدث هاتفياً أو عبر واتساب مع مستشار رسمي لتجهيز ملفي."
          : "Je souhaite échanger directement avec un conseiller officiel par téléphone ou WhatsApp pour mon dossier.";
    }

    handleSendMessage(questionText);
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    const ticketNumber = "CALL-MA-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket: CallbackRequest = {
      id: ticketNumber,
      fullName: callbackName.trim() || "Étudiant Candidat",
      phone: callbackPhone.trim(),
      topic: callbackTopic,
      preferredTime: callbackTime,
      createdAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "pending",
    };

    const nextTickets = [newTicket, ...myTickets];
    setMyTickets(nextTickets);
    try {
      localStorage.setItem("scholarchina_callback_tickets", JSON.stringify(nextTickets));
    } catch {}

    setCallbackSubmitted(true);

    // Also add confirmation to the chat thread
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const ticketMsg: ChatMessage = {
      id: "adv-ticket-" + Date.now(),
      sender: "advisor",
      text:
        lang === "ar"
          ? `✅ تم تسجيل طلب اتصالك الهاتفي بنجاح! رقم التذكرة: **${ticketNumber}**.\n\nسيتصل بك مستشارنا عبر الرقم **${callbackPhone}** خلال الموعد المفضل (${callbackTime === "morning" ? "الفترة الصباحية 9h-12h" : callbackTime === "afternoon" ? "بعد الزوال 14h-18h" : "في أقرب وقت ممكن"}).`
          : `✅ Votre demande de rappel téléphonique a été validée avec succès ! Référence du ticket : **${ticketNumber}**.\n\nUn conseiller vous contactera directement au **${callbackPhone}** (${callbackTime === "morning" ? "Créneau matin 9h-12h" : callbackTime === "afternoon" ? "Créneau après-midi 14h-18h" : "Dès que possible"}).`,
      timestamp: timeStr,
      status: "read",
      isTicketConfirmation: true,
      ticketId: ticketNumber,
    };

    setMessages((prev) => [...prev, ticketMsg]);

    setTimeout(() => {
      setCallbackSubmitted(false);
      setActiveTab("chat");
    }, 2800);
  };

  // WhatsApp Number Submission Handler (We send them a WhatsApp message)
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPhone.trim()) return;

    // Clean and format phone number with Moroccan country code if needed
    let cleanPhone = whatsappPhone.trim();
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "+212 " + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("+") && cleanPhone.length >= 9) {
      cleanPhone = "+212 " + cleanPhone;
    }

    const ticketNumber = "WA-MA-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket: CallbackRequest = {
      id: ticketNumber,
      fullName: whatsappName.trim() || user?.username || (lang === "ar" ? "طالب مرشح" : "Étudiant Candidat"),
      phone: cleanPhone,
      topic: whatsappTopic,
      preferredTime: lang === "ar" ? "مراسلة عبر واتساب (خلال 15 دقيقة)" : "Message WhatsApp (sous 15 min)",
      createdAt:
        new Date().toLocaleDateString() +
        " " +
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "pending",
      channel: "whatsapp",
      note: whatsappNote.trim() || undefined,
    };

    const nextTickets = [newTicket, ...myTickets];
    setMyTickets(nextTickets);
    try {
      localStorage.setItem("scholarchina_callback_tickets", JSON.stringify(nextTickets));
    } catch {}

    setWhatsappSubmitted(true);
    setWhatsappSubmittedTicket(ticketNumber);

    // Also add confirmation to the chat thread
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const ticketMsg: ChatMessage = {
      id: "adv-wa-" + Date.now(),
      sender: "advisor",
      text:
        lang === "ar"
          ? `✅ تم تسجيل رقمك على واتساب بنجاح! رقم التذكرة: **${ticketNumber}**.\n\nسيقوم مستشارنا بمراسلتك مباشرة عبر واتساب على الرقم **${cleanPhone}** خلال 15 دقيقة لمساعدتك بخصوص: *${whatsappTopic}*.`
          : `✅ Votre numéro WhatsApp a bien été enregistré ! Référence : **${ticketNumber}**.\n\nNotre conseiller d'admission va vous envoyer un message WhatsApp directement au **${cleanPhone}** dans les 15 minutes concernant votre demande (*${whatsappTopic}*).`,
      timestamp: timeStr,
      status: "read",
      isTicketConfirmation: true,
      ticketId: ticketNumber,
    };

    setMessages((prev) => [...prev, ticketMsg]);
  };

  const clearChatHistory = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("scholarchina_live_chat_messages");
      } catch {}
    }
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: "fresh-1",
        sender: "advisor",
        text:
          lang === "ar"
            ? "تم بدء محادثة جديدة. تفضل بطرح أي سؤال وسأجيبك فوراً 💬"
            : "Nouvelle discussion initialisée. N'hésitez pas à poser votre question en direct 💬",
        timestamp: initialTime,
        status: "read",
      },
    ]);
  };

  // WhatsApp Pre-filled URL Generator
  const getWhatsAppUrl = () => {
    const advisorNumber = "212660123456"; // Dedicated Student Support Desk
    const textMsg = encodeURIComponent(
      `Bonjour l'équipe ScholarChina ! Je suis candidat pour étudier en Chine (2026/2027). J'aimerais avoir des informations sur les bourses CSC, le test CSCA et l'accompagnement d'admission. Mon prénom : ${user?.username || "Étudiant"}`
    );
    return `https://wa.me/${advisorNumber}?text=${textMsg}`;
  };

  return (
    <>
      {/* Floating Widget Trigger at Bottom Corner */}
      <div
        className={`fixed z-50 transition-all duration-300 bottom-5 ${
          lang === "ar" ? "left-5" : "right-5"
        }`}
      >
        {/* Proactive Greeting Pill */}
        <AnimatePresence>
          {showGreetingBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-3 max-w-xs sm:max-w-sm p-3.5 rounded-2xl glass-dark shadow-2xl border border-emerald-500/40 relative text-left bg-slate-900/95 text-white"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGreetingBubble(false);
                  sessionStorage.setItem("live_chat_greeting_dismissed", "true");
                }}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
                    SC
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="pr-4">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>{lang === "ar" ? "مستشار القبول متصل الآن" : "Conseiller d'Admissions en Ligne"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-normal">
                      &lt; 2 min
                    </span>
                  </p>
                  <p className="text-xs text-slate-200 mt-1 leading-snug">
                    {lang === "ar"
                      ? "هل تحتاج مساعدة في اختيار التخصص أو معرفة مواد امتحان CSCA؟ تواصل معنا مباشرة هنا."
                      : "Une question sur votre filière, le test CSCA ou la bourse CSC ? Écrivez-nous en direct !"}
                  </p>
                  <button
                    onClick={toggleOpen}
                    className="mt-2 text-xs font-bold text-cyan hover:underline flex items-center gap-1"
                  >
                    <span>{lang === "ar" ? "فتح المحادثة المباشرة ➔" : "Démarrer la discussion en direct ➔"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Bubble Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          aria-label="Open Live Communication Desk"
          className="relative px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan text-white shadow-2xl shadow-emerald-500/30 border border-emerald-400/40 flex items-center gap-2 cursor-pointer group"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-300" />
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide hidden sm:inline-block">
              {isOpen
                ? lang === "ar"
                  ? "إغلاق المساعد"
                  : "Fermer"
                : lang === "ar"
                ? "تواصل مباشر مع المستشار"
                : "Assistance Directe • En Ligne"}
            </span>
          </div>

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center border-2 border-slate-900 animate-bounce">
              1
            </span>
          )}
        </motion.button>
      </div>

      {/* Main Slide-in Chat / Communication Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay - closes on tap outside on phone */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm sm:hidden z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className={`fixed z-50 bottom-0 inset-x-0 sm:bottom-20 sm:inset-x-auto ${
                lang === "ar" ? "sm:left-6" : "sm:right-6"
              } w-full sm:w-[440px] max-w-full sm:max-w-[440px] h-[92dvh] sm:h-[640px] max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-slate-900/98 text-slate-100 border-t sm:border border-slate-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden pb-[env(safe-area-inset-bottom,0px)]`}
            >
              {/* Mobile Grabber Bar - native app pull down feeling */}
              <div
                className="sm:hidden flex justify-center pt-2.5 pb-1 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 cursor-grab active:cursor-grabbing"
                onClick={() => setIsOpen(false)}
                title="Glisser vers le bas pour fermer"
              >
                <div className="w-10 h-1.5 rounded-full bg-white/25 active:bg-white/40" />
              </div>

              {/* Header: Team & Status */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border-b border-white/10 relative">
              <div className="flex items-center justify-between gap-2.5">
                {/* Left: Avatar + Title + Status (flex-1 with min-w-0 to prevent pushing right buttons) */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan text-slate-950 flex items-center justify-center font-black text-xs sm:text-sm shadow-md">
                      SC
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-white truncate">
                        {lang === "ar" ? "مكتب الإرشاد والتواصل المباشر" : "Desk d'Assistance & Orientation"}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex-shrink-0">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse flex-shrink-0" />
                      <span className="truncate">{lang === "ar" ? "مستشارو الرباط وبكين متصلون الآن" : "Conseillers Rabat & Pékin en ligne"}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions (Volume, Reset, Close X) - flex-shrink-0 guaranteed 100% visible */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 pl-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? "Couper le son" : "Activer le son"}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  </button>
                  <button
                    onClick={clearChatHistory}
                    title={lang === "ar" ? "إعادة بدء المحادثة" : "Réinitialiser la discussion"}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title={lang === "ar" ? "إغلاق النافذة" : "Fermer la fenêtre"}
                    className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-200 border border-white/15 transition-all cursor-pointer shadow-sm flex items-center justify-center ml-0.5"
                    aria-label="Fermer le desk d'assistance"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (4 columns with truncate to guarantee last tab Tickets is visible) */}
              <div className="grid grid-cols-4 gap-1 mt-3 p-1 rounded-xl bg-slate-950/70 border border-white/5 text-[10px] sm:text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${
                    activeTab === "chat"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{lang === "ar" ? "الدردشة" : "Chat"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("whatsapp")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${
                    activeTab === "whatsapp"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </button>
                <button
                  onClick={() => setActiveTab("callback")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${
                    activeTab === "callback"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Headphones className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{lang === "ar" ? "اتصال" : "Rappel"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 min-w-0 ${
                    activeTab === "tickets"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{lang === "ar" ? "طلباتي" : "Tickets"}</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: LIVE CHAT */}
            {activeTab === "chat" && (
              <>
                {/* Chat Messages Scrollable Box with Drag & Drop */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10 relative"
                >
                  {/* Drag & Drop Visual Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 z-40 bg-[#020817]/90 backdrop-blur-md border-2 border-dashed border-cyan m-2 rounded-2xl flex flex-col items-center justify-center p-4 text-center pointer-events-none animate-in fade-in duration-200">
                      <UploadCloud className="w-8 h-8 text-cyan mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-white">
                        {lang === "ar"
                          ? "أفلت صورتك هنا للتحليل والتعرف البصري 100%"
                          : "Déposez votre image ici pour analyse 100%"}
                      </span>
                    </div>
                  )}

                  {/* Pinned Verification Notice */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-[11px] text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      {lang === "ar"
                        ? "استشارات موثقة ومطابقة للضوابط الرسمية لمجلس المنح الصيني (CSC) وامتحان CSCA."
                        : "Réponses certifiées conformes aux directives officielles du CSC & ministère chinois."}
                    </span>
                  </div>

                  {/* Messages Flow */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium"
                            : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-white/10"
                        }`}
                      >
                        {msg.sender === "advisor" && (
                          <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-emerald-400 font-bold border-b border-white/5 pb-1">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Conseiller ScholarChina</span>
                            </span>
                            <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                          </div>
                        )}

                        {/* Attached Image Preview in Message */}
                        {msg.attachment && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20 bg-black/50 max-w-[240px]">
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.name}
                              className="max-h-40 w-auto object-contain rounded-lg"
                            />
                            <div className="p-1 px-2 text-[9px] text-blue-200 flex items-center justify-between bg-blue-900/40">
                              <span className="truncate max-w-[120px] font-bold">{msg.attachment.name}</span>
                              <span className="px-1 py-0.2 rounded text-[8px] bg-blue-500/30 text-cyan font-black">
                                100% Vision
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="prose-invert text-xs sm:text-[13px]">
                          <MarkdownContent content={msg.text} />
                        </div>

                        {/* Read Aloud Button on Advisor Message */}
                        {msg.sender === "advisor" && (
                          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-400">
                            <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => speakText(msg.text, lang)}
                              className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Listen / استماع صوتي"
                            >
                              <Volume2 className="w-3 h-3 text-emerald-400" />
                              <span>{lang === "ar" ? "استماع" : "Écouter"}</span>
                            </button>
                          </div>
                        )}

                        {msg.isTicketConfirmation && msg.ticketId && (
                          <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-emerald-300 font-bold">N° {msg.ticketId}</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Transmis au conseiller
                            </span>
                          </div>
                        )}

                        {msg.sender === "user" && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-blue-200">
                            <span>{msg.timestamp}</span>
                            <CheckCheck className="w-3 h-3 text-cyan" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Human-like typing indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="p-2.5 rounded-2xl rounded-tl-none bg-slate-800 border border-white/10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] text-slate-300 ml-1">
                          {lang === "ar" ? "المستشار يكتب الرد..." : "Le conseiller formule votre réponse..."}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Interactive Prompt Chips */}
                <div className="px-3 pt-2 pb-1 border-t border-white/5 bg-slate-950/40">
                  <div className="flex items-center gap-1 mb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <Sparkles className="w-3 h-3 text-cyan" />
                    <span>{lang === "ar" ? "أسئلة سريعة شائعة بنقرة واحدة:" : "Questions fréquentes en 1 clic :"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQuickQuestion(q.id)}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
                      >
                        {lang === "ar" ? q.labelAr : lang === "fr" ? q.labelFr : q.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-slate-900 border-t border-white/10">
                  {/* Pending Attachment Preview */}
                  {pendingAttachment && (
                    <div className="mb-2 p-1.5 px-2.5 rounded-xl bg-blue-950/80 border border-cyan/40 flex items-center justify-between gap-2 text-xs shadow-md">
                      <div className="flex items-center gap-2">
                        <img
                          src={pendingAttachment.url}
                          alt={pendingAttachment.name}
                          className="w-8 h-8 object-cover rounded-lg border border-cyan/50"
                        />
                        <div className="truncate max-w-[180px]">
                          <span className="text-[11px] font-bold text-white truncate block">
                            {pendingAttachment.name}
                          </span>
                          <span className="text-[9px] text-cyan flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>100% Vision OCR</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingAttachment(null)}
                        className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-1.5"
                  >
                    {/* Vocal Microphone Button */}
                    <button
                      type="button"
                      onClick={toggleListen}
                      title="Speak / تحدث صوتياً"
                      className={`p-2 rounded-xl transition-all flex-shrink-0 cursor-pointer ${
                        listening
                          ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/40"
                          : "bg-slate-800 text-slate-400 hover:text-white border border-white/10"
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Image / Picture Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach photo / إرفاق صورة"
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-cyan border border-white/10 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4 text-cyan" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={
                        pendingAttachment
                          ? lang === "ar"
                            ? "اكتب سؤالك أو اضغط إرسال للتعرف عليها 100%..."
                            : "Posez votre question ou envoyez pour reconnaissance..."
                          : lang === "ar"
                          ? "اكتب أي سؤال أو تحدث أو اسحب صورة..."
                          : "Posez votre question, parlez ou glissez une image..."
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() && !pendingAttachment}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Send className="w-4 h-4 rtl-flip" />
                    </button>
                  </form>
                  <p className="text-[10px] text-center text-slate-400 mt-1.5">
                    {lang === "ar"
                      ? "⚡ دعم فوري مباشر • الرباط & بكين • جميع الاستفسارات مجانية"
                      : "⚡ Assistance instantanée en direct • Rabat & Pékin • Gratuit et confidentiel"}
                  </p>
                </div>
              </>
            )}

            {/* TAB CONTENT 2: WHATSAPP DIRECT (WE SEND THEM A MESSAGE) */}
            {activeTab === "whatsapp" && (
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                {whatsappSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3.5 my-auto"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>

                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 uppercase">
                        Réf : {whatsappSubmittedTicket}
                      </span>
                      <h4 className="text-base font-black text-white mt-2">
                        {lang === "ar" ? "تم تسجيل رقمك بنجاح !" : "Numéro Enregistré avec Succès !"}
                      </h4>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {lang === "ar"
                          ? `سيقوم مستشار القبول بمراسلتك عبر واتساب على الرقم ${whatsappPhone} خلال 15 دقيقة لمساعدتك في طلبك.`
                          : `Notre conseiller d'admission va vous envoyer un message WhatsApp directement au ${whatsappPhone} dans les 15 minutes.`}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-left text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{lang === "ar" ? "الموضوع:" : "Sujet :"}</span>
                        <span className="font-semibold text-emerald-300">{whatsappTopic}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{lang === "ar" ? "وقت الاستجابة:" : "Délai de réponse :"}</span>
                        <span className="text-white font-mono font-bold">&lt; 15 min (7j/7, 9h-21h)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => {
                          setWhatsappSubmitted(false);
                          setWhatsappPhone("");
                          setWhatsappNote("");
                        }}
                        className="w-full py-2.5 px-3 rounded-xl glass hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
                      >
                        {lang === "ar" ? "إرسال رقم آخر" : "Envoyer un autre numéro"}
                      </button>

                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{lang === "ar" ? "أو افتح واتساب الآن بنفسك ➔" : "Ou ouvrir WhatsApp maintenant vous-même ➔"}</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleWhatsAppSubmit} className="space-y-3">
                    <div className="text-center pb-1">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/20">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-white">
                        {lang === "ar"
                          ? "سنرسل لك رسالة عبر واتساب"
                          : "Nous vous envoyons un message WhatsApp"}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {lang === "ar"
                          ? "أدخل رقم هاتفك وسيقوم مستشارنا بمراسلتك فوراً عبر واتساب للإجابة عن أسئلتك ومراجعة ملفك."
                          : "Entrez votre numéro et notre équipe d'admission vous écrira sur WhatsApp dans les 15 minutes."}
                      </p>
                    </div>

                    {/* Nom & Prénom */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {lang === "ar" ? "الاسم الكامل" : "Nom & Prénom"}
                      </label>
                      <input
                        type="text"
                        value={whatsappName}
                        onChange={(e) => setWhatsappName(e.target.value)}
                        placeholder="Ex: Yassine El Amrani"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Numéro WhatsApp */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {lang === "ar" ? "رقم الواتساب المغربي أو الدولي *" : "Numéro WhatsApp (Maroc ou International) *"}
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-mono font-bold text-emerald-400 select-none flex items-center gap-1">
                          <span>🇲🇦</span>
                          <span>+212</span>
                        </span>
                        <input
                          type="tel"
                          required
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          placeholder="06 12 34 56 78 ou 07..."
                          className="w-full pl-20 pr-3 py-2 rounded-xl bg-slate-800 border border-emerald-500/40 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === "ar"
                          ? "يقبل أرقام 06 أو 07 أو +212 أو الأرقام الدولية"
                          : "Numéros 06, 07 ou format international acceptés"}
                      </p>
                    </div>

                    {/* Sujet de la question */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {lang === "ar" ? "ما الذي ترغب بالاستفسار عنه؟" : "Objet de votre demande"}
                      </label>
                      <select
                        value={whatsappTopic}
                        onChange={(e) => setWhatsappTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white outline-none focus:border-emerald-500"
                      >
                        <option value="Bourse Complète CSC (Gouvernement Chinois)">
                          Bourse Complète CSC (Exemption 100% + Logement + Salaire)
                        </option>
                        <option value="Préparation Test CSCA 2026/2027">
                          Examen National CSCA (Matières, inscription & cours)
                        </option>
                        <option value="Apostille.ma & Traduction Assermentée">
                          Légalisation Apostille & Traduction des diplômes
                        </option>
                        <option value="Choix de l'Université & Programme">
                          Choix de l'université (Tsinghua, PKU, SJTU...) & Filière
                        </option>
                        <option value="Procédure Visa Étudiant X1 & JW202">
                          Formulaire JW202 et Visa X1 à Rabat
                        </option>
                        <option value="Autre demande urgente">Autre demande urgente</option>
                      </select>
                    </div>

                    {/* Note facultative */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {lang === "ar" ? "رسالة أو تفاصيل سريعة (اختياري)" : "Précision ou question rapide (facultatif)"}
                      </label>
                      <input
                        type="text"
                        value={whatsappNote}
                        onChange={(e) => setWhatsappNote(e.target.value)}
                        placeholder="Ex: J'ai un Bac SM 16/20, je veux étudier le Génie Logiciel"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!whatsappPhone.trim()}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      <span>
                        {lang === "ar"
                          ? "إرسال رقمي — تواصلوا معي عبر واتساب ➔"
                          : "Envoyer mon numéro — Écrivez-moi sur WhatsApp ➔"}
                      </span>
                    </button>

                    {/* Alternative link */}
                    <div className="pt-1.5 text-center">
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center justify-center gap-1 font-semibold"
                      >
                        <span>{lang === "ar" ? "أو فتح واتساب مباشرة مع المستشار الآن" : "Ou ouvrir directement WhatsApp maintenant"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: CALLBACK REQUEST */}
            {activeTab === "callback" && (
              <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                <form onSubmit={handleCallbackSubmit} className="space-y-3.5">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>{lang === "ar" ? "طلب مكالمة هاتفية مجانية من مستشار" : "Demande de Rappel Téléphonique Gratuit"}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === "ar"
                        ? "اترك رقم هاتفك وسيقوم أحد مستشارينا بالاتصال بك لمناقشة ملفك."
                        : "Renseignez vos coordonnées, notre conseiller d'admissions vous appelle au créneau souhaité."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === "ar" ? "الاسم الكامل" : "Nom & Prénom"}
                    </label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder="Ex: Yassine El Amrani"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === "ar" ? "رقم الهاتف المغربي (WhatsApp / Appel)" : "Numéro de téléphone marocain"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="Ex: 06 12 34 56 78 ou 07 00 11 22 33"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === "ar" ? "موضوع الاستفسار" : "Sujet de votre question"}
                    </label>
                    <select
                      value={callbackTopic}
                      onChange={(e) => setCallbackTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="CSCA Exam Guidance">Examen CSCA & Choix des matières</option>
                      <option value="CSC Scholarship Application">Bourses CSC & Choix de l'Université</option>
                      <option value="Apostille and Translation">Apostille MAEC & Traductions assermentées</option>
                      <option value="JW202 and Visa X1">Formulaire JW202 & Visa Ambassade Rabat</option>
                      <option value="General Admission Questions">Question générale / Bilan d'orientation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {lang === "ar" ? "الموعد المفضل للاتصال" : "Créneau de rappel souhaité"}
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: "asap", label: lang === "ar" ? "في أقرب وقت" : "Dès que possible" },
                        { id: "morning", label: "Matin (9h-12h)" },
                        { id: "afternoon", label: "Après-midi (14h-18h)" },
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setCallbackTime(slot.id)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all ${
                            callbackTime === slot.id
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                              : "bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "تأكيد طلب الاتصال المجاني" : "Demander mon Appel Gratuit"}</span>
                  </button>
                </form>

                {callbackSubmitted && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                    {lang === "ar"
                      ? "✅ تم تسجيل طلبك بنجاح! سيتصل بك المستشار في الموعد المحدد."
                      : "✅ Demande enregistrée ! Notre conseiller vous appellera sous peu."}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: MY TICKETS */}
            {activeTab === "tickets" && (
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {lang === "ar" ? "طلباتك وتذاكر التواصل المفتوحة" : "Mes Demandes & Tickets de Support"}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {myTickets.length} {lang === "ar" ? "طلب" : "ticket(s)"}
                  </span>
                </div>

                {myTickets.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 space-y-3">
                    <FileText className="w-10 h-10 mx-auto opacity-30 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {lang === "ar" ? "لا توجد طلبات سابقة حتى الآن." : "Aucune demande enregistrée pour le moment."}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lang === "ar"
                          ? "سجل رقمك وسنتواصل معك عبر واتساب أو الهاتف."
                          : "Laissez votre numéro pour être contacté par message WhatsApp ou appel."}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab("whatsapp")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "مراسلة عبر واتساب" : "Message WhatsApp"}</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("callback")}
                        className="px-3.5 py-2 rounded-xl glass hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {lang === "ar" ? "طلب مكالمة" : "Rappel vocal"}
                      </button>
                    </div>
                  </div>
                ) : (
                  myTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{t.id}</span>
                          {t.channel === "whatsapp" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span>WhatsApp</span>
                              <MessageSquare className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <span>Appel</span>
                              <Phone className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {t.status === "pending"
                            ? t.channel === "whatsapp"
                              ? (lang === "ar" ? "في انتظار الرسالة" : "Message à envoyer")
                              : (lang === "ar" ? "في انتظار الاتصال" : "En attente d'appel")
                            : (lang === "ar" ? "تم التواصل" : "Traité")}
                        </span>
                      </div>
                      <p className="text-white font-semibold">{t.topic}</p>
                      {t.note && (
                        <p className="text-[11px] text-slate-300 italic bg-white/5 p-1.5 rounded-lg border border-white/5">
                          « {t.note} »
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="font-mono text-emerald-400 font-bold">{t.phone}</span>
                        <span>{t.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Intelligent Advisor Auto-Response Engine
 * Provides immediate, official, and personalized guidance for any admission question.
 */
function generateAdvisorResponse(
  message: string,
  lang: string,
  username?: string
): { text: string; isTicket?: boolean; ticketId?: string } {
  const lower = message.toLowerCase();
  const isAr = lang === "ar" || /[\u0600-\u06FF]/.test(message);

  // 0. WhatsApp Direct Contact Question
  if (lower.includes("whatsapp") || lower.includes("واتساب") || lower.includes("ecrivez") || lower.includes("écrivez") || lower.includes("راسلوني") || lower.includes("mon numero") || lower.includes("mon numéro") || lower.includes("رقمي")) {
    if (isAr) {
      return {
        text: `### 📲 التواصل المباشر عبر واتساب:
يسعدنا مراسلتك مباشرة! يمكنك إدخال رقم هاتفك المغربي (+212) أو الدولي في تبويب **WhatsApp** بأعلى هذه النافذة، وسيقوم أحد مستشارينا المعتمدين بإرسال رسالة إليك خلال 15 دقيقة لمواكبتك في ملفك مجاناً.

أو يمكنك أيضاً النقر مباشرة على زر WhatsApp لبدء المحادثة فوراً!`,
      };
    }
    return {
      text: `### 📲 Contact Direct sur WhatsApp :
Nous pouvons vous écrire directement sur WhatsApp ! Rendez-vous sur l'onglet **WhatsApp** juste au-dessus pour laisser votre numéro de téléphone marocain (+212) ou international. Notre équipe d'admission vous enverra un message personnalisé d'ici 15 minutes.

Vous pouvez également cliquer sur l'onglet WhatsApp pour ouvrir directement la discussion !`,
    };
  }

  // 1. CSCA Exam Question
  if (lower.includes("csca") || lower.includes("examen") || lower.includes("امتحان") || lower.includes("اختبار")) {
    if (isAr) {
      return {
        text: `### 🎯 تفاصيل امتحان CSCA الوطني الجديد للصين:

1. **هل هو إجباري؟** نعم، أصبح إجبارياً للطلبة الراغبين في دراسة سلك البكالوريوس (Bachelor) في الصين ابتداءً من موسم 2026/2027.
2. **المواد المطلوبة حسب تخصصك:**
   - **هندسة البرمجيات / علوم الحاسوب (Software/CS):** الرياضيات مسار STEM + الفيزياء.
   - **التجارة الإلكترونية / الاقتصاد (E-Commerce/Business):** الرياضيات العامة فقط (معفى من الفيزياء والكيمياء).
   - **الطب (MBBS):** الرياضيات + الكيمياء + الفيزياء أو علم الأحياء.
3. **التسجيل وحجز الموعد:** يتم مباشرة عبر المنصة الرسمية [csca.cn](https://www.csca.cn).
4. **الرسوم:** تتراوح بين 450 و 750 يوان صيني (~630 إلى 1,050 درهم مغربي).

هل ترغب في أن نساعدك في حجز الموعد أو مراجعة مواد تخصصك المفضل؟`,
      };
    }
    return {
      text: `### 🎯 Guide Officiel de l'Examen National CSCA :

1. **Qui est concerné ?** Tous les bacheliers et candidats postulant en **Licence / Bachelor** dans les universités chinoises pour la rentrée 2026/2027.
2. **Épreuves selon votre projet d'études :**
   - **Génie Logiciel / Informatique (Software Engineering) :** Mathématiques (STEM) + Physique.
   - **E-Commerce / Commerce International :** Mathématiques Générales uniquement (exempté de physique et chimie !).
   - **Médecine (MBBS) :** Mathématiques + Chimie + Physique.
3. **Inscription & Prise de RDV :** Directement sur le portail officiel [csca.cn](https://www.csca.cn).
4. **Frais :** Entre 450 et 750 RMB (~630 à 1 050 DH) selon le nombre d'épreuves.

Vous pouvez tester notre [Simulateur de Filières CSCA](/csca) directement sur la plateforme ! Souhaitez-vous une assistance pour l'inscription ?`,
    };
  }

  // 2. Full Funding / CSC Scholarship Question
  if (
    lower.includes("bourse") ||
    lower.includes("csc") ||
    lower.includes("منحة") ||
    lower.includes("stipend") ||
    lower.includes("gratuit")
  ) {
    if (isAr) {
      return {
        text: `### 🏆 تفاصيل المنحة الصينية الكاملة (CSC Full Scholarship):

- **الإعفاء الدراسي:** 100% من رسوم التسجيل والدراسة طيلة فترة التكوين.
- **السكن الجامعي:** إقامة جامعية مجانية داخل الحرم الجامعي (غرفة مفردة أو مشتركة).
- **الراتب الشهري (Stipend):**
  - سلك البكالوريوس: **2,500 يوان/شهرياً** (~3,500 درهم).
  - الماستر: **3,000 يوان/شهرياً** (~4,200 درهم).
  - الدكتوراه: **3,500 يوان/شهرياً** (~4,900 درهم).
- **التأمين الصحي الشامل:** مغطى بالكامل (800 يوان/سنة).

💡 **طريقة التقديم:** إما عبر برنامج التعاون الثنائي (Type A) بسفارة الصين بالرباط أو التقديم المباشر على بوابة الجامعة (Type B). يمكنك تصفح الجامعات المتاحة عبر قائمة [المنح المفتوحة](/scholarships).`,
      };
    }
    return {
      text: `### 🏆 Avantages de la Bourse Complète du Gouvernement Chinois (CSC) :

- **Frais de scolarité :** Exonération à 100% (gratuité totale des cours).
- **Logement universitaire :** Chambre gratuite sur le campus universitaire.
- **Allocation mensuelle de subsistance :**
  - **Licence (Bachelor) :** **2 500 RMB / mois** (~3 500 DH)
  - **Master :** **3 000 RMB / mois** (~4 200 DH)
  - **Doctorat (PhD) :** **3 500 RMB / mois** (~4 900 DH)
- **Assurance médicale :** Prise en charge à 100% par le CSC.

💡 Vous pouvez suivre chaque étape de dépôt dans votre [CRM de Traçabilité](/tracker?view=traceability). Avez-vous déjà préparé vos relevés de notes ?`,
    };
  }

  // 3. Moroccan Apostille & Legalization Question
  if (lower.includes("apostille") || lower.includes("légalisation") || lower.includes("أبوستيل") || lower.includes("تصديق")) {
    if (isAr) {
      return {
        text: `### 🏛️ إجراءات تصديق الأبوستيل المغربي (Apostille MAEC):

1. **الترجمة المحلفة:** ترجمة شهادة البكالوريا / الإجازة وكشوف النقاط إلى اللغة الإنجليزية أو الصينية لدى مترجم محلف معتمد.
2. **بوابة الأبوستيل:** تقديم الطلب إلكترونياً عبر [apostille.ma](https://www.apostille.ma) وتحديد المحكمة الابتدائية التابع لها صاحب الشهادة.
3. **طابع الأبوستيل:** استلام الملصق الرقمي وطبعه وإرفاقه بالشهادة الأصلية والمترجمة.
4. **الصين ومعهد لاهاي:** منذ نونبر 2023 أصبحت الصين عضواً في اتفاقية لاهاي للأبوستيل، وبالتالي **لم يعد ضرورياً** الذهاب إلى القنصلية الصينية للتصديق إذا كان لديك طابع الأبوستيل المغربي!

هل ترغب في قائمة المترجمين المحلفين المعتمدين بالرباط أو الدار البيضاء؟`,
      };
    }
    return {
      text: `### 🏛️ Guide de l'Apostille au Maroc pour les Universités Chinoises :

1. **Traduction assermentée :** Traduisez vos diplômes et relevés de notes en anglais ou chinois auprès d'un traducteur agréé.
2. **Plateforme Officielle :** Faites la demande sur [apostille.ma](https://www.apostille.ma) auprès du tribunal de première instance de votre ville.
3. **Validité en Chine :** Depuis novembre 2023, la Chine applique la Convention de La Haye ! Le tampon Apostille marocain est directement reconnu par les universités chinoises, sans double légalisation consulaire.

Nous pouvons vous orienter vers notre service de traduction assermentée partenaire via l'onglet **Services** de la plateforme.`,
    };
  }

  // 4. Visa X1 / JW202 / Shipping Question
  if (lower.includes("visa") || lower.includes("jw202") || lower.includes("ambassade") || lower.includes("سفارة") || lower.includes("تأشيرة")) {
    if (isAr) {
      return {
        text: `### 🛂 استخراج فيزا الدراسة X1 واستمارة JW202:

1. **استمارة JW202 الأصلية:** تصدرها الجامعة الصينية ووزارة التعليم ببكين وترسل إليك في المغرب عبر البريد السريع (DHL أو SF Express).
2. **الوثائق المطلوبة للسفارة الصينية بالرباط:**
   - أصل شهادة القبول الرسمية (Admission Notice)
   - استمارة JW202 / JW201 الأصلية
   - الفحص الطبي للأجانب (Foreigner Physical Examination Form)
   - جواز السفر المغربي ساري المفعول (صلاحية 6 أشهر على الأقل)
3. **العنوان بالرباط:** مصلحة الشؤون القنصلية، 16 شارع أحمد بلافريج، حي السويسي، الرباط.

يمكنك تتبع رقم طرد DHL الخاص بك مباشرة عبر [صفحة التتبع](/tracker?view=traceability).`,
      };
    }
    return {
      text: `### 🛂 Procédure du Formulaire JW202 & Visa Étudiant X1 :

1. **Formulaire JW202 / JW201 :** Dès votre admission validée à Pékin, l'université vous expédie l'original par courrier express (DHL / SF Express).
2. **Rendez-vous à l'Ambassade de Chine à Rabat :**
   - Pièces : Passeport valide, Lettre d'Admission originale, JW202 originale, Visite Médicale (formulaire officiel avec radio thorax & sérologie).
   - Adresse : Service Consulaire, 16 Avenue Ahmed Balafrej, Souissi, Rabat.
   - Délai de délivrance du visa X1 : ~4 à 7 jours ouvrables.

Suivez le statut de votre colis DHL dans votre [Espace de Traçabilité](/tracker?view=traceability) !`,
    };
  }

  // Default: Direct Personal Counselor Assistance + Ticket Creation
  const autoTicket = "SUPPORT-MA-" + Math.floor(100000 + Math.random() * 900000);
  if (isAr) {
    return {
      text: `أهلاً بك! لقد تم استلام استفسارك وتسجيله تحت الرقم المرجعي: **${autoTicket}**.\n\nبناءً على طلبك، قام مستشار القبول بمراجعة تفاصيل سؤالك: "${message}". نحن متواجدون لمواكبتك خطوة بخطوة حتى وصولك إلى الحرم الجامعي بالصين.\n\nهل تفضل أن يتصل بك مستشارنا عبر الهاتف، أم تريد متابعة المحادثة مباشرة هنا؟ يمكنك أيضاً التواصل معنا عبر واتساب عبر زر WhatsApp أعلاه.`,
      isTicket: true,
      ticketId: autoTicket,
    };
  }

  return {
    text: `Bien reçu ! Votre question a été transmise à notre conseiller d'admissions et enregistrée sous le ticket : **${autoTicket}**.\n\nNous analysons votre demande : "${message}". Notre équipe à Rabat et Pékin est à votre disposition pour vous orienter vers la meilleure université et vous assister pour vos démarches administratives.\n\nSouhaitez-vous qu'un conseiller vous appelle directement par téléphone (onglet **Rappel**), ou préférez-vous continuer à échanger par message ici ?`,
    isTicket: true,
    ticketId: autoTicket,
  };
}
