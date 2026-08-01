"use client";

// app/ai/page.tsx
//
// Route: /ai
// Lets the user ask a question and get an answer generated from their own
// notes (pgvector similarity search + LLM), with links back to the exact
// notes that were used as sources.
//
// Visual direction: a "reading room," not a search-results page — centered
// and quiet when empty, journal-entry cards once you've asked something.
//
// Motion direction: the search bar is the one continuous thread through the
// whole page — it migrates from center-stage to a sticky footer instead of
// the page just re-rendering under it (handled by the shared `layout` prop
// below, no manual FLIP math needed). Question + answer text "develop into
// focus" (blur → sharp) rather than just fading, echoing the idea of reading
// something as it settles. Everything respects prefers-reduced-motion.
//
// Requires: npm install framer-motion

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Sparkles, ArrowUp, BookOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { askAI, type AISourceNote } from "@/lib/ai";

const NOTE_HREF = (id: number) => `/notes/${id}`;

const SUGGESTIONS = [
  "What have I written about lately?",
  "Summarize my notes from this week",
  "Find anything I said about routines",
];

interface Exchange {
  question: string;
  answer: string;
  sources: AISourceNote[];
}

export default function AIPage() {
  const { isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  async function ask(q: string) {
    if (!q || loading) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in.");

      const result = await askAI(q, token);
      setExchanges((prev) => [
        ...prev,
        { question: q, answer: result.answer, sources: result.sources },
      ]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    await ask(question.trim());
  }

  if (!userLoaded || !authLoaded) return null;

  const isEmpty = exchanges.length === 0;

  // --- motion variants -----------------------------------------------

  const heroStagger: Variants = {
    hidden: {},
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const heroItem: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0 },
  };

  const developIn: Variants = {
    hidden: { opacity: 0, filter: reduceMotion ? "blur(0px)" : "blur(6px)", y: reduceMotion ? 0 : 6 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const chipStagger: Variants = {
    hidden: {},
    show: { transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.05 } },
  };

  const chipItem: Variants = {
    hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.85, y: reduceMotion ? 0 : 6 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }, // slight overshoot, like a stamp
    },
  };

  return (
    <div className="min-h-full h-dvh bg-[#F7F4EC]">
      <motion.div
        layout
        transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
        className={
          isEmpty
            ? "mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-28 text-center"
            : "mx-auto max-w-2xl px-4 py-12"
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {isEmpty ? (
            <motion.div
              key="empty-state"
              variants={heroStagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: "easeIn" } }}
              className="flex w-full flex-col items-center"
            >
              <motion.span
                variants={heroItem}
                className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#E7F1EA] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#1B6B45]"
              >
                <Sparkles size={12} strokeWidth={2.5} />
                Ask your notes
              </motion.span>

              <motion.h1
                variants={heroItem}
                className="font-serif text-3xl leading-tight text-[#221F1A] sm:text-4xl"
              >
                What are you looking for?
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-3 max-w-md text-sm leading-relaxed text-[#8A8578]"
              >
                Ask anything — answers are drawn only from what you've written,
                with links straight back to the source notes.
              </motion.p>

              <motion.form variants={heroItem} onSubmit={handleAsk} className="mt-9 w-full">
                <motion.div
                  layout
                  className="flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-white px-4 py-2.5 shadow-sm transition focus-within:border-[#1B6B45] focus-within:ring-2 focus-within:ring-[#1B6B45]/15"
                >
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask something about your notes…"
                    className="flex-1 bg-transparent text-sm text-[#221F1A] outline-none placeholder:text-[#B3AC9C]"
                    disabled={loading}
                    autoFocus
                  />
                  <SendButton loading={loading} disabled={!question.trim()} />
                </motion.div>
              </motion.form>

              <motion.div
                variants={chipStagger}
                initial="hidden"
                animate="show"
                className="mt-5 flex flex-wrap justify-center gap-2"
              >
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    variants={chipItem}
                    onClick={() => ask(s)}
                    disabled={loading}
                    whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    className="rounded-full border border-[#E4DFD3] bg-white px-3.5 py-1.5 text-xs text-[#5C5749] transition-colors hover:border-[#1B6B45]/40 hover:text-[#1B6B45] disabled:opacity-40"
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="thread-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }}
              className="w-full"
            >
              <motion.header
                layout
                className="mb-8 flex items-center justify-between"
              >
                <div>
                  <h1 className="font-serif text-2xl text-[#221F1A]">Ask your notes</h1>
                  <p className="mt-1 text-sm text-[#8A8578]">
                    Every answer is grounded in something you actually wrote.
                  </p>
                </div>
                <motion.span
                  key={exchanges.length}
                  initial={{ scale: reduceMotion ? 1 : 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="hidden items-center gap-1.5 rounded-full bg-[#E7F1EA] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#1B6B45] sm:inline-flex"
                >
                  <Sparkles size={12} strokeWidth={2.5} />
                  {exchanges.length} {exchanges.length === 1 ? "answer" : "answers"}
                </motion.span>
              </motion.header>

              <motion.div layout className="space-y-8">
                <AnimatePresence initial={false}>
                  {exchanges.map((ex, i) => (
                    <motion.article
                      key={i}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="rounded-2xl border border-[#E4DFD3] bg-white p-6 shadow-sm"
                    >
                      <motion.p
                        variants={developIn}
                        initial="hidden"
                        animate="show"
                        className="font-serif text-lg italic leading-snug text-[#221F1A]"
                      >
                        "{ex.question}"
                      </motion.p>

                      <motion.p
                        variants={developIn}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.08 }}
                        className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[#3E3A32]"
                      >
                        {ex.answer}
                      </motion.p>

                      {ex.sources.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.3 } }}
                          className="mt-5 border-t border-[#EFEBE0] pt-4"
                        >
                          <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#B3AC9C]">
                            <BookOpen size={12} />
                            From your notes
                          </p>
                          <motion.div
                            variants={chipStagger}
                            initial="hidden"
                            animate="show"
                            transition={{ delayChildren: 0.22 }}
                            className="flex flex-wrap gap-2"
                          >
                            {ex.sources.map((s) => (
                              <motion.div key={s.id} variants={chipItem}>
                                <Link
                                  href={NOTE_HREF(s.id)}
                                  className="group inline-flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-[#FBFAF6] px-3 py-1.5 transition hover:border-[#1B6B45]/40 hover:bg-[#E7F1EA]"
                                >
                                  <span className="rounded-full bg-[#EFEBE0] px-1.5 py-0.5 font-mono text-[10px] text-[#8A8578] group-hover:bg-white group-hover:text-[#1B6B45]">
                                    #{s.id}
                                  </span>
                                  <span className="text-xs font-medium text-[#5C5749] group-hover:text-[#1B6B45]">
                                    {s.title}
                                  </span>
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.article>
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-1 text-sm text-[#8A8578]"
                  >
                    <motion.span
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={14} />
                    </motion.span>
                    Reading your notes
                    <ThinkingDots reduceMotion={!!reduceMotion} />
                  </motion.div>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </motion.div>

              <motion.form layout onSubmit={handleAsk} className="sticky bottom-6 mt-8">
                <div className="flex items-center gap-2 rounded-full border border-[#E4DFD3] bg-white px-4 py-2.5 shadow-md transition focus-within:border-[#1B6B45] focus-within:ring-2 focus-within:ring-[#1B6B45]/15">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up…"
                    className="flex-1 bg-transparent text-sm text-[#221F1A] outline-none placeholder:text-[#B3AC9C]"
                    disabled={loading}
                  />
                  <SendButton loading={loading} disabled={!question.trim()} />
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// A small dedicated component keeps the loading ⇄ idle icon swap declarative
// (AnimatePresence needs a stable subtree to cross-fade between).
function SendButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      aria-label="Ask"
      whileTap={{ scale: 0.88 }}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B6B45] text-white transition disabled:opacity-30"
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ rotate: { duration: 0.9, repeat: Infinity, ease: "linear" }, default: { duration: 0.2 } }}
          >
            <Loader2 size={15} strokeWidth={2.5} />
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Three dots that bloom in sequence — softer than a spinner, and it echoes
// the "developing into focus" motif used on the answer text.
function ThinkingDots({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return <span>…</span>;
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-[#1B6B45]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}