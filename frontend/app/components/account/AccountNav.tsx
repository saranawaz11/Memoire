'use client'

// components/account/AccountNav.tsx
//
// Segmented tab control shared by /profile and /settings. Because it lives
// in the (account) layout rather than being duplicated per page, it never
// unmounts when you switch tabs — so the active pill can use a Framer
// Motion layoutId and genuinely *slide* between tabs instead of just
// fading in fresh each time.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const TABS = [
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="inline-flex items-center gap-0.5 rounded-full border border-stone-200 bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href} className="relative px-4 py-1.5">
            {active && (
              <motion.span
                layoutId="account-tab-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-green-700"
              />
            )}
            <span
              className={`relative z-10 text-sm font-medium transition-colors ${
                active ? 'text-white' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}