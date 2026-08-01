"use client";

// components/assistant-launcher.tsx
//
// Global "Onyx" launcher. Drop this once into app/layout.tsx (inside the
// authenticated part of the tree) and it renders a floating bubble in the
// bottom-right corner on every page. Clicking it opens a compact chat panel
// that can create/find/update/delete notes via the same agent that used to
// live at /assistant.
//
// This is the shell you can grow into the merged ai+assistant surface later:
// right now it wraps chatWithAI/getChatHistory, but /ai's "ask and cite"
// flow could live in the same panel behind a mode toggle down the line.

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Sparkles, X, ArrowUp } from "lucide-react";
import { chatWithAI, getChatHistory } from "@/lib/ai";
import { useNotesRefresh } from "@/lib/note-refresh-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantLauncher() {
  const { isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();

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
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[70vh] max-h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#E4DFD3] bg-[#FBFAF6] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4DFD3] bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6B45] text-white">
                <Sparkles size={14} strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-serif text-[15px] leading-none text-[#221F1A]">Onyx</p>
                <p className="mt-1 text-[11px] leading-none text-[#8A8578]">
                  Create, find, and edit notes
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#8A8578] transition hover:bg-[#EFEBE0] hover:text-[#221F1A]"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {historyLoading && (
              <p className="text-center text-xs text-[#B3AC9C]">Loading conversation…</p>
            )}

            {!historyLoading && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <Sparkles size={20} className="mb-2 text-[#1B6B45]" />
                <p className="text-sm text-[#5C5749]">
                  Try &quot;create a note called Grocery list&quot; or &quot;find my notes about routines&quot;.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#1B6B45] px-3.5 py-2 text-[13.5px] leading-relaxed text-white"
                    : "mr-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-[#E4DFD3] bg-white px-3.5 py-2 text-[13.5px] leading-relaxed text-[#3E3A32]"
                }
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[#E4DFD3] bg-white px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B3AC9C] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B3AC9C] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B3AC9C]" />
              </div>
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
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B6B45] text-white transition disabled:opacity-30"
              >
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B6B45] text-white shadow-lg transition hover:scale-105 hover:shadow-xl active:scale-95"
      >
        {open ? <X size={20} /> : <Sparkles size={20} strokeWidth={2.25} />}
      </button>
    </>
  );
}