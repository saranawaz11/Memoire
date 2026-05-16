'use client'
import Link from 'next/link'
import { ArrowRight, FileText, Tag, Clock, Search, Sparkles } from 'lucide-react'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <div className="min-h-screen bg-[#f7f5f0] overflow-x-hidden">

      <nav className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-widest text-stone-800 uppercase">
          Memoiré
        </span>
        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <>

              <SignInButton>
                <Button size="lg" className='bg-green-700 hover:bg-green-800 hover:text-white'>Sign-in</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="ghost" size="lg">Get started</Button>
              </SignUpButton>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              <Button variant={'outline'} size="lg" asChild className='bg-green-700 hover:bg-green-800 text-white hover:text-white'>
                <Link href="/notes">
                  My notes
                </Link>
              </Button>
              <UserButton afterSwitchSessionUrl="/" />
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Sparkles size={11} />
          Simple. Focused. Yours.
        </div>

        <h1 className="text-6xl font-bold text-stone-800 tracking-tight leading-[1.1] mb-6">
          A quieter place
          <br />
          <span className="text-green-700">to think.</span>
        </h1>

        <p className="text-lg text-stone-500 leading-relaxed max-w-xl mx-auto mb-10">
          Memoiré is a calm, distraction-free space to capture your thoughts, ideas, and notes — organized just the way you like.
        </p>

        <div className="flex items-center justify-center gap-3">
          {isLoaded && !isSignedIn && (
            <>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Start writing for free
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/sign-in"
                className="text-sm text-stone-500 hover:text-stone-700 px-6 py-3 transition-colors"
              >
                Already have an account →
              </Link>
            </>
          )}

        </div>
      </section>

      {/* Fake UI preview */}
      <section className="max-w-4xl mx-auto px-8 mb-28">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-[0_20px_60px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
            <div className="w-3 h-3 rounded-full bg-stone-200" />
            <div className="w-3 h-3 rounded-full bg-stone-200" />
            <div className="w-3 h-3 rounded-full bg-stone-200" />
            <span className="ml-3 text-xs text-stone-400 font-mono">memoiré.app/notes</span>
          </div>
          {/* fake notes grid */}
          <div className="p-6 grid grid-cols-3 gap-3">
            {[
              { title: 'Morning thoughts', content: 'Woke up thinking about the project structure and how to simplify the auth flow...', tags: ['personal', 'dev'], words: 42, updatedAt: 'May 08' },
              { title: 'Book notes — Atomic Habits', content: 'Identity-based habits. You don\'t rise to the level of your goals, you fall to the level of your systems...', tags: ['reading'], words: 78, updatedAt: 'April 21' },
              { title: 'Sprint planning', content: 'Focus on note view page, then authentication, then customer module. Keep scope tight.', tags: ['work'], words: 31, updatedAt: 'April 13' },
            ].map((note, i) => (
              <div key={i} className="bg-[#f7f5f0] rounded-xl p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold text-stone-800">{note.title}</p>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{note.content}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-stone-200">
                  <span className="text-[10px] text-stone-400">{note.updatedAt}</span>
                  <span className="text-[10px] text-stone-400">{note.words} words</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-8 mb-28">
        <p className="text-xs font-medium tracking-widest text-green-600 uppercase text-center mb-12">
          Everything you need, nothing you dont
        </p>

        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: 'Clean writing experience',
              desc: 'No toolbars, no clutter. Just you and your words on a calm, distraction-free canvas.',
            },
            {
              icon: Tag,
              title: 'Tags to stay organised',
              desc: 'Add tags to any note and filter your workspace instantly. Find anything in seconds.',
            },
            {
              icon: Clock,
              title: 'Reading time estimates',
              desc: 'Every note shows a reading time so you always know how long a thought really is.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-stone-100">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={16} className="text-green-700" />
              </div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 mb-24">
        <div className="bg-green-700 rounded-3xl px-12 py-16 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
            Ready to start writing?
          </h2>
          <p className="text-green-200 text-sm mb-8 max-w-sm mx-auto">
            Join others who use Memoiré to capture their best thinking every day.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-green-800 hover:bg-green-50 text-sm font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Create your free account
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-8 border-t border-stone-200 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Memoiré</span>
        <p className="text-xs text-stone-400">Built with Next.js & FastAPI</p>
      </footer>

    </div>
  )
}