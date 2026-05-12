import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
    role?: string
}

export default function ManagerHeader({
    role,
}: Props) {
    return (
        <div className="flex items-end justify-between mb-10">
            <div>
                <p className="text-xs font-medium tracking-widest text-green-600 uppercase mb-1">
                    Manager workspace

                    <span className="ml-2 normal-case text-stone-500 font-normal tracking-normal">
                        · {role}
                    </span>
                </p>

                <h1 className="text-4xl font-bold text-stone-800 tracking-tight">
                    Users
                </h1>
            </div>

            <Link
                href="/notes"
                className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-10 group"
            >
                <ArrowLeft
                    size={14}
                    className="group-hover:-translate-x-0.5 transition-transform"
                />

                All notes
            </Link>
        </div>
    )
}