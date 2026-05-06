'use client'

import { Note } from "@/types/note";
import { useEffect, useState } from "react";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setNotes(data.notes))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);


  console.log('notes are:- ', notes);


  return (
    <div>
      <h1 className="uppercase">Memoire</h1>
      <main>
        <h1>User List</h1>

        <ul>
          {notes.map((note, index) => (
            <li key={note.id ?? index}>{note.title}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
