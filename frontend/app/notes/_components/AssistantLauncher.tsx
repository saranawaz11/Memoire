"use client";

// components/assistant-launcher.tsx
//
// Global "Onyx" launcher, restyled to match Mémoire's old-letters aesthetic:
// parchment panel, hairline gold rule work, ink-green "wax seal" as the
// signature element for the bubble and assistant avatar, serif italic
// voice for the brand name and assistant replies. Functional behaviour
// (open/close, history load, send flow) is unchanged from the previous
// version — this pass only touches presentation.
//
// Palette (kept close to Mémoire's own, extended with one new accent):
//   --ink-green   #123B29  primary wax / header
//   --sage-green  #1B6B45  existing brand green, used for the user bubble
//   --gold        #C9A227  new — the seal ring, hairlines, small caps labels
//   --parchment   #F6EFDD  panel background
//   --parchment-2 #FFFDF7  card / reply background
//   --border-warm #D9CBA0  hairline borders on parchment
//   --ink         #221F1A  primary text
//   --ink-faded   #8A8578  secondary text

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Feather, X, Send, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { chatWithAI, getChatHistory } from "@/lib/ai";
import { useNotesRefresh } from "@/lib/note-refresh-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 32 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const assistantDevelop: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 4 },
  show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// A small engraved flourish used in the header rule and the empty state —
// the kind of scrollwork you'd find under a letterhead, drawn as line art
// so it reads as an ornament rather than an icon.
function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8C14 2 22 2 30 8C38 14 46 14 54 8C58 5 62 5 60 8C58 11 56 8 60 8C64 8 68 5 66 8C64 11 68 11 66 8C90 2 98 2 110 8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="60" cy="8" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function AssistantLauncher() {
  const { isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { bump: bumpNotesVersion } = useNotesRefresh();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history lazily, the first time the panel is opened — not on every
  // page load.
  useEffect(() => {
    if (!open || historyLoaded || !userLoaded || !authLoaded) return;

    let cancelled = false;

    (async () => {
      setHistoryLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const history = await getChatHistory(token);
        if (cancelled) return;
        setMessages(
          history.messages.map((m) => ({
            role: m.role === "human" ? "user" : "assistant",
            content: m.content,
          }))
        );
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
          setHistoryLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, historyLoaded, userLoaded, authLoaded, getToken]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in.");
      const result = await chatWithAI(text, token);
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
      if (result.notes_changed) {
        bumpNotesVersion();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!userLoaded || !authLoaded) return null;

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{
              transformOrigin: "bottom right",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(201,162,39,0.14) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
            className="fixed bottom-24 right-6 z-50 flex h-[70vh] max-h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-[#D9CBA0] bg-[#F6EFDD] shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex flex-col border-b border-[#C9A227]/50 bg-gradient-to-r from-[#0F3423] to-[#1B6B45] px-4 pb-3 pt-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Wax seal mark */}
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123B29] text-[#E9CE7B] shadow-[0_0_0_2px_#0F3423,0_0_0_3px_#C9A227,0_3px_6px_rgba(0,0,0,0.35)]">
                    <Feather size={15} strokeWidth={2} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0F3423] bg-[#7FBF63]" />
                  </span>
                  <div>
                    <p className="font-serif text-[17px] italic leading-none text-[#F6EFDD]">
                      Onyx
                    </p>
                    <p className="mt-1 text-[10px] uppercase leading-none tracking-[0.14em] text-[#C9A227]">
                      Create &middot; Find &middot; Edit notes
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  whileTap={{ scale: 0.9 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#C9A227] transition-colors hover:bg-white/10 hover:text-[#F6EFDD]"
                >
                  <X size={15} />
                </motion.button>
              </div>
              <Flourish className="mt-2.5 h-2.5 w-full text-[#C9A227]/40" />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {historyLoading && (
                <p className="text-center text-xs italic text-[#9A9280]">
                  Unfolding your last letter…
                </p>
              )}

              {!historyLoading && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex h-full flex-col items-center justify-center px-5 text-center"
                >
                  <Flourish className="mb-3 h-3 w-24 text-[#C9A227]" />
                  <p className="font-serif text-[15px] italic leading-snug text-[#5C5749]">
                    &ldquo;Create a note called Grocery list,&rdquo; or &ldquo;find my
                    notes about routines.&rdquo;
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#B3AC9C]">
                    Onyx is listening
                  </p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <motion.div
                      key={i}
                      variants={messageVariants}
                      initial="hidden"
                      animate="show"
                      className="ml-auto max-w-[85%] rounded-lg rounded-br-sm border border-[#0F3423] bg-[#123B29] px-3.5 py-2 text-[13.5px] leading-relaxed text-[#F6EFDD] shadow-sm"
                    >
                      {m.content}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={i}
                      variants={messageVariants}
                      initial="hidden"
                      animate="show"
                      className="mr-auto flex max-w-[85%] items-start gap-2"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123B29] text-[#C9A227] shadow-[0_0_0_1.5px_#F6EFDD,0_0_0_2.5px_#C9A227]">
                        <Feather size={9} strokeWidth={2.25} />
                      </span>
                      <motion.div
                        variants={assistantDevelop}
                        initial="hidden"
                        animate="show"
                        className="whitespace-pre-wrap rounded-lg rounded-bl-sm border border-[#D9CBA0] bg-[#FFFDF7] px-3.5 py-2 font-serif text-[13.5px] leading-relaxed text-[#3E3A32] shadow-sm"
                      >
                        {m.content}
                      </motion.div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mr-auto flex max-w-[85%] items-center gap-2"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#123B29] text-[#C9A227] shadow-[0_0_0_1.5px_#F6EFDD,0_0_0_2.5px_#C9A227]">
                    <Feather size={9} strokeWidth={2.25} />
                  </span>
                  <div className="flex items-center gap-1 rounded-lg rounded-bl-sm border border-[#D9CBA0] bg-[#FFFDF7] px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[#C9A227]"
                        animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              {error && <p className="text-xs text-red-700">{error}</p>}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-[#D9CBA0] bg-[#FFFDF7] p-3">
              <div className="flex items-center gap-2 rounded-full border border-[#D9CBA0] bg-[#F6EFDD] px-3.5 py-2 transition focus-within:border-[#C9A227] focus-within:ring-2 focus-within:ring-[#C9A227]/20">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write to Onyx…"
                  className="flex-1 bg-transparent font-serif text-[13.5px] italic text-[#221F1A] outline-none placeholder:text-[#B3AC9C]"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  whileTap={{ scale: 0.88 }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#123B29] text-[#E9CE7B] shadow-[0_0_0_1.5px_#F6EFDD,0_0_0_2.5px_#C9A227] transition disabled:opacity-30"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1, rotate: 360 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{
                          rotate: { duration: 0.9, repeat: Infinity, ease: "linear" },
                          default: { duration: 0.15 },
                        }}
                      >
                        <Loader2 size={13} strokeWidth={2.5} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.12 }}
                      >
                        <Send size={12} strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble — a wax seal pressed into the corner of the page */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#123B29] text-[#E9CE7B] shadow-[0_0_0_2px_#0F3423,0_0_0_4px_#C9A227,0_10px_24px_rgba(0,0,0,0.35)]"
      >
        {/* Resting "breathe" ring — only while closed, so the seal doesn't
            look inert when there's nothing else drawing the eye to it. */}
        {!open && !reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#C9A227]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {open ? <X size={20} /> : <Feather size={19} strokeWidth={2} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}