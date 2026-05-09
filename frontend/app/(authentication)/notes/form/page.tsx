import React from 'react'
import NoteForm from './NoteForm'
import { auth } from '@clerk/nextjs/server'

export async function generateMetadata(
    {
        searchParams,
    }: {
        searchParams: Promise<{ [key: string]: string | undefined }>
    }) {
    const { id } = await searchParams
    if (!id) return { title: 'New Note' }
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
    const { userId } = await auth()
    try {
        if (!userId) {
            return (
                <div>
                    <h2>Unauthorized</h2>
                </div>
            )
        }

        if (id) {
            const res = await fetch(`http://127.0.0.1:8000/notes/${id}`, {
                cache: 'no-store',
                headers: { 'x-user-id': userId },
            })

            if (!res.ok) {
                return (
                    <div>
                        <h2>Note not found</h2>
                    </div>
                )
            }
            const note = await res.json()

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
