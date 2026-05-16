'use client'
import { FilterType } from '@/types/manager'
import { Search } from 'lucide-react'

type Props = {
    search: string
    filter: FilterType
    onSearchChange: (value: string) => void
    onFilterChange: (value: FilterType) => void
}

export default function ManagerSearchBar({ search, filter, onSearchChange, onFilterChange }: Props) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
                <Search size={14} className="text-stone-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or user ID…"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="text-sm text-stone-700 bg-transparent outline-none placeholder:text-stone-400 w-full"
                />
            </div>
            <div className="flex gap-2">
                {(['all', 'user', 'manager'] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => onFilterChange(f)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors capitalize ${filter === f
                                ? 'bg-green-700 text-white border-green-700'
                                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
    )
}