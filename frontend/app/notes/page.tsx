"use client";

import { useState, useRef, useEffect } from "react";
import { useSearch } from "@/lib/search-context";
import styles from "@/app/notes/_components/Notes.module.css";
import { Note } from "@/types/note";
import { Button } from "@/components/ui/button";
import { Hash, Pencil, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const PALETTE = [
  { name: "Parchment", value: "#f4f1ea" }, // default / cream
  { name: "Correspondence", value: "#e8ddc7" }, // tan
  { name: "Ledger", value: "#e3cba3" }, // ochre
  { name: "Sage", value: "#d8e0d0" },
  { name: "Dusk Rose", value: "#e6d3d1" },
  { name: "Ink Wash", value: "#d6dde0" },
];

const initialNotes = [
  {
    id: "how-long",
    title: "How Long",
    content: "— untitled entry —",
    date: "Jul 29 · 12:22 pm",
    words: 0,
    color: null,
  },
  {
    id: "shopping",
    title: "My Shopping List",
    preview: "shampoo, soap, makeup",
    date: "Jul 29 · 12:19 pm",
    words: 3,
    color: null,
  },
  {
    id: "cars",
    title: "Cars",
    preview: "— untitled entry —",
    date: "Jul 29 · 12:11 pm",
    words: 0,
    color: null,
  },
  {
    id: "jasmine",
    title: "Jasmine Flower",
    preview: "— untitled entry —",
    date: "Jul 29 · 12:10 pm",
    words: 0,
    color: null,
  },
  {
    id: "flower",
    title: "Flower",
    preview: "— untitled entry —",
    date: "Jul 27 · 10:50 am",
    words: 0,
    color: null,
  },
];
import { apiFetch } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useNotesRefresh } from "@/lib/note-refresh-context";
import stripHtml from "@/lib/notes-helpers";
import DeleteButton from "../(authentication)/components/Deletebutton";
type MeProfile = { userId: string; role: string };

export default function NotesPage() {
  const { query } = useSearch();
  // const [notes, setNotes] = useState(initialNotes);
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { userId, getToken, signOut } = useAuth();
  const { version: notesVersion } = useNotesRefresh();

  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<MeProfile | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPickerId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userId || !user) return;

    // CHANGED: was fetch('http://127.0.0.1:8000/me', { headers: { x-user-id, ... } })
    apiFetch("/me", getToken)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, [userId, user]);

  useEffect(() => {
    if (!userId) return;
    setIsLoaded(false);

    // CHANGED: was fetch('http://127.0.0.1:8000/notes/', { headers: { 'x-user-id': userId } })
    apiFetch("/notes/", getToken)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Notes request failed: ${r.status}`);
        return r.json() as Promise<Note[]>;
      })
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setIsLoaded(true);
      })
      .catch((e) => {
        console.error(e);
        setNotes([]);
        setIsLoaded(true);
      });
    // NEW: notesVersion added — refetches whenever AssistantLauncher
    // reports a note was actually mutated elsewhere in the app.
  }, [userId, notesVersion]);
  // Swap the body of this function for a real PATCH call once your
  // notes have a backend. Everything else stays the same.
  const updateNoteColor = (id: string, color: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
    setOpenPickerId(null);

    // Example of what the real version looks like:
    // fetch(`/api/notes/${id}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ color }),
    // }).catch(() => {
    //   // revert on failure
    //   setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color: null } : n)));
    // });
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.preview.toLowerCase().includes(query.toLowerCase()),
  );

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="main">
      <div className="main-head flex justify-between items-center">
        <div>
          <h2>Gallrey View</h2>
          {!isLoaded && <div className="text-black/50 text-sm">Loading...</div>}
          {isLoaded && notes.length === 0 && (
            <div className="text-black/50 text-sm">No notes yet.</div>
          )}
          {isLoaded && notes.length > 0 && (
            <div className="text-black/50 text-sm">
              {filtered.length} notes
              {query
                ? ` · matching "${query}"`
                : ` · last edited ${dateFormatter.format(new Date(notes[0]?.updatedAt || "unknown"))}`}
            </div>
          )}
        </div>
        <Button
          type="button"
          className={styles["new-entry-btn"]}
          onClick={() => router.push("/notes/form")}
        >
          <PlusIcon className="w-3 h-3" /> New Note
        </Button>

        {/* <button
          onClick={() => router.push("/notes/form")}
          className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm shadow-green-900/10 transition-colors"
        >
          New Note
        </button> */}
      </div>
      <div className={styles["rule"]} />

      {!isLoaded ? (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className={styles["grid"]}>
          {filtered.map((note) => (
            <div
              className={styles["card"]}
              key={note.id}
              style={note.color ? { background: note.color } : undefined}
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              <button
                type="button"
                className={styles["color-dot-trigger"]}
                aria-label="Choose card color"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPickerId(openPickerId === note.id ? null : note.id);
                }}
              />

              {openPickerId === note.id && (
                <div className={styles["color-rail"]} ref={pickerRef}>
                  {PALETTE.map((swatch) => (
                    <button
                      key={swatch.value}
                      type="button"
                      className={styles["color-swatch"]}
                      style={{ background: swatch.value }}
                      aria-label={swatch.name}
                      title={swatch.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNoteColor(note.id, swatch.value);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* <div className={styles["card-bg-image"]} /> */}

              <div className={styles["card-content"]}>
                <h3 className="text-base font-semibold text-stone-800 leading-snug pr-14">
                  {note.title}
                </h3>

                {(note.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-3 mt-1">
                    {(note.tags ?? []).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[#7A6438] text-xs font-medium py-0.5 rounded-md"
                      >
                        <Hash size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="h-[.5px] bg-black/20 my-2 " />
                <p
                  className={`text-sm text-stone-500 leading-relaxed line-clamp-6 ${styles["preview"]}`}
                >
                  {note.content ? stripHtml(note.content) : "--Empty--"}
                </p>

                {/* icon row — sits above meta, right-aligned, fades in on hover */}
                <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/notes/form?id=${note.id}`);
                    }}
                    className="p-1.5 text-stone-400 hover:text-[#7A6438] transition-colors border border-transparent !rounded-lg hover:bg-[#7A6438]/10 hover:border-[#7A6438]/20"
                  >
                    <Pencil size={14} />
                  </button>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteButton
                      id={note.id}
                      endpoint="notes"
                      onSuccess={() =>
                        setNotes((prev) => prev.filter((n) => n.id !== note.id))
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-100"
                    />
                  </div>
                </div>

                <div className={styles["meta"]}>
                  <span>
                    {dateFormatter.format(
                      new Date(note.updatedAt || "unknown"),
                    )}
                  </span>
                  <div className={styles["stamp-badge"]}>
                    {typeof note.wordCount === "number"
                      ? `${note.wordCount} w`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoaded && notes.length === 0 && (
        <div className="text-black/50 text-sm empty-state">No notes yet.</div>
      )}

      {isLoaded && notes.length > 0 && filtered.length === 0 && (
        <div className="flex justify-center text-black/50 text-sm text-align-center">
          No notes match &quot;{query}&quot;.
        </div>
      )}
    </div>
  );
}
