'use client'

import { Note } from '@/types/note'
import { ArrowLeft, Hash, Plus, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type NoteFormValues = {
    title: string
    content: string
    tags: string[]
}

export default function NoteForm({ note }: { note?: Note }) {
    const isEditing = !!note
    const router = useRouter()
    const { userId } = useAuth()
    const [tagInput, setTagInput] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<NoteFormValues>({
        defaultValues: {
            title: note?.title ?? '',
            content: note?.content ?? '',
            tags: note?.tags ?? [],
        },
    })

    const tags = watch('tags')

    const addTag = () => {
        const trimmed = tagInput.trim()
        if (trimmed && !tags.includes(trimmed)) {
            setValue('tags', [...tags, trimmed])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        setValue('tags', tags.filter((t) => t !== tag))
    }

    const onSubmit = async (values: NoteFormValues) => {
        if (!userId) {
            toast.error('You must be signed in')
            return
        }

        const url = isEditing
            ? `http://127.0.0.1:8000/notes/${note!.id}`
            : `http://127.0.0.1:8000/notes/`

        try {
            const res = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                },
                body: JSON.stringify(values),
            })

            if (res.ok) {
                const data = await res.json()
                const redirectId = isEditing ? note!.id : data.id
                toast.success(isEditing ? 'Note updated' : 'Note created')
                router.push(`/notes/${redirectId}`)
                router.refresh()
            } else {
                toast.error('Failed to save note')
            }
        } catch (error) {
            console.error(error)
            toast.error('Network error while saving note')
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f5f0]">
            <div className="max-w-3xl mx-auto px-8 py-12 pb-32">

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    {isEditing ? 'Back to note' : 'All notes'}
                </button>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <p className="text-xs font-medium tracking-widest text-green-600 uppercase mb-3">
                        {isEditing ? 'Editing' : 'New note'}
                    </p>

                    <input
                        {...register('title', { required: 'Title is required' })}
                        placeholder="Untitled"
                        className="w-full text-3xl font-bold text-stone-800 tracking-tight leading-tight bg-transparent border-none outline-none placeholder:text-stone-300 mb-2"
                    />
                    {errors.title && (
                        <p className="text-red-400 text-xs mb-3">{errors.title.message}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-md"
                            >
                                <Hash size={10} />
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-0.5 hover:text-red-500 transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}

                        <div className="inline-flex items-center gap-1 border border-dashed border-stone-300 text-xs text-stone-400 px-2.5 py-1 rounded-md focus-within:border-green-400 focus-within:text-green-700 transition-colors">
                            <Hash size={10} />
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); addTag() }
                                }}
                                placeholder="add tag"
                                className="bg-transparent outline-none w-16 placeholder:text-stone-300"
                            />
                            <button type="button" onClick={addTag}>
                                <Plus size={10} />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-stone-200 mb-8" />

                    <textarea
                        {...register('content', { required: 'Content is required' })}
                        placeholder="Start writing..."
                        rows={16}
                        className="w-full text-stone-600 text-[15px] leading-[1.85] bg-transparent border-none outline-none resize-none placeholder:text-stone-300"
                    />
                    {errors.content && (
                        <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>
                    )}

                </form>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                        title="Cancel"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="w-px h-5 bg-stone-200" />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create note'}
                    </button>
                </div>
            </div>
        </div>
    )
}