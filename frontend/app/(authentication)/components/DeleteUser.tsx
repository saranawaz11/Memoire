'use client'

import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'
import { ConfirmModal } from './modals/ConfirmModal'
import { apiFetch } from '@/lib/api'

type Props = {
    onDeleted: () => void
}

export function DeleteUser({ onDeleted }: Props) {
    // CHANGED: pull everything from useAuth() directly instead of via
    // props — getToken has to come from the same hook call as userId.
    const { userId, getToken, signOut } = useAuth()

    const handleDelete = async () => {
        if (!userId) return

        try {
            // CHANGED: was fetch(url, { headers: { 'x-user-id': userId } })
            const res = await apiFetch('/me', getToken, { method: 'DELETE' })

            if (!res.ok) throw new Error('Failed to delete account')

            toast.success('Account deleted successfully')
            await signOut()
            onDeleted()
        } catch {
            toast.error('Something went wrong. Please try again.')
        }
    }

    return (
        <ConfirmModal onConfirm={handleDelete}>
            <button className="flex gap-2 text-red-500 hover:text-red-700 my-3 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className='w-5! h-5!' />
                Delete account
            </button>
        </ConfirmModal>
    )
}