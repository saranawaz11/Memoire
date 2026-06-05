'use client'

import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from './modals/ConfirmModal'

type Props = {
    userId: string | null | undefined
    signOut: () => Promise<void>
    onDeleted: () => void
}

export function DeleteUser({ userId, signOut, onDeleted }: Props) {
    const handleDelete = async () => {
        if (!userId) return

        try {
            const res = await fetch('http://127.0.0.1:8000/me', {
                method: 'DELETE',
                headers: { 'x-user-id': userId },
            })

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