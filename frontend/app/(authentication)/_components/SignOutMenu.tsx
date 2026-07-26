'use client'

import { LogOut } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function SignOutMenu() {
  const { signOut, sessionId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState<'this' | 'all' | null>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false
  }

  async function signOutThisDevice() {
    setLoading('this')
    closeMenu()
    try {
      // Clerk's default signOut() only ends the session on this device/browser.
      await signOut()
      router.push('/')
    } finally {
      setLoading(null)
    }
  }

  async function signOutAllDevices() {
    if (!user) return
    setLoading('all')
    closeMenu()
    try {
      // Revoke every OTHER session first (each session object's own
      // .revoke() method, from user.getSessions()).
      const sessions = await user.getSessions()
      const others = sessions.filter((s) => s.id !== sessionId)
      await Promise.all(others.map((s) => s.revoke()))

      // Then end this device's session the normal way — safer than
      // manually revoking your own live session mid-request, since
      // signOut() also cleans up local client state and redirects.
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Failed to sign out of all devices', err)
      toast.error('Something went wrong signing out everywhere.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary className="list-none cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-800 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
        <LogOut className="w-4 h-4" />
        Sign out
      </summary>

      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-stone-100 py-1 z-10">
        <button
          onClick={signOutThisDevice}
          disabled={loading !== null}
          className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'this' ? 'Signing out…' : 'Sign out of this device'}
        </button>
        <button
          onClick={signOutAllDevices}
          disabled={loading !== null}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'all' ? 'Signing out…' : 'Sign out of all devices'}
        </button>
      </div>
    </details>
  )
}