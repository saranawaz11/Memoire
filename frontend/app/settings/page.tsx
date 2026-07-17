'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { Check, Loader2, Moon, RefreshCw, Sun, User as UserIcon } from 'lucide-react'
import { DeleteUser } from '../(authentication)/components/DeleteUser'
import { useRouter } from 'next/navigation'

const API_URL = 'http://127.0.0.1:8000'

type Status = { type: 'idle' | 'saving' | 'success' | 'error'; message?: string }

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { userId, signOut } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [profileStatus, setProfileStatus] = useState<Status>({ type: 'idle' })

  const [darkMode, setDarkMode] = useState(false);
  const [reindexStatus, setReindexStatus] = useState<Status>({ type: 'idle' })

  // Populate fields once Clerk's user object is available
  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setUsername(user.username ?? '')
  }, [user])

  // Cosmetic theme toggle, persisted locally. Note: actually re-skinning the
  // app for dark mode requires `darkMode: 'class'` in tailwind.config plus
  // dark: variants across components — this wires up the toggle + persistence,
  // the rest is a separate styling pass.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('memoire-theme') : null
    const isDark = stored === 'dark'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('memoire-theme', next ? 'dark' : 'light')
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileStatus({ type: 'saving' })
    try {
      await user.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        ...(username ? { username } : {}),
      })

      // Sync backend AppUser immediately (it normally syncs lazily on /me)
      if (userId) {
        await fetch(`${API_URL}/me`, {
          headers: {
            'x-user-id': userId,
            'x-first-name': firstName,
            'x-last-name': lastName,
            'x-email': user.primaryEmailAddress?.emailAddress ?? '',
          },
        })
      }

      setProfileStatus({ type: 'success', message: 'Profile updated.' })
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not update profile.',
      })
    }
  }

  async function handleReindex() {
    if (!userId) return
    setReindexStatus({ type: 'saving' })
    try {
      const res = await fetch(`${API_URL}/ai/reindex`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
      })
      if (!res.ok) throw new Error(`Reindex failed (${res.status})`)
      const data = await res.json()
      setReindexStatus({ type: 'success', message: `Indexed ${data.indexed} note(s).` })
    } catch (err) {
      setReindexStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Reindex failed.',
      })
    }
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <header className="mb-10">
          <h2 className="text-4xl font-bold text-stone-800 tracking-tight">Settings</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your profile, appearance, and notes data.
          </p>
        </header>

        <div className="flex flex-col gap-6">

          {/* Profile */}
          <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <UserIcon className="w-4 h-4 text-green-700" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Profile
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Not set"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Only applies if usernames are enabled for this app in Clerk.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Email</label>
                <input
                  value={user?.primaryEmailAddress?.emailAddress ?? ''}
                  disabled
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Managed through your account provider — use the avatar menu to change it.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={profileStatus.type === 'saving'}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {profileStatus.type === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save changes
                </button>
                {profileStatus.type === 'success' && (
                  <span className="flex items-center gap-1 text-xs text-green-700">
                    <Check className="w-3.5 h-3.5" /> {profileStatus.message}
                  </span>
                )}
                {profileStatus.type === 'error' && (
                  <span className="text-xs text-red-600">{profileStatus.message}</span>
                )}
              </div>
            </form>
          </section>

          {/* Appearance */}
          <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-2 mb-5">
              {darkMode ? (
                <Moon className="w-4 h-4 text-green-700" />
              ) : (
                <Sun className="w-4 h-4 text-green-700" />
              )}
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Appearance
              </h3>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-800">Dark mode</p>
                <p className="text-xs text-stone-400 mt-0.5">Easier on the eyes at night.</p>
              </div>
              <button
                onClick={toggleDarkMode}
                aria-pressed={darkMode}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-green-700' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    darkMode ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Notes data / AI index */}
          <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <RefreshCw className="w-4 h-4 text-green-700" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Notes &amp; AI
              </h3>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-800">Reindex your notes</p>
                <p className="text-xs text-stone-400 mt-0.5 max-w-sm">
                  Rebuilds AI search embeddings for all your notes. Run this if older notes
                  aren't showing up in "Ask AI" results, or after bulk edits.
                </p>
              </div>
              <button
                onClick={handleReindex}
                disabled={reindexStatus.type === 'saving'}
                className="flex items-center gap-2 shrink-0 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {reindexStatus.type === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                Reindex
              </button>
            </div>
            {reindexStatus.type === 'success' && (
              <p className="mt-3 flex items-center gap-1 text-xs text-green-700">
                <Check className="w-3.5 h-3.5" /> {reindexStatus.message}
              </p>
            )}
            {reindexStatus.type === 'error' && (
              <p className="mt-3 text-xs text-red-600">{reindexStatus.message}</p>
            )}
          </section>

          {/* Danger zone */}
          <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-red-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-red-500 mb-4">
              Danger zone
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-800">Delete account</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Permanently deletes your account and all your notes. This can't be undone.
                </p>
              </div>
              <DeleteUser
                userId={userId}
                signOut={signOut}
                onDeleted={() => router.push('/')}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}