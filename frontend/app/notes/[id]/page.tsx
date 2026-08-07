"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, MotionConfig, Variants } from "framer-motion";
import { ArrowLeft, Hash, List, Maximize2, Minimize2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useNotesRefresh } from "@/lib/note-refresh-context";
import { Note } from "@/types/note";
import styles from "./NoteDetail.module.css";
import Image from "next/image";
import waxSeal from "@/public/assets/wax-seal.png";
import DeleteButton from "@/app/(authentication)/components/Deletebutton";
// ADJUST: match wherever Tiptap.tsx actually lives relative to this file
import type { Editor } from "@tiptap/react";
import Tiptap, {
  TiptapToolbar,
} from "@/app/(authentication)/components/Tiptap";
const PALETTE = [
  { name: "Parchment", value: "#f4f1ea" },
  { name: "Correspondence", value: "#e8ddc7" },
  { name: "Ledger", value: "#e3cba3" },
  { name: "Sage", value: "#d8e0d0" },
  { name: "Dusk Rose", value: "#e6d3d1" },
  { name: "Ink Wash", value: "#d6dde0" },
];

// ---- animation variants ----
const paperVariants: Variants = {
  hidden: { opacity: 0, y: 36, rotate: -2, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: -0.6,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.9,
      when: "beforeChildren",
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const barVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const railVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const { getToken } = useAuth();
  const notesRefresh = useNotesRefresh() as { bump?: () => void };
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState(false);

  const [showFormatting, setShowFormatting] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  // ---- fetch the note ----
  useEffect(() => {
    if (!noteId) return;
    setIsLoaded(false);
    setNotFound(false);

    apiFetch(`/notes/${noteId}`, getToken)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error(`Note request failed: ${r.status}`);
        return r.json() as Promise<Note>;
      })
      .then((data) => {
        if (!data) return;
        isFirstLoad.current = true;
        setNote(data);
        setTitle(data.title ?? "");
        setContent(data.content ?? "");
        setTags(data.tags ?? []);
        setColor(data.color ?? null);
      })
      .catch((e) => {
        console.error(e);
        setNotFound(true);
      })
      .finally(() => setIsLoaded(true));
  }, [noteId, getToken]);

  // ---- debounced autosave ----
  useEffect(() => {
    if (!noteId || !isLoaded || notFound) return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");

    saveTimer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/notes/${noteId}`, getToken, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags, color }),
        });
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        setSaveState("saved");
        notesRefresh.bump?.();
      } catch (e) {
        console.error(e);
        setSaveState("idle");
      }
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, color]);

  const words = useMemo(() => wordCount(content), [content]);

  const addTag = () => {
    const clean = tagDraft.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!isLoaded) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className={styles.emptyState}>
        <p>This entry couldn&apos;t be found.</p>
        <button
          className={styles.backLink}
          onClick={() => router.push("/notes")}
        >
          <ArrowLeft size={14} /> Back to all notes
        </button>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        {/* floating side rail — replaces the bottom action bar from NoteForm */}
        <motion.div
          className={styles.sideRail}
          variants={railVariants}
          initial="hidden"
          animate="visible"
        >
          <button
            type="button"
            className={`${styles.sideRailBtn} ${
              showFormatting ? styles.sideRailBtnActive : ""
            }`}
            onClick={() => setShowFormatting((v) => !v)}
            title="Formatting"
            aria-label="Toggle formatting toolbar"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className={`${styles.sideRailBtn} ${
              focusMode ? styles.sideRailBtnActive : ""
            }`}
            onClick={() => setFocusMode((v) => !v)}
            title="Focus mode"
            aria-label="Toggle focus mode"
          >
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {showFormatting && (
            <div className={styles.formattingFlyout}>
              <TiptapToolbar editor={editorInstance} orientation="vertical" />
            </div>
          )}
        </motion.div>

        {!focusMode && (
          <motion.div
            className={styles.topBar}
            variants={barVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              type="button"
              className={styles.backLink}
              onClick={() => router.push("/notes")}
            >
              <ArrowLeft size={14} /> All Notes
            </button>

            <div className={styles.saveStatus}>
              <span
                className={`${styles.saveDot} ${
                  saveState === "saving" ? styles.saveDotBusy : ""
                }`}
              />
              {saveState === "saving" ? "Saving…" : "Autosaved"}
            </div>
          </motion.div>
        )}

        <motion.div
          className={styles.paperWrap}
          variants={paperVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className={styles.paper}
            style={color ? { background: color } : undefined}
          >
            <div className={styles.paperTone} />
            <div className={styles.ruledLines} />

            <button
              type="button"
              className={styles.colorDotTrigger}
              aria-label="Choose paper color"
              onClick={() => setOpenPicker((v) => !v)}
            />
            {openPicker && (
              <div className={styles.colorRail}>
                {PALETTE.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    className={styles.colorSwatch}
                    style={{ background: swatch.value }}
                    aria-label={swatch.name}
                    title={swatch.name}
                    onClick={() => {
                      setColor(swatch.value);
                      setOpenPicker(false);
                    }}
                  />
                ))}
              </div>
            )}

            <motion.input
              variants={itemVariants}
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of the entry…"
            />

            {!focusMode && (
              <motion.div variants={itemVariants} className={styles.tagsRow}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    <Hash size={10} />
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  className={styles.tagInput}
                  value={tagDraft}
                  placeholder="add a tag…"
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className={styles.divider} />

            <motion.div variants={itemVariants} className={styles.contentArea}>
              <Tiptap
                content={content}
                onChange={setContent}
                onReady={setEditorInstance}
                editorClassName={styles.tiptapEditor}
              />
            </motion.div>

            {!focusMode && (
              <motion.div variants={itemVariants} className={styles.footerBar}>
                <div className={styles.meta}>
                  <span>
                    {dateFormatter.format(
                      new Date(note.updatedAt || Date.now()),
                    )}
                  </span>
                  <div className={styles.stampBadge}>{words} w</div>
                </div>

                <DeleteButton
                  id={note.id}
                  endpoint="notes"
                  redirectTo="/notes"
                  text="Delete"
                />
              </motion.div>
            )}

            <Image
              src={waxSeal}
              alt="Flourish"
              width={100}
              height={100}
              className={styles.flourish}
            />
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
