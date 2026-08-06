'use client'

// app/(account)/layout.tsx
//
// Wraps both /profile and /settings. Keeping the nav here (rather than
// duplicating it in each page) is what lets the active-tab pill in
// AccountNav genuinely slide between tabs, and lets page content cross-fade
// instead of hard-cutting on navigation. The route group "(account)" is
// invisible in the URL — /profile and /settings stay exactly where they are.
//
// NOTE: adjust these two import paths to match where they actually live in
// your project if different from the original settings page's imports.
import { AccountNav } from '@/app/components/account/AccountNav'
import { SignOutMenu } from '@/app/(authentication)/_components/SignOutMenu'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#f7f5f0]">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            All notes
          </Link>
          <SignOutMenu />
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
          className="mb-10 flex flex-col gap-5"
        >
          <div>
            <h2 className="text-4xl font-bold text-stone-800 tracking-tight">Account</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Manage your profile, sessions, and notes data.
            </p>
          </div>
          <AccountNav />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}