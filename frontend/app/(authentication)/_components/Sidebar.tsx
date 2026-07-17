'use client'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import {
  Archive,
  NotepadText,
  PlusIcon,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { DeleteUser } from '../components/DeleteUser'
import { usePathname, useRouter } from 'next/navigation'

type MeProfile = { userId: string; role: string }

const NAV_ITEMS = [
  { href: '/notes', label: 'All Notes', icon: NotepadText },
  { href: '/ai', label: 'Ask AI', icon: Sparkles },
  { href: '/notes', label: 'Trash', icon: Trash2 },
  { href: '/notes', label: 'Archive', icon: Archive },
]

export default function Sidebar() {
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const { user } = useUser()
  const { userId, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!userId || !user) return

    fetch('http://127.0.0.1:8000/me', {
      headers: {
        'x-user-id': userId,
        'x-first-name': user.firstName ?? '',
        'x-last-name': user.lastName ?? '',
        'x-email': user.emailAddresses[0]?.emailAddress ?? '',
      },
    })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
  }, [userId, user])

  const segments = pathname.split('/').filter(Boolean)
  const isEditorPage = segments.length === 2 && segments[0] === 'notes'

  const displayName =
    (user?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ')) || 'Your account'
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div
      className={`
        flex flex-col min-h-full w-72 shrink-0 p-6 transition-all duration-300
        ${isEditorPage
          ? 'bg-transparent shadow-none border-none opacity-50 hover:opacity-100'
          : 'bg-white border-r border-stone-200'}
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white font-serif font-bold text-sm">
          M
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">Mémoire</h1>
      </div>

      <div className="px-2 mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-green-700 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
          Your workspace
          {profile?.role && (
            <span className="normal-case text-stone-400 font-normal tracking-normal">
              · {profile.role}
            </span>
          )}
        </span>
        {profile?.role === 'manager' && (
          <Link
            href="/manager"
            className="block mt-1 text-xs text-stone-500 hover:text-green-700 hover:underline"
          >
            Go to manager workspace →
          </Link>
        )}
      </div>

      {/* Account card */}
      <Link
        href="/settings"
        className="flex items-center gap-3 p-3 mb-6 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-colors"
      >
        <UserButton afterSwitchSessionUrl="/" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">{displayName}</p>
          <p className="text-xs text-stone-500 truncate">{displayEmail}</p>
        </div>
      </Link>

      {/* Primary action */}
      <button
        onClick={() => router.push('/notes/form')}
        className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm shadow-green-900/10 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        New Note
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-800'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="pt-4 mt-4 border-t border-stone-200 flex flex-col gap-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/settings'
              ? 'bg-green-50 text-green-800'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        <div className="px-3 pt-1">
          <DeleteUser
            userId={userId}
            signOut={signOut}
            onDeleted={() => router.push('/')}
          />
        </div>
      </div>
    </div>
  )
}