'use client'

import { Note } from '@/types/note'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

type NoteFormValues = {
    title: string
    content: string
    tags: string[]
}

export default function NoteForm({ note }: { note?: Note }) {
    const isEditing = !!note
    const router = useRouter()
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
        const url = isEditing
            ? `http://127.0.0.1:8000/note/${note.id}`
            : `http://127.0.0.1:8000/note`

        const res = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })

        if (res.ok) {
            router.push('/notes')
            router.refresh()
        }
    }

    return (
        <div className="w-4xl mx-auto py-20">
            <h2 className="text-3xl font-semibold text-green-900 mb-8">
                {isEditing ? 'Edit Note' : 'New Note'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Title"
                    className="border border-green-200 rounded-lg px-4 py-2 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}

                <textarea
                    {...register('content', { required: 'Content is required' })}
                    placeholder="Write your note..."
                    rows={8}
                    className="border border-green-200 rounded-lg px-4 py-2 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                />
                {errors.content && (
                    <p className="text-red-500 text-sm">{errors.content.message}</p>
                )}

                <div className="flex gap-2">
                    <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add a tag"
                        className="border border-green-200 rounded-lg px-4 py-2 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300 flex-1"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                    >
                        Add
                    </button>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 border px-2 py-1 rounded-md text-xs text-gray-500"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Note'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg hover:bg-green-100"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}