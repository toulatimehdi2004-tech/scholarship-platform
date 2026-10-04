"use client";

import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Lock, Keyboard, Mic, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendChatMessage, getToken, getCurrentUser, type ChatMessage, type User as UserType } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import ArabicKeyboard from "@/components/ArabicKeyboard";

export default function AiChatPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [showKb, setShowKb] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
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
  const suggestions = [t("chat.s1"), t("chat.s2"), t("chat.s3"), t("chat.s4")];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [user, setUser] = useState<UserType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }
    getCurrentUser().then((res) => {
      if (res.data) setUser(res.data);
    });
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-show the Arabic keyboard when Arabic is chosen
  useEffect(() => {
    if (lang === "ar") setShowKb(true);
  }, [lang]);

  // Stop any speech when leaving the page
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

  function scoreTranscript(text: string, locale: string): number {
    const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const french = (text.match(/[éèêëàâîïôûùçœæÉÈÊÀÇ]/g) || []).length;
    const len = text.trim().length;
    // Favor the recognizer matching the app language, but still understand others
    const appLocale = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
    const appBoost = locale.startsWith(appLocale) ? 50 : 0;
    if (locale.startsWith("ar")) return appBoost + arabic * 3 + len * 0.05;
    if (locale.startsWith("fr")) return appBoost + french * 4 + len * 0.05;
    // English: reward plain latin, penalize other scripts
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
      // Recognizers for Arabic, French and English listen together —
      // whichever truly understands the speech wins (no language switching needed)
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
            // give the other recognizers a moment, then pick the best match
            if (!decideTimer) decideTimer = setTimeout(decide, 1800);
          }
        };
        rec.onend = () => {
          (rec as any).__ended = true;
          if (!decideTimer && recs.every((r) => r.__ended || r.__dead)) {
            decideTimer = setTimeout(() => decide(), 300);
            // decide() with no finals does nothing; ensure we still stop:
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
  }, [messages]);

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

    // Try streaming first (answers appear word-by-word, like Gemini)
    const streamed = await streamMessage(messageText);
    if (!streamed) {
      // Fallback to the classic single-response endpoint
      const response = await sendChatMessage(messageText, sessionId, lang);
      if (response.data) {
        if (!sessionId && response.data.session_id) {
          setSessionId(response.data.session_id);
        }
        const aiMessage: ChatMessage = {
          role: "assistant",
          content:
            response.data.response ||
            "Sorry, the AI didn't respond. Please try again.",
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (voiceOn && aiMessage.content) speak(response.data.response);
      } else {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: response.error || "Sorry, something went wrong.",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    }
    setLoading(false);
  };

  /** Streams the AI reply token-by-token. Returns true if anything arrived. */
  const streamMessage = async (messageText: string): Promise<boolean> => {
    let acc = "";
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/api/ai/chat/stream/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Token " + token } : {}),
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId || undefined,
          language: lang,
        }),
      });
      if (!res.ok || !res.body) return false;
      // placeholder message that fills in live
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
              acc = obj.response || "Sorry, something went wrong.";
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
        // remove the empty placeholder, caller falls back
        setMessages((prev) => prev.slice(0, -1));
        return false;
      }
      if (voiceOn) speak(acc);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-border-glass px-6 py-4"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              {t("chat.title")}
            </h1>
            <p className="text-xs text-text-muted">
              {t("chat.subtitle")}
            </p>
          </div>
          {speechSupported && (
            <button
              onClick={toggleVoice}
              title="Voice replies / Réponses vocales / الردود الصوتية"
              className={`ml-auto p-2.5 rounded-lg transition-all flex-shrink-0 ${
                voiceOn
                  ? "text-cyan bg-cyan/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.div>

      {/* Premium Banner for Free Users */}
      {user && !user.student_profile?.is_premium && messages.length === 0 && (
        <div className="mx-4 mt-4 max-w-4xl lg:mx-auto w-full">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple/10 to-cyan/10 border border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-text-secondary">
                {t("chat.freeBanner")}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
            >
              {t("chat.upgrade")}
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">
                {t("chat.welcome")}
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {t("chat.welcomeSub")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="glass rounded-xl p-4 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-cyan flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  message.role === "user"
                    ? "bg-blue/20 border border-blue/20 text-text-primary"
                    : "glass text-text-primary"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-blue/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-blue" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-cyan flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full bg-purple" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-purple" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-purple" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="glass border-t border-border-glass px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2">
            <button
              onClick={() => setShowKb((v) => !v)}
              title="Arabic keyboard / لوحة المفاتيح"
              className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${
                showKb
                  ? "text-cyan bg-cyan/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>
            {speechSupported && (
              <button
                onClick={toggleListen}
                title="Speak / Parler / تحدث"
                className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${
                  listening
                    ? "text-red-400 bg-red-500/10 animate-pulse"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t("chat.placeholder")}
              dir={lang === "ar" ? "rtl" : "ltr"}
              lang={lang}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none py-2"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-gradient-to-br from-cyan to-purple text-white disabled:opacity-40 disabled:cursor-not-allowed hover:glow-cyan-sm transition-all"
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
