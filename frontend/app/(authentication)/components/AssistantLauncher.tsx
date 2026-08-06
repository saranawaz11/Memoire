"use client";

// components/assistant-launcher.tsx
//
// Global "Onyx" launcher. Drop this once into app/layout.tsx (inside the
// authenticated part of the tree) and it renders a floating bubble in the
// bottom-right corner on every page. Clicking it opens a compact chat panel
// that can create/find/update/delete notes via the same agent that used to
// live at /assistant.
//
// Motion direction: the panel opens *from* the bubble (scale + origin at
// bottom-right, spring) rather than just appearing, so the bubble reads as
// the panel's handle instead of two unrelated elements. Assistant replies
// use the same blur-develop reveal as the /ai page's answers, and the send
// button morphs the same way as the rest of the app's forms — small things,
// but they're what make Onyx feel like part of the product instead of a
// bolted-on widget.
//
// UI changes beyond animation: assistant messages now get an avatar chip so
// role is legible without reading color, the bubble has a resting "breathe"
// so it doesn't look dead when idle, and the typing indicator now matches
// the dot-bloom used elsewhere instead of a generic bounce.

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Sparkles, X, ArrowUp, Loader2 } from "lucide-react";
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
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-24 right-6 z-50 flex h-[70vh] max-h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#E4DFD3] bg-[#FBFAF6] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E4DFD3] bg-white px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6B45] text-white">
                  <Sparkles size={14} strokeWidth={2.5} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4ADE80]" />
                </span>
                <div>
                  <p className="font-serif text-[15px] leading-none text-[#221F1A]">Onyx</p>
                  <p className="mt-1 text-[11px] leading-none text-[#8A8578]">
                    Create, find, and edit notes
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => setOpen(false)}
                aria-label="Close"
                whileTap={{ scale: 0.9 }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#8A8578] transition-colors hover:bg-[#EFEBE0] hover:text-[#221F1A]"
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {historyLoading && (
                <p className="text-center text-xs text-[#B3AC9C]">Loading conversation…</p>
              )}

              {!historyLoading && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex h-full flex-col items-center justify-center px-4 text-center"
                >
                  <motion.span
                    animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles size={20} className="mb-2 text-[#1B6B45]" />
                  </motion.span>
                  <p className="text-sm text-[#5C5749]">
                    Try &quot;create a note called Grocery list&quot; or &quot;find my notes about routines&quot;.
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
                      className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#1B6B45] px-3.5 py-2 text-[13.5px] leading-relaxed text-white"
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
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7F1EA] text-[#1B6B45]">
                        <Sparkles size={10} strokeWidth={2.5} />
                      </span>
                      <motion.div
                        variants={assistantDevelop}
                        initial="hidden"
                        animate="show"
                        className="whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-[#E4DFD3] bg-white px-3.5 py-2 text-[13.5px] leading-relaxed text-[#3E3A32]"
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
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7F1EA] text-[#1B6B45]">
                    <Sparkles size={10} strokeWidth={2.5} />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-[#E4DFD3] bg-white px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[#1B6B45]"
                        animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-[#E4DFD3] bg-white p-3">
              <div className="flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-[#FBFAF6] px-3.5 py-2 transition focus-within:border-[#1B6B45] focus-within:ring-2 focus-within:ring-[#1B6B45]/15">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Onyx…"
                  className="flex-1 bg-transparent text-[13.5px] text-[#221F1A] outline-none placeholder:text-[#B3AC9C]"
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                  whileTap={{ scale: 0.88 }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B6B45] text-white transition disabled:opacity-30"
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
                        <ArrowUp size={14} strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B6B45] text-white shadow-lg"
      >
        {/* Resting "breathe" ring — only while closed, so the bubble doesn't
            look inert when there's nothing else drawing the eye to it. */}
        {!open && !reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#1B6B45]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
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
            {open ? <X size={20} /> : <Sparkles size={20} strokeWidth={2.25} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}