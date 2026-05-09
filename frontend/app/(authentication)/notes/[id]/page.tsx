import { Hash, Pencil, ArrowLeft, Clock, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import DeleteButton from '../../components/Deletebutton'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { userId } = await auth()

    if (!userId) notFound()

    const [noteRes, meRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/notes/${id}`, {
            headers: { 'x-user-id': userId },
            cache: 'no-store',
        }),
        fetch(`http://127.0.0.1:8000/me`, {
            headers: { 'x-user-id': userId },
            cache: 'no-store',
        }),
    ])

    if (!noteRes.ok) notFound()

    const note = await noteRes.json()
    const me = meRes.ok ? await meRes.json() : null

    const wordCount = typeof note.wordCount === 'number' ? note.wordCount : 0
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))

    const formattedDate = note.updatedAt
        ? new Date(note.updatedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : ''

    return (
        <div className="min-h-screen bg-[#f7f5f0]">
            <div className="max-w-3xl mx-auto px-8 py-12">

                <Link
                    href="/notes"
                    className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    All notes
                </Link>

                <div className="flex items-center gap-4 mb-6">
                    {me?.role && (
                        <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full">
                            {me.role}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                        <Clock size={11} />
                        {readingMinutes} min read
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-500 text-xs font-medium px-3 py-1.5 rounded-full">
                        <FileText size={11} />
                        {wordCount} words
                    </span>
                    <span className="text-xs text-stone-400 ml-auto">{formattedDate || '—'}</span>
                </div>

                <h1 className="text-3xl font-bold text-stone-800 tracking-tight leading-tight mb-4">
                    {note.title}
                </h1>

                {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {note.tags.map((tag: string, i: number) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-md"
                            >
                                <Hash size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="h-px bg-stone-200 mb-8" />

                <div className="text-stone-600 text-[15px] leading-[1.85] whitespace-pre-wrap">
                    {note.content}
                </div>

                <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                        <Link
                            href="/notes"
                            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                            title="Back to notes"
                        >
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="w-px h-5 bg-stone-200" />

                        <Link
                            href={`/notes/form?id=${id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-medium transition-colors"
                        >
                            <Pencil size={14} />
                            Edit
                        </Link>

                        <DeleteButton
                            id={note.id}
                            endpoint="notes"
                            redirectTo="/notes"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}