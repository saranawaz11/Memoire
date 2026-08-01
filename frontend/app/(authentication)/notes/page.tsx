"use client";

import { useSearch } from "@/lib/search-context";

const notes = [
  { title: "How Long", preview: "— untitled entry —", date: "Jul 29 · 12:22 pm", words: 0 },
  { title: "My Shopping List", preview: "shampoo, soap, makeup", date: "Jul 29 · 12:19 pm", words: 3 },
  { title: "Cars", preview: "— untitled entry —", date: "Jul 29 · 12:11 pm", words: 0 },
  { title: "Jasmine Flower", preview: "— untitled entry —", date: "Jul 29 · 12:10 pm", words: 0 },
  { title: "Flower", preview: "— untitled entry —", date: "Jul 27 · 10:50 am", words: 0 },
];

export default function Page() {
  const { query } = useSearch();

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.preview.toLowerCase().includes(query.toLowerCase())
  );

  const handleNewNote = () => console.log("create new note");

  return (
    <div className="main">
      <div className="main-head">
        <div>
          <h2>All Notes</h2>
          <div className="sub">
            {filtered.length} notes
            {query ? ` · matching "${query}"` : ` · last edited ${notes[0].date}`}
          </div>
        </div>
      </div>

      <div className="grid">
        <button type="button" className="card add-card" onClick={handleNewNote}>
          <span className="plus">+</span>
          New Note
        </button>

        {filtered.map((note) => (
          <div className="card" key={note.title}>
            <h3>{note.title}</h3>
            <div className="preview">{note.preview}</div>
            <div className="meta">
              <span>{note.date}</span>
              <div className="stamp-badge">{note.words}w</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">No notes match &quote;{query}&quote;.</div>
      )}
    </div>
  );
}