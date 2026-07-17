"use client";

// app/ai/page.tsx
//
// Route: /ai
// Lets the user ask a question and get an answer generated from their own
// notes (pgvector similarity search + LLM), with links back to the exact
// notes that were used as sources.
//
// Assumes:
// - Clerk is already wired up in this app (useUser from @clerk/nextjs).
// - Individual notes are viewable at /notes/[id]. Change NOTE_HREF below
//   if your route is different.

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { askAI, type AISourceNote } from "@/lib/ai";

const NOTE_HREF = (id: number) => `/notes/${id}`;

interface Exchange {
  question: string;
  answer: string;
  sources: AISourceNote[];
}

export default function AIPage() {
  const { user, isLoaded } = useUser();
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || !user || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await askAI(q, {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
      });
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

  if (!isLoaded) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Ask your notes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search across everything you've written. Answers link straight
          back to the notes they came from.
        </p>
      </header>

      <div className="space-y-6">
        {exchanges.map((ex, i) => (
          <div key={i} className="space-y-3">
            <p className="text-sm font-medium text-slate-900">{ex.question}</p>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {ex.answer}
              </p>

              {ex.sources.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    From your notes
                  </p>
                  <ul className="space-y-2">
                    {ex.sources.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={NOTE_HREF(s.id)}
                          className="group flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-slate-50"
                        >
                          <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                            #{s.id}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-slate-800 group-hover:underline">
                              {s.title}
                            </span>
                            {s.snippet && (
                              <span className="block text-xs text-slate-500">
                                {s.snippet}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-sm text-slate-400">Searching your notes…</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <form onSubmit={handleAsk} className="sticky bottom-6 mt-8">
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about your notes…"
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}