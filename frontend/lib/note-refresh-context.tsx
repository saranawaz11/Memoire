"use client";

// lib/notes-refresh-context.tsx
//
// Small shared signal between AssistantLauncher (global, mounted in the
// layout) and the /notes page (or any other component that lists notes).
//
// PROBLEM this solves: AssistantLauncher can create/update/delete notes
// via the chat agent, but it has no direct reference to whatever state
// the /notes page uses to render its list — they're separate components
// with no shared state today, so a note created via chat doesn't show up
// until a full page reload.
//
// FIX: wrap both of them in <NotesRefreshProvider>. AssistantLauncher
// calls bump() whenever the backend reports notes_changed: true for a
// turn. Any component that renders a notes list calls useNotesRefresh()
// and includes `version` in its fetch effect's dependency array — when
// it changes, that's the signal to refetch.
//
// This is deliberately NOT a cache/store (no note data lives here) — just
// a "something changed, go refetch" counter, so it stays trivial to wire
// up regardless of how each page currently fetches its notes.

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface NotesRefreshContextValue {
  /** Increments every time a note is created/updated/deleted elsewhere. */
  version: number;
  /** Call this after any successful note mutation. */
  bump: () => void;
}

const NotesRefreshContext = createContext<NotesRefreshContextValue | null>(null);

export function NotesRefreshProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  return (
    <NotesRefreshContext.Provider value={{ version, bump }}>
      {children}
    </NotesRefreshContext.Provider>
  );
}

export function useNotesRefresh(): NotesRefreshContextValue {
  const ctx = useContext(NotesRefreshContext);
  if (!ctx) {
    throw new Error(
      "useNotesRefresh must be used within a NotesRefreshProvider — wrap it around your layout, above both AssistantLauncher and the notes page."
    );
  }
  return ctx;
}