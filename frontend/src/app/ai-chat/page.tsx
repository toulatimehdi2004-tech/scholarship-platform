"use client";

import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lock,
  Keyboard,
  Mic,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  sendChatMessage,
  getToken,
  getCurrentUser,
  getApiBaseUrl,
  type ChatMessage,
  type User as UserType,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";
import ArabicKeyboard from "@/components/ArabicKeyboard";
import MarkdownContent from "@/components/MarkdownContent";

export default function AiChatPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [showKb, setShowKb] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("chat-voice") === "on") setVoiceOn(true);
    } catch {}
  }, []);

  const speechSupported =
    mounted &&
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) &&
    "speechSynthesis" in window;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [user, setUser] = useState<UserType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    getCurrentUser().then((res) => {
      if (res.data) setUser(res.data);
    });
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-show Arabic keyboard if Arabic language is chosen
  useEffect(() => {
    if (lang === "ar") setShowKb(true);
  }, [lang]);

  // Clean speech when unmounting
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
        recognitionRef.current?.stop?.();
      } catch {}
    };
  }, []);

  function speechLang() {
    return lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US";
  }

  function speak(text: string) {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const clean = text
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/[#>*_`]/g, "")
        .slice(0, 1200);
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = speechLang();
      const voices = synth.getVoices();
      const match = voices.find((v) => v.lang?.startsWith(lang));
      if (match) utter.voice = match;
      synth.speak(utter);
    } catch {}
  }

  function toggleVoice() {
    setVoiceOn((v) => {
      const next = !v;
      try {
        localStorage.setItem("chat-voice", next ? "on" : "off");
      } catch {}
      if (!next) {
        try {
          window.speechSynthesis?.cancel();
        } catch {}
      }
      return next;
    });
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function resetChat() {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    setMessages([]);
    setSessionId("");
    setInput("");
    inputRef.current?.focus();
  }

  function scoreTranscript(text: string, locale: string): number {
    const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const french = (text.match(/[éèêëàâîïôûùçœæÉÈÊÀÇ]/g) || []).length;
    const len = text.trim().length;
    const appLocale = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
    const appBoost = locale.startsWith(appLocale) ? 50 : 0;
    if (locale.startsWith("ar")) return appBoost + arabic * 3 + len * 0.05;
    if (locale.startsWith("fr")) return appBoost + french * 4 + len * 0.05;
    return appBoost + len * 0.1 - arabic * 2 - french * 2;
  }

  function toggleListen() {
    if (listening) {
      stopAllRecognition();
      return;
    }
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      window.speechSynthesis?.cancel();
      const locales = ["ar-SA", "fr-FR", "en-US"];
      const recs: any[] = [];
      const base = input;
      let done = false;
      let decideTimer: any = null;
      const finals: { locale: string; text: string }[] = [];
      const finish = (transcript: string | null) => {
        if (done) return;
        done = true;
        if (decideTimer) clearTimeout(decideTimer);
        for (const r of recs) {
          try {
            r.onresult = null;
            r.onend = null;
            r.onerror = null;
            r.stop();
          } catch {}
        }
        recognitionRef.current = null;
        setListening(false);
        if (transcript) setInput((base + " " + transcript).trim());
      };
      const decide = () => {
        if (!finals.length) return;
        let best = finals[0];
        let bestScore = -Infinity;
        for (const f of finals) {
          const s = scoreTranscript(f.text, f.locale);
          if (s > bestScore) {
            bestScore = s;
            best = f;
          }
        }
        finish(best.text);
      };
      for (const locale of locales) {
        const rec = new SR();
        rec.lang = locale;
        rec.interimResults = true;
        rec.continuous = false;
        rec.onresult = (e: any) => {
          let transcript = "";
          let isFinal = false;
          for (const r of e.results) {
            transcript += r[0].transcript;
            if (r.isFinal) isFinal = true;
          }
          if (isFinal && transcript.trim()) {
            finals.push({ locale, text: transcript.trim() });
            if (!decideTimer) decideTimer = setTimeout(decide, 1800);
          }
        };
        rec.onend = () => {
          (rec as any).__ended = true;
          if (!decideTimer && recs.every((r) => r.__ended || r.__dead)) {
            decideTimer = setTimeout(() => decide(), 300);
            setTimeout(() => {
              if (!finals.length) finish(null);
            }, 600);
          }
        };
        rec.onerror = () => {
          (rec as any).__dead = true;
          if (!decideTimer && recs.every((r) => r.__ended || r.__dead)) {
            setTimeout(() => {
              if (!finals.length) finish(null);
              else decide();
            }, 600);
          }
        };
        recs.push(rec);
      }
      recognitionRef.current = { stop: () => finish(null) };
      for (const r of recs) {
        try {
          r.start();
        } catch {}
      }
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopAllRecognition() {
    try {
      recognitionRef.current?.stop?.();
    } catch {}
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    try {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    } catch {}

    const userMessage: ChatMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // 1. Try real-time streaming endpoint first
    const streamed = await streamMessage(messageText);
    if (!streamed) {
      // 2. Resilient fallback to single completion endpoint
      const response = await sendChatMessage(messageText, sessionId, lang);
      if (response.data) {
        if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
        }
        const aiMessage: ChatMessage = {
          role: "assistant",
          content:
            response.data.response ||
            "Sorry, the AI did not return a response. Please try again.",
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (voiceOn && aiMessage.content) speak(response.data.response);
      } else {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: response.error || "Sorry, an unexpected error occurred. Please try again.",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    }
    setLoading(false);
  };

  /** Streams the AI reply token-by-token for instant feedback. */
  const streamMessage = async (messageText: string): Promise<boolean> => {
    let acc = "";
    try {
      const token = getToken();
      const res = await fetch(`${getApiBaseUrl()}/ai/chat/stream/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: "Token " + token } : {}),
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId || undefined,
          language: lang,
          use_ai: true,
        }),
      });

      if (!res.ok || !res.body) return false;

      // Placeholder assistant message that fills dynamically
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const paint = () => {
        const snapshot = acc;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") break;
          try {
            const obj = JSON.parse(payload);
            if (obj.session_id && !sessionId) setSessionId(obj.session_id);
            if (obj.error) {
              acc = obj.response || "Notice: " + obj.error;
              paint();
              break;
            }
            if (obj.token) {
              acc += obj.token;
              paint();
            }
          } catch {}
        }
      }

      if (!acc) {
        setMessages((prev) => prev.slice(0, -1));
        return false;
      }

      if (voiceOn) speak(acc);
      return true;
    } catch {
      return false;
    }
  };

  // High-intellect starter prompt chips
  const getStarterPrompts = () => {
    if (lang === "ar") {
      return [
        {
          icon: "📝",
          title: "امتحان CSCA الإجباري للبكالوريوس في الصين",
          prompt: "ما هو امتحان CSCA الصيني الجديد؟ وما هي المواد الإجبارية للبكالوريا المغربية وكيفية حجز موعد على csca.cn؟",
        },
        {
          icon: "🏆",
          title: "مقارنة منح CSC Type A و Type B",
          prompt: "ما هو الفرق بالتفصيل بين منحة الحكومة الصينية CSC Type A و Type B؟ وما هي رواتب المعيشة وشروط القبول؟",
        },
        {
          icon: "✍️",
          title: "صياغة وتدقيق خطاب النوايا (SOP)",
          prompt: "ساعدني في كتابة وهيكلة خطاب نوايا احترافي (Statement of Purpose) للتقديم على الماستر في الصين.",
        },
        {
          icon: "📧",
          title: "إيميل رسمي للأستاذ الصيني للحصول على قبول",
          prompt: "اكتب لي نموذج إيميل احترافي وقوي لمراسلة بروفيسور صيني للحصول على خطاب قبول مبدئي (Acceptance Letter).",
        },
        {
          icon: "🇲🇦",
          title: "دليل الطلاب المغاربة للفيزا والأبوستيل",
          prompt: "اشرح لي بالتفصيل خطوات تصديق الوثائق في المغرب (الخارجية والأبوستيل)، معادلة النقط إلى 4.0 GPA، وإجراءات فيزا X1.",
        },
        {
          icon: "💡",
          title: "شرح الحوسبة الكمية والخوارزميات",
          prompt: "اشرح لي مبدأ الحوسبة الكمية (Quantum Computing) وخوارزمية شور ببساطة ودقة علمية.",
        },
        {
          icon: "💻",
          title: "كود بايثون لتتبع مواعيد المنح",
          prompt: "اكتب لي كود Python يقوم بحساب الأيام المتبقية لمواعيد المنح وتنبيهي قبل انتهاء الأجل.",
        },
      ];
    }
    if (lang === "fr") {
      return [
        {
          icon: "📝",
          title: "Examen CSCA obligatoire pour Bachelor en Chine",
          prompt: "Qu'est-ce que le nouvel examen CSCA (China Scholastic Assessment) ? Quelles matières passer selon mon Bac marocain et comment prendre rendez-vous sur csca.cn ?",
        },
        {
          icon: "🏆",
          title: "Bourses CSC Type A vs Type B",
          prompt: "Explique-moi en détail la différence entre les bourses du gouvernement chinois CSC Type A et Type B, les quotas et les allocations mensuelles.",
        },
        {
          icon: "✍️",
          title: "Rédiger et structurer mon SOP",
          prompt: "Aide-moi à rédiger une lettre de motivation (Statement of Purpose) percutante pour un Master en Chine.",
        },
        {
          icon: "📧",
          title: "Email à un professeur chinois (Acceptance Letter)",
          prompt: "Rédige un email professionnel et convaincant pour contacter un professeur d'université chinoise afin d'obtenir une lettre d'acceptation de supervision.",
        },
        {
          icon: "🇲🇦",
          title: "Guide étudiant marocain : Apostille & Visa X1",
          prompt: "Explique-moi la procédure marocaine : légalisation Ministère des Affaires Étrangères à Rabat, apostille.ma, conversion des notes /20 en GPA 4.0 et visa X1.",
        },
        {
          icon: "💡",
          title: "Intelligence Artificielle & Réseaux de Neurones",
          prompt: "Explique le fonctionnement des modèles Transformer et du mécanisme d'attention en termes clairs et rigoureux.",
        },
        {
          icon: "💻",
          title: "Script Python compte à rebours deadlines",
          prompt: "Écris un script Python propre pour calculer le compte à rebours des bourses et trier par urgence.",
        },
      ];
    }
    return [
      {
        icon: "📝",
        title: "Mandatory CSCA Exam for Bachelor in China",
        prompt: "What is the new CSCA (China Scholastic Competency Assessment) exam? Which subjects are mandatory for Moroccan applicants and how do I schedule an appointment on csca.cn?",
      },
      {
        icon: "🏆",
        title: "Compare CSC Type A vs Type B",
        prompt: "Explain in detail the differences between Chinese Government Scholarship CSC Type A and Type B, including quotas, application channels, and monthly stipends.",
      },
      {
        icon: "✍️",
        title: "Draft & Polish Statement of Purpose (SOP)",
        prompt: "Help me craft and structure a compelling Statement of Purpose (SOP) for a Master's program in Computer Science at a top Chinese university.",
      },
      {
        icon: "📧",
        title: "Cold Email to Professor for Acceptance Letter",
        prompt: "Write a high-conversion, professional cold email template to reach out to a Chinese university professor for a supervisor acceptance letter.",
      },
      {
        icon: "🇲🇦",
        title: "Moroccan Student Guide: Legalization, GPA & Visa",
        prompt: "Walk me through Moroccan document legalization (MFA Rabat / Apostille), converting marks out of 20 to 4.0 GPA, and X1 visa application steps.",
      },
      {
        icon: "💡",
        title: "Explain Quantum Computing Simply",
        prompt: "Explain the fundamental principles of quantum computing, qubits, superposition, and entanglement in clear, articulate terms.",
      },
      {
        icon: "💻",
        title: "Python Script to Track Deadlines",
        prompt: "Write a clean Python script that parses scholarship deadlines and prints an urgent countdown table.",
      },
    ];
  };

  const starterPrompts = getStarterPrompts();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background-base">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-border-glass px-4 sm:px-6 py-3.5 flex-shrink-0"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                  Scholar AI
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Omni-Intelligence
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {lang === "ar"
                  ? "مساعدك الأكاديمي الذكي للإجابة عن أي سؤال ومنح الصين الدراسية"
                  : lang === "fr"
                  ? "Votre mentor IA d'élite pour répondre à toute question & bourses en Chine"
                  : "Your elite AI mentor answering ANY question & China scholarship guidance"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                title="New Chat / محادثة جديدة"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors border border-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === "ar" ? "محادثة جديدة" : lang === "fr" ? "Nouveau chat" : "New Chat"}
                </span>
              </button>
            )}

            {speechSupported && (
              <button
                onClick={toggleVoice}
                title="Voice replies / الردود الصوتية"
                className={`p-2 rounded-lg transition-all flex-shrink-0 border ${
                  voiceOn
                    ? "text-blue-400 bg-blue-500/15 border-blue-500/30 shadow-sm"
                    : "text-text-muted hover:text-text-primary border-transparent hover:bg-white/5"
                }`}
              >
                {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Free Plan Limit Notice (if applicable) */}
      {user && !user.student_profile?.is_premium && !user.is_staff && (
        <div className="px-4 pt-3 max-w-5xl mx-auto w-full flex-shrink-0">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-text-secondary">
                {lang === "ar"
                  ? "أنت في الخطة القياسية (10 أسئلة مجانية يومياً). قم بالترقية للوصول غير المحدود."
                  : lang === "fr"
                  ? "Plan Standard (10 questions IA gratuites/jour). Passez VIP pour un accès illimité."
                  : "Standard Plan (10 free AI questions/day). Upgrade to VIP for unlimited conversations."}
              </span>
            </div>
            <Link
              href="/pricing"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 underline"
            >
              {lang === "ar" ? "ترقية الخطة" : lang === "fr" ? "Voir les plans" : "View VIP Plans"}
            </Link>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Empty State Hero */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3 tracking-tight">
                {lang === "ar"
                  ? "كيف يمكنني مساعدتك اليوم؟"
                  : lang === "fr"
                  ? "Comment puis-je vous aider aujourd'hui ?"
                  : "How can I accelerate your journey today?"}
              </h2>

              <p className="text-text-secondary mb-8 max-w-xl mx-auto text-sm leading-relaxed">
                {lang === "ar"
                  ? "اسألني عن أي موضوع: مقارنة منح CSC الصينية، مراجعة وتدقيق خطاب النوايا، إيميلات المشرفين، خطوات الفيزا والأبوستيل بالمغرب، حل المعادلات، البرمجة، أو الاستراتيجية الأكاديمية."
                  : lang === "fr"
                  ? "Posez-moi n'importe quelle question : bourses CSC, révision de SOP, prise de contact avec superviseurs chinois, apostille & visa au Maroc, code, mathématiques ou stratégie d'admission."
                  : "Ask me anything: CSC Type A & B comparisons, Statement of Purpose reviews, supervisor outreach emails, Moroccan apostille & visa procedures, coding, math, or admissions strategy."}
              </p>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                {starterPrompts.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(card.prompt)}
                    className="glass rounded-xl p-4 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xl mb-2">{card.icon}</div>
                      <h3 className="text-xs font-semibold text-text-primary group-hover:text-blue-400 transition-colors mb-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                        {card.prompt}
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-400/80 font-medium mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {lang === "ar" ? "اسأل الآن ←" : lang === "fr" ? "Poser la question →" : "Ask now →"}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages Feed */}
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-blue-500/20">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/30 text-text-primary"
                    : "glass border border-white/10 text-text-primary shadow-lg"
                }`}
              >
                {message.role === "assistant" ? (
                  <div>
                    <MarkdownContent content={message.content} />

                    {/* Action Toolbar on Assistant Messages */}
                    {message.content && (
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-xs text-text-muted">
                        <button
                          onClick={() => handleCopy(message.content, i)}
                          className="flex items-center gap-1 hover:text-text-primary transition-colors py-0.5"
                          title="Copy text / نسخ النص"
                        >
                          {copiedIdx === i ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className={copiedIdx === i ? "text-emerald-400 font-medium" : ""}>
                            {copiedIdx === i ? "Copied" : "Copy"}
                          </span>
                        </button>

                        {speechSupported && (
                          <button
                            onClick={() => speak(message.content)}
                            className="flex items-center gap-1 hover:text-text-primary transition-colors py-0.5"
                            title="Read aloud / قراءة صوتية"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass rounded-2xl px-5 py-3.5 border border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-text-muted">
                  {lang === "ar"
                    ? "يقوم بتحليل السؤال وصياغة الإجابة..."
                    : lang === "fr"
                    ? "Scholar AI analyse et formule la réponse..."
                    : "Scholar AI is reasoning & composing..."}
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="glass border-t border-border-glass px-4 py-3.5 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 glass rounded-xl px-3.5 py-1.5 border border-white/10 focus-within:border-blue-500/50 transition-colors">
            <button
              onClick={() => setShowKb((v) => !v)}
              title="Arabic keyboard / لوحة المفاتيح العربية"
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                showKb
                  ? "text-blue-400 bg-blue-500/15"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {speechSupported && (
              <button
                onClick={toggleListen}
                title="Speak / تحدث"
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  listening
                    ? "text-red-400 bg-red-500/15 animate-pulse"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={
                lang === "ar"
                  ? "اطرح أي سؤال على Scholar AI (المنح، الوثائق، البرمجة، الرياضيات، المقالات)..."
                  : lang === "fr"
                  ? "Posez n'importe quelle question à Scholar AI (bourses, SOP, visa, code, etc.)..."
                  : "Ask Scholar AI any question (scholarships, SOP review, code, math, visas)..."
              }
              dir={lang === "ar" ? "rtl" : "ltr"}
              lang={lang}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-2 text-sm"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {showKb && (
            <div className="mt-2">
              <ArabicKeyboard
                onKey={(ch) => setInput((prev) => prev + ch)}
                onBackspace={() => setInput((prev) => prev.slice(0, -1))}
                onEnter={() => sendMessage()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
