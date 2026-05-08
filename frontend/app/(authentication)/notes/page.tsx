'use client'

import { Note } from '@/types/note'
import { Pencil, Trash2, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DeleteButton from '../components/Deletebutton'

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then((r) => r.json())
      .then((data) => setNotes(data.notes))
      .catch((e) => console.error(e))
  }, [])

  // const handleDelete = async (e: React.MouseEvent, id: number) => {
  //   e.stopPropagation()
  //   await fetch(`http://127.0.0.1:8000/note/${id}`, { method: 'DELETE' })
  //   setNotes((prev) => prev.filter((n) => n.id !== id))
  // }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="max-w-6xl mx-auto px-8 py-12">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-medium tracking-widest text-green-600 uppercase mb-1">
              Your workspace
            </p>
            <h1 className="text-4xl font-bold text-stone-800 tracking-tight">
              Notes
            </h1>
          </div>
          <button
            onClick={() => router.push('/notes/form')}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span> New note
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="group relative bg-white rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-green-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-200"
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/notes/form?id=${note.id}`) }}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-700 transition-colors"
                >
                  <Pencil size={14} />
                </button>

                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteButton
                    id={note.id}
                    endpoint="note"
                    onSuccess={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                  />
                </div>
              </div>

              <h3 className="text-base font-semibold text-stone-800 leading-snug pr-14">
                {note.title}
              </h3>

              {note.content && (
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
                  {note.content}
                </p>
              )}

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md"
                    >
                      <Hash size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-400">
                  {new Date(note.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  })}
                </span>
                <span className="text-stone-200">·</span>
                <span className="text-xs text-stone-400">{note.wordCount} words</span>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-stone-500 text-sm">No notes yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  )
}