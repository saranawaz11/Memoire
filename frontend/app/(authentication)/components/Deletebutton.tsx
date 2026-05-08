'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmModal } from './modals/ConfirmModal'

type Props = {
    id: number
    endpoint: string
    redirectTo?: string
    onSuccess?: () => void
    className?: string
}

export default function DeleteButton({ id, endpoint, redirectTo = '/notes', onSuccess, className }: Props) {
    const router = useRouter()

    const handleDelete = async () => {
        const res = await fetch(`http://127.0.0.1:8000/${endpoint}/${id}`, { method: 'DELETE' })

        if (res.ok) {
            toast.success('Note deleted')
            if (onSuccess) {
                onSuccess()
            } else {
                router.push(redirectTo)
                router.refresh()
            }
        } else {
            toast.error('Failed to delete note')
        }
    }

    return (
        <ConfirmModal onConfirm={handleDelete}>
            <button
                className={className ?? 'p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors'}
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </ConfirmModal>
    )
}