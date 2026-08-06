'use client'

// app/(account)/profile/page.tsx
//
// Who you are: photo, name, username, email, and when you joined. Session
// management, data, and account deletion live over on /settings — this page
// is identity only.

import { useUser, useReverification } from '@clerk/nextjs'
import React, { useEffect, useRef, useState } from 'react'
import { Camera, Check, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'
import { StatusButton, type ButtonStatus } from '@/app/components/account/StatusButton'


type Status = { type: ButtonStatus; message?: string }

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const updateUser = useReverification((data: Parameters<NonNullable<typeof user>['update']>[0]) =>
    user!.update(data)
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [profileStatus, setProfileStatus] = useState<Status>({ type: 'idle' })

  const [avatarStatus, setAvatarStatus] = useState<ButtonStatus>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setUsername(user.username ?? '')
  }, [user])

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !user) return

    setAvatarStatus('saving')
    try {
      await user.setProfileImage({ file })
      setAvatarStatus('success')
      setTimeout(() => setAvatarStatus('idle'), 1600)
    } catch (err) {
      console.error('Failed to update avatar', err)
      setAvatarStatus('error')
      setTimeout(() => setAvatarStatus('idle'), 1600)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileStatus({ type: 'saving' })
    try {
      await updateUser({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        ...(username ? { username } : {}),
      })

      // Backend derives profile fields from Clerk directly (fetch_clerk_profile
      // in /me) — this call just needs a valid token, no header payload.
      await apiFetch('/me', getToken)

      setProfileStatus({ type: 'success', message: 'Profile updated.' })
      setTimeout(() => setProfileStatus({ type: 'idle' }), 2200)
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not update profile.',
      })
    }
  }

  if (!isLoaded) return null

  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'Y'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Photo */}
      <motion.section
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 flex items-center gap-5"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group shrink-0 w-16 h-16 rounded-full overflow-hidden bg-green-50 border border-stone-200"
          aria-label="Change profile photo"
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-700 font-semibold text-lg">
              {initials}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            <Camera
              size={16}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {avatarStatus === 'saving' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
              />
            </motion.div>
          )}

          {avatarStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="absolute inset-0 flex items-center justify-center bg-green-700/80"
            >
              <Check size={18} className="text-white" />
            </motion.div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="hidden"
        />

        <div>
          <p className="text-sm font-medium text-stone-800">
            {[firstName, lastName].filter(Boolean).join(' ') || 'Your name'}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            {memberSince ? `Member since ${memberSince}` : 'Click your photo to change it'}
          </p>
        </div>
      </motion.section>

      {/* Personal info */}
      <motion.section
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <UserIcon className="w-4 h-4 text-green-700" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Personal info
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
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Username</label>
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
            <StatusButton
              type="submit"
              status={profileStatus.type}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save changes
            </StatusButton>
            {profileStatus.type === 'success' && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-green-700"
              >
                {profileStatus.message}
              </motion.span>
            )}
            {profileStatus.type === 'error' && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-600"
              >
                {profileStatus.message}
              </motion.span>
            )}
          </div>
        </form>
      </motion.section>
    </div>
  )
}