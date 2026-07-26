'use client'

import { useUser, useAuth, useReverification } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import {
  ArrowLeft, Check, Loader2, Monitor, RefreshCw, User as UserIcon,
} from 'lucide-react'
import { DeleteUser } from '../(authentication)/components/DeleteUser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import type { SessionWithActivities } from '@clerk/types'
import { SignOutMenu } from '../(authentication)/_components/SignOutMenu'

type Status = { type: 'idle' | 'saving' | 'success' | 'error'; message?: string }

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { userId, sessionId, getToken, signOut } = useAuth()
  const router = useRouter()

  // NEW: wraps user.update() so Clerk automatically shows a verification
  // modal (e.g. email code) when it decides this update needs fresh
  // credentials, then retries the update once the person verifies.
  const updateUser = useReverification((data: Parameters<NonNullable<typeof user>['update']>[0]) =>
    user!.update(data)
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [profileStatus, setProfileStatus] = useState<Status>({ type: 'idle' })

  const [reindexStatus, setReindexStatus] = useState<Status>({ type: 'idle' })

  // NEW: sessions list
  const [sessions, setSessions] = useState<SessionWithActivities[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setUsername(user.username ?? '')
  }, [user])

  // NEW: load sessions once the user object is ready
  useEffect(() => {
    if (!user) return
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function loadSessions() {
    if (!user) return
    setSessionsLoading(true)
    try {
      const list = await user.getSessions()
      setSessions(list)
    } catch (err) {
      console.error('Failed to load sessions', err)
    } finally {
      setSessionsLoading(false)
    }
  }

  async function handleRevoke(session: SessionWithActivities) {
    setRevokingId(session.id)
    try {
      await session.revoke()
      setSessions((prev) => prev.filter((s) => s.id !== session.id))
    } catch (err) {
      console.error('Failed to revoke session', err)
    } finally {
      setRevokingId(null)
    }
  }

  async function handleSignOutOtherDevices() {
    const others = sessions.filter((s) => s.id !== sessionId)
    if (others.length === 0) return

    setRevokingId('all')
    try {
      await Promise.all(others.map((s) => s.revoke()))
      setSessions((prev) => prev.filter((s) => s.id === sessionId))
    } catch (err) {
      console.error('Failed to sign out other devices', err)
    } finally {
      setRevokingId(null)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileStatus({ type: 'saving' })
    try {
      // CHANGED: was user.update(...) directly. Now goes through
      // useReverification(), which shows Clerk's verification modal if
      // the session needs fresh credentials, then retries automatically.
      await updateUser({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        ...(username ? { username } : {}),
      })

      // CHANGED: was fetch with x-user-id / x-first-name / x-last-name / x-email
      // headers. Your backend now derives profile fields from Clerk's API via
      // fetch_clerk_profile() (see /me), so this call just needs a valid
      // token — no profile fields need to travel as headers anymore.
      await apiFetch('/me', getToken)

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
      // CHANGED: was fetch with headers: { 'x-user-id': userId }
      const res = await apiFetch('/ai/reindex', getToken, { method: 'POST' })
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
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-6 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All notes
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-stone-800 tracking-tight">Settings</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Manage your profile, sessions, and notes data.
              </p>
            </div>
            <SignOutMenu />
          </div>
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

          {/* NEW: Sessions / devices */}
          <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-700" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Sessions
                </h3>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={handleSignOutOtherDevices}
                  disabled={revokingId === 'all'}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {revokingId === 'all' ? 'Signing out…' : 'Sign out of all other devices'}
                </button>
              )}
            </div>

            {sessionsLoading ? (
              <p className="text-sm text-stone-400">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-stone-400">No active sessions found.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-stone-100">
                {sessions.map((session) => {
                  const activity = session.latestActivity
                  const isCurrent = session.id === sessionId
                  return (
                    <li key={session.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-stone-800 flex items-center gap-2">
                          {activity?.browserName ?? 'Unknown browser'}
                          {activity?.deviceType ? ` · ${activity.deviceType}` : ''}
                          {isCurrent && (
                            <span className="text-[10px] font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              This device
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {[activity?.city, activity?.country].filter(Boolean).join(', ') || 'Unknown location'}
                          {session.lastActiveAt
                            ? ` · Last active ${new Date(session.lastActiveAt).toLocaleString()}`
                            : ''}
                        </p>
                      </div>
                      {!isCurrent && (
                        <button
                          onClick={() => handleRevoke(session)}
                          disabled={revokingId === session.id}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 shrink-0"
                        >
                          {revokingId === session.id ? 'Signing out…' : 'Sign out'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
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
              {/* CHANGED: DeleteUser now pulls userId/getToken/signOut from
                  useAuth() internally — no longer takes them as props. */}
              <DeleteUser onDeleted={() => router.push('/')} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}