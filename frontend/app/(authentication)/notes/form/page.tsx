import React from 'react'
import NoteForm from './NoteForm'

export async function generateMetadata(
    {
        searchParams,
    }: {
        searchParams: Promise<{ [key: string]: string | undefined }>
    }) {
    const { noteId } = await searchParams
    if (!noteId) return { title: 'New Note' }
    return { title: 'Edit Note' }
}

export default async function page(
    {
        searchParams,
    }: {
        searchParams: Promise<{ id: number }>
    }
) {
    const { id } = await searchParams
    try {
        if (id) {
            const res = await fetch(`http://127.0.0.1:8000/note/${id}`, { cache: 'no-store' })

            if (!res.ok) {
                return (
                    <div>
                        <h2>Note not found</h2>
                    </div>
                )
            }
            const data = await res.json()
            const note = data.note

            return (
                <NoteForm key={id} note={note} />
            )

        }
        return (
            <NoteForm key='new'/>
        )
    } catch (e) {
        if (e instanceof Error) {
            throw e;
        }
    }
}
