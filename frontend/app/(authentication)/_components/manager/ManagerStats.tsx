import {
    Users,
    NotebookPen,
    ShieldCheck,
} from 'lucide-react'

type Props = {
    totalUsers: number
    totalNotes: number
    managerCount: number
}

export default function ManagerStats({
    totalUsers,
    totalNotes,
    managerCount,
}: Props) {
    const stats = [
        {
            label: 'Total users',
            value: totalUsers,
            icon: Users,
        },
        {
            label: 'Total notes',
            value: totalNotes,
            icon: NotebookPen,
        },
        {
            label: 'Managers',
            value: managerCount,
            icon: ShieldCheck,
        },
    ]

    return (
        <div className="grid grid-cols-3 gap-3 mb-8">
            {stats.map(({ label, value, icon: Icon }) => (
                <div
                    key={label}
                    className="bg-gray-900 rounded-xl p-4"
                >
                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">
                        {label}
                    </p>

                    <div className="flex items-center gap-2">
                        <Icon
                            size={16}
                            className="text-stone-400"
                        />

                        <span className="text-2xl font-semibold text-stone-100">
                            {value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}