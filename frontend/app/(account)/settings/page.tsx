'use client'

// app/(account)/settings/page.tsx
//
// Everything that isn't identity: active sessions, the AI index, and
// account deletion. Profile fields moved to /profile.

import { useUser, useAuth } from '@clerk/nextjs'
import React, { useCallback, useEffect, useState } from 'react'
import { Monitor, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import type { SessionWithActivitiesResource } from '@clerk/types'
import { AnimatePresence, motion, type Variants } from 'framer-motion'

// NOTE: adjust this import path to match where DeleteUser actually lives
// in your project (it now reads userId / getToken / signOut from
// useAuth() internally, so it no longer needs those as props).
import { DeleteUser } from '@/app/(authentication)/components/DeleteUser'
import { StatusButton, type ButtonStatus } from '@/app/components/account/StatusButton'

type Status = { type: ButtonStatus; message?: string }

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function SettingsPage() {
  const { user } = useUser()
  const { userId, sessionId, getToken } = useAuth()
  const router = useRouter()

  const [reindexStatus, setReindexStatus] = useState<Status>({ type: 'idle' })

  const [sessions, setSessions] = useState<SessionWithActivitiesResource[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  async function handleRevoke(session: SessionWithActivitiesResource) {
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

  async function handleReindex() {
    if (!userId) return
    setReindexStatus({ type: 'saving' })
    try {
      const res = await apiFetch('/ai/reindex', getToken, { method: 'POST' })
      if (!res.ok) throw new Error(`Reindex failed (${res.status})`)
      const data = await res.json()
      setReindexStatus({ type: 'success', message: `Indexed ${data.indexed} note(s).` })
      setTimeout(() => setReindexStatus({ type: 'idle' }), 2400)
    } catch (err) {
      setReindexStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Reindex failed.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sessions / devices */}
      <motion.section
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-green-700" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Sessions
            </h3>
          </div>
          <AnimatePresence>
            {sessions.length > 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSignOutOtherDevices}
                disabled={revokingId === 'all'}
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {revokingId === 'all' ? 'Signing out…' : 'Sign out of all other devices'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {sessionsLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                className="h-10 rounded-lg bg-stone-100"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-stone-400">No active sessions found.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-stone-100">
            <AnimatePresence initial={false}>
              {sessions.map((session, i) => {
                const activity = session.latestActivity
                const isCurrent = session.id === sessionId
                return (
                  <motion.li
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between py-3"
                  >
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
                        {[activity?.city, activity?.country].filter(Boolean).join(', ') ||
                          'Unknown location'}
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
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </motion.section>

      {/* Notes data / AI index */}
      <motion.section
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6"
      >
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
              aren&aspos;t showing up in &quot;Ask AI&quot; results, or after bulk edits.
            </p>
          </div>
          <StatusButton
            status={reindexStatus.type}
            onClick={handleReindex}
            className="flex items-center gap-2 shrink-0 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Reindex
          </StatusButton>
        </div>
        <AnimatePresence>
          {reindexStatus.type === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-xs text-green-700"
            >
              {reindexStatus.message}
            </motion.p>
          )}
          {reindexStatus.type === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-xs text-red-600"
            >
              {reindexStatus.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Danger zone */}
      <motion.section
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-red-100 p-6"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-red-500 mb-4">
          Danger zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-800">Delete account</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Permanently deletes your account and all your notes. This can&aspos;t be undone.
            </p>
          </div>
          <DeleteUser onDeleted={() => router.push('/')} />
        </div>
      </motion.section>
    </div>
  )
}