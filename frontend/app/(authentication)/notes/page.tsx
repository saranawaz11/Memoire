'use client'

import { Note } from '@/types/note'
import { Pencil, Hash, Sparkles, LayoutGrid, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DeleteButton from '../components/Deletebutton'
import { useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { formatNoteDate } from '@/lib/helpers'
import { apiFetch } from '@/lib/api'

type MeProfile = { userId: string; role: string }

// Notes are stored as rich-text HTML from the editor. Card previews should
// show plain text, not raw markup — full HTML rendering still belongs on
// the /notes/[id] page.
function stripHtml(raw: string): string {
  if (!raw) return ''
  const withoutTags = raw.replace(/<[^>]+>/g, ' ')
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
  if (textarea) {
    textarea.innerHTML = withoutTags
    return textarea.value.replace(/\s+/g, ' ').trim()
  }
  return withoutTags.replace(/\s+/g, ' ').trim()
}

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([])
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  // CHANGED: pull getToken from useAuth() instead of manually building headers
  const { userId, getToken, signOut } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (!userId || !user) return

    // CHANGED: was fetch('http://127.0.0.1:8000/me', { headers: { x-user-id, ... } })
    apiFetch('/me', getToken)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
  }, [userId, user])

  useEffect(() => {
    if (!userId) return

    // CHANGED: was fetch('http://127.0.0.1:8000/notes/', { headers: { 'x-user-id': userId } })
    apiFetch('/notes/', getToken)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Notes request failed: ${r.status}`)
        return r.json() as Promise<Note[]>
      })
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e)
        setNotes([])
      })
  }, [userId])

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="max-w-6xl mx-auto px-8 py-12">

        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold text-stone-800 tracking-tight">
              Gallrey View
            </h2>
            <p className="text-sm text-neutral-500">Visual curation of your creative flow</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai"
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Sparkles size={15} />
              Ask AI
            </Link>

            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-stone-200">
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-stone-100 text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-stone-100 text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="group relative bg-white rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-all duration-200"
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
                      endpoint="notes"
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
                    {stripHtml(note.content)}
                  </p>
                )}

                {(note.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(note.tags ?? []).map((tag, i) => (
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
                    {note.updatedAt ? formatNoteDate(note.updatedAt) : '—'}
                  </span>
                  <span className="text-stone-200">·</span>
                  <span className="text-xs text-stone-400">
                    {typeof note.wordCount === 'number' ? `${note.wordCount} words` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-stone-200 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push(`/notes/${note.id}`)}
                className="group relative flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-800 truncate">
                      {note.title}
                    </h3>
                    {(note.tags ?? []).slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="hidden sm:inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
                      >
                        <Hash size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {note.content && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {stripHtml(note.content)}
                    </p>
                  )}
                </div>

                <span className="text-xs text-stone-400 whitespace-nowrap">
                  {note.updatedAt ? formatNoteDate(note.updatedAt) : '—'}
                </span>
                <span className="text-xs text-stone-400 whitespace-nowrap hidden sm:inline">
                  {typeof note.wordCount === 'number' ? `${note.wordCount} words` : '—'}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/notes/form?id=${note.id}`) }}
                    className="p-1.5 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-700 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteButton
                      id={note.id}
                      endpoint="notes"
                      onSuccess={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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


// 'use client'

// import { Note } from '@/types/note'
// import { Pencil, Hash, Sparkles, LayoutGrid, List } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import React, { useEffect, useState } from 'react'
// import DeleteButton from '../components/Deletebutton'
// import { useAuth, useUser } from '@clerk/nextjs'
// import Link from 'next/link'
// import { formatNoteDate } from '@/lib/helpers'

// type MeProfile = { userId: string; role: string }

// // Notes are stored as rich-text HTML from the editor. Card previews should
// // show plain text, not raw markup — full HTML rendering still belongs on
// // the /notes/[id] page.
// function stripHtml(raw: string): string {
//   if (!raw) return ''
//   const withoutTags = raw.replace(/<[^>]+>/g, ' ')
//   const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
//   if (textarea) {
//     textarea.innerHTML = withoutTags
//     return textarea.value.replace(/\s+/g, ' ').trim()
//   }
//   return withoutTags.replace(/\s+/g, ' ').trim()
// }

// export default function Page() {
//   const [notes, setNotes] = useState<Note[]>([])
//   const [profile, setProfile] = useState<MeProfile | null>(null)
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const router = useRouter()
//   const { userId, signOut } = useAuth()
//   const { user } = useUser()

//   useEffect(() => {
//     if (!userId || !user) return

//     fetch('http://127.0.0.1:8000/me', {
//       headers: {
//         'x-user-id': userId,
//         'x-first-name': user.firstName ?? '',
//         'x-last-name': user.lastName ?? '',
//         'x-email': user.emailAddresses[0]?.emailAddress ?? '',
//       },
//     })
//       .then(async (r) => (r.ok ? r.json() : null))
//       .then((data) => setProfile(data))
//       .catch(() => setProfile(null))
//   }, [userId, user])

//   useEffect(() => {
//     if (!userId) return

//     fetch('http://127.0.0.1:8000/notes/', {
//       headers: { 'x-user-id': userId },
//     })
//       .then(async (r) => {
//         if (!r.ok) throw new Error(`Notes request failed: ${r.status}`)
//         return r.json() as Promise<Note[]>
//       })
//       .then((data) => setNotes(Array.isArray(data) ? data : []))
//       .catch((e) => {
//         console.error(e)
//         setNotes([])
//       })
//   }, [userId])

//   return (
//     <div className="min-h-screen bg-[#f7f5f0]">
//       <div className="max-w-6xl mx-auto px-8 py-12">

//         <div className="flex items-end justify-between mb-10">
//           <div>
//             <h2 className="text-4xl font-bold text-stone-800 tracking-tight">
//               Gallrey View
//             </h2>
//             <p className="text-sm text-neutral-500">Visual curation of your creative flow</p>
//           </div>

//           <div className="flex items-center gap-3">
//             <Link
//               href="/ai"
//               className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
//             >
//               <Sparkles size={15} />
//               Ask AI
//             </Link>

//             <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-stone-200">
//               <button
//                 onClick={() => setViewMode('list')}
//                 aria-label="List view"
//                 className={`p-1.5 rounded-md transition-colors ${
//                   viewMode === 'list'
//                     ? 'bg-stone-100 text-stone-800'
//                     : 'text-stone-400 hover:text-stone-600'
//                 }`}
//               >
//                 <List className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('grid')}
//                 aria-label="Grid view"
//                 className={`p-1.5 rounded-md transition-colors ${
//                   viewMode === 'grid'
//                     ? 'bg-stone-100 text-stone-800'
//                     : 'text-stone-400 hover:text-stone-600'
//                 }`}
//               >
//                 <LayoutGrid className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {viewMode === 'grid' ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {notes.map((note) => (
//               <div
//                 key={note.id}
//                 onClick={() => router.push(`/notes/${note.id}`)}
//                 className="group relative bg-white rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-all duration-200"
//               >
//                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button
//                     onClick={(e) => { e.stopPropagation(); router.push(`/notes/form?id=${note.id}`) }}
//                     className="p-1.5 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-700 transition-colors"
//                   >
//                     <Pencil size={14} />
//                   </button>

//                   <div onClick={(e) => e.stopPropagation()}>
//                     <DeleteButton
//                       id={note.id}
//                       endpoint="notes"
//                       onSuccess={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
//                       className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
//                     />
//                   </div>
//                 </div>

//                 <h3 className="text-base font-semibold text-stone-800 leading-snug pr-14">
//                   {note.title}
//                 </h3>

//                 {note.content && (
//                   <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
//                     {stripHtml(note.content)}
//                   </p>
//                 )}

//                 {(note.tags?.length ?? 0) > 0 && (
//                   <div className="flex flex-wrap gap-1.5">
//                     {(note.tags ?? []).map((tag, i) => (
//                       <span
//                         key={i}
//                         className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md"
//                       >
//                         <Hash size={10} />
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 <div className="flex items-center gap-2 mt-auto pt-2 border-t border-stone-100">
//                   <span className="text-xs text-stone-400">
//                     {note.updatedAt ? formatNoteDate(note.updatedAt) : '—'}
//                   </span>
//                   <span className="text-stone-200">·</span>
//                   <span className="text-xs text-stone-400">
//                     {typeof note.wordCount === 'number' ? `${note.wordCount} words` : '—'}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col divide-y divide-stone-200 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
//             {notes.map((note) => (
//               <div
//                 key={note.id}
//                 onClick={() => router.push(`/notes/${note.id}`)}
//                 className="group relative flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
//               >
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2">
//                     <h3 className="text-sm font-semibold text-stone-800 truncate">
//                       {note.title}
//                     </h3>
//                     {(note.tags ?? []).slice(0, 3).map((tag, i) => (
//                       <span
//                         key={i}
//                         className="hidden sm:inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
//                       >
//                         <Hash size={10} />
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                   {note.content && (
//                     <p className="text-xs text-stone-500 truncate mt-0.5">
//                       {stripHtml(note.content)}
//                     </p>
//                   )}
//                 </div>

//                 <span className="text-xs text-stone-400 whitespace-nowrap">
//                   {note.updatedAt ? formatNoteDate(note.updatedAt) : '—'}
//                 </span>
//                 <span className="text-xs text-stone-400 whitespace-nowrap hidden sm:inline">
//                   {typeof note.wordCount === 'number' ? `${note.wordCount} words` : '—'}
//                 </span>

//                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button
//                     onClick={(e) => { e.stopPropagation(); router.push(`/notes/form?id=${note.id}`) }}
//                     className="p-1.5 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-700 transition-colors"
//                   >
//                     <Pencil size={14} />
//                   </button>
//                   <div onClick={(e) => e.stopPropagation()}>
//                     <DeleteButton
//                       id={note.id}
//                       endpoint="notes"
//                       onSuccess={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
//                       className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {notes.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-24 text-center">
//             <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
//               <span className="text-2xl">📝</span>
//             </div>
//             <p className="text-stone-500 text-sm">No notes yet. Create your first one.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }