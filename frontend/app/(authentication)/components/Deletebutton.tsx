'use client'

import { Trash2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmModal } from './modals/ConfirmModal'
import { apiFetch } from '@/lib/api'

type Props = {
    id: number
    endpoint: string
    redirectTo?: string
    onSuccess?: () => void
    className?: string
}

export default function DeleteButton({ id, endpoint, redirectTo = '/notes', onSuccess, className }: Props) {
    const router = useRouter()
    // CHANGED: pull getToken alongside userId
    const { userId, getToken } = useAuth()

    const handleDelete = async () => {
        if (!userId) {
            toast.error('You must be signed in')
            return
        }

        try {
            // CHANGED: was fetch(url, { headers: { 'x-user-id': userId } })
            const res = await apiFetch(`/${endpoint}/${id}`, getToken, {
                method: 'DELETE',
            })

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
        } catch (error) {
            console.error(error)
            toast.error('Network error while deleting note')
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


// 'use client'

// import { Trash2 } from 'lucide-react'
// import { useAuth } from '@clerk/nextjs'
// import { useRouter } from 'next/navigation'
// import { toast } from 'sonner'
// import { ConfirmModal } from './modals/ConfirmModal'

// type Props = {
//     id: number
//     endpoint: string
//     redirectTo?: string
//     onSuccess?: () => void
//     className?: string
// }

// export default function DeleteButton({ id, endpoint, redirectTo = '/notes', onSuccess, className }: Props) {
//     const router = useRouter()
//     const { userId } = useAuth()

//     const handleDelete = async () => {
//         if (!userId) {
//             toast.error('You must be signed in')
//             return
//         }

//         try {
//             const res = await fetch(`http://127.0.0.1:8000/${endpoint}/${id}`, {
//                 method: 'DELETE',
//                 headers: { 'x-user-id': userId },
//             })

//             if (res.ok) {
//                 toast.success('Note deleted')
//                 if (onSuccess) {
//                     onSuccess()
//                 } else {
//                     router.push(redirectTo)
//                     router.refresh()
//                 }
//             } else {
//                 toast.error('Failed to delete note')
//             }
//         } catch (error) {
//             console.error(error)
//             toast.error('Network error while deleting note')
//         }
//     }

//     return (
//         <ConfirmModal onConfirm={handleDelete}>
//             <button
//                 className={className ?? 'p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors'}
//                 title="Delete"
//             >
//                 <Trash2 size={16} />
//             </button>
//         </ConfirmModal>
//     )
// }