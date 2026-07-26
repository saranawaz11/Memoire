"use client";

// app/assistant/page.tsx
//
// Route: /assistant
// A conversational assistant that can create, list, view, update, and
// delete the user's notes, and search them, via the tool-calling agent at
// POST /ai/chat. Distinct from /ai (askAI/ai/query), which is a one-shot
// search-and-cite tool with no ability to take actions.

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { chatWithAI, getChatHistory } from "@/lib/ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const { isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: load prior messages once, when the page mounts and auth is ready.
  useEffect(() => {
    if (!userLoaded || !authLoaded) return;

    let cancelled = false;

    (async () => {
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
        // Non-fatal: an empty chat is a fine fallback if history can't load.
        console.error("Failed to load chat history", err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, authLoaded]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Show the user's message immediately, optimistic-UI style.
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in.");

      const result = await chatWithAI(text, token);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!userLoaded || !authLoaded) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Notes assistant
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask it to create, find, update, or delete notes — or just ask
          questions about what you have written.
        </p>
      </header>

      <div className="space-y-4">
        {historyLoading && (
          <p className="text-sm text-slate-400">Loading conversation…</p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
                : "mr-auto max-w-[80%] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="mr-auto max-w-[80%] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400">
            Thinking…
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <form onSubmit={handleSend} className="sticky bottom-6 mt-8">
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'Create a note called Grocery list'"
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}