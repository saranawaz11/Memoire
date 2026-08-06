'use client'

// components/account/StatusButton.tsx
//
// A button whose icon morphs: idle → spinner → checkmark (spring bounce) →
// back to idle. Used for "Save changes" and "Reindex" so both pages share
// the same small piece of physical feedback rather than each inventing
// its own loading treatment.

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export type ButtonStatus = 'idle' | 'saving' | 'success' | 'error'

export function StatusButton({
  status,
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}: {
  status: ButtonStatus
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || status === 'saving'}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === 'saving' && (
          <motion.span
            key="saving"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="inline-flex"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.span>
        )}
        {status === 'success' && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="inline-flex"
          >
            <Check className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  )
}