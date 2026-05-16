import { displayName, getInitials } from '@/lib/helpers'
import { AppUser } from '@/types/user';
import { FileText, Trash2 } from 'lucide-react';
import React from 'react'
import { ConfirmModal } from '../components/modals/ConfirmModal';


type Props = {
    user: AppUser;
    handleDeleteUser: (targetId: string) => Promise<void>
}

export default function UsersList(
    { user, handleDeleteUser }: Props
) {
    return (
        
        <div className='bg-white  px-5 py-4 flex items-center gap-4 border-transparent '>

            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${user.role === 'manager'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-stone-100 text-stone-600'
                    }`}
            >
                {getInitials(user.firstName, user.lastName)}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{displayName(user)}</p>
                <p className="text-xs text-stone-400 truncate">{user.email || user.clerkUserId}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${user.role === 'manager'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-stone-100 text-stone-500'
                        }`}>
                        {user.role}
                    </span>
                    {user.joinedAt && (
                        <span className="text-xs text-stone-400">
                            · joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-center px-4 border-r border-stone-100">
                <div className="flex items-center gap-1.5 text-stone-400">
                    <FileText size={13} />
                    <span className="text-sm font-medium text-stone-700">{user.noteCount}</span>
                </div>
                <p className="text-xs text-stone-400">notes</p>
            </div>

            <div className="flex gap-2">
                <ConfirmModal onConfirm={() => handleDeleteUser(user.clerkUserId)}>
                    <button
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={12} />
                        Delete user
                    </button>
                </ConfirmModal>
            </div>
        </div>
    )
}
