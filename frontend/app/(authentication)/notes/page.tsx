import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import React from 'react'

export default function Page() {
  const notes = [...Array(4)].map((_, i) => ({
    id: i,
    title: 'This is a note title',
    date: 'May 6, 2026',
    readTime: '3 min read',
    words: 214,
    content:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam vitae, dolor ratione veritatis eius pariatur! Eos hic asperiores eligendi neque nulla iusto error dolor ut autem culpa.',
    tags: ['react', 'nextjs', 'ui'],
  }))

  return (
    <div>
      <div className="max-w-7xl mx-auto p-10">
        <h2 className="text-3xl font-semibold mt-10 text-green-900">
          All Notes
        </h2>

        <div className="mt-9 grid grid-cols-3 gap-8">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="bg-green-50 border border-green-100 rounded-xl py-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <CardHeader className="px-4 mb-3">
                <CardTitle className="text-lg font-semibold text-green-900">
                  {note.title}
                </CardTitle>

                <div className="flex gap-2 justify-end">
                    <button className="p-1 rounded-md hover:bg-green-100 text-green-700">
                      <Pencil size={16} />
                    </button>
                    <button className="p-1 rounded-md hover:bg-red-100 text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>

                <div className="flex flex-wrap gap-2 text-xs text-green-700 mt-2">
                  <span className="bg-green-100 px-2 py-0.5 rounded-md">
                    {note.date}
                  </span>
                  <span className="bg-green-100 px-2 py-0.5 rounded-md">
                    {note.readTime}
                  </span>
                  <span className="bg-green-100 px-2 py-0.5 rounded-md">
                    {note.words} words
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-0 mb-4">
                <p className="text-sm text-green-800 line-clamp-3 px-4">
                  {note.content}
                </p>
              </CardContent>

              <CardFooter className="py-1 flex flex-wrap gap-2 bg-green-50">
                {note.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 border px-2 py-1 rounded-md text-xs text-gray-500"
                  >
                    <span className=''>{tag}</span>
                    <button className=" hover:text-red-900 text-xs scale-100">
                      ✕
                    </button>
                  </div>
                ))}
                <div>

                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}