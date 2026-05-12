type Props = {
    text: string
}

export default function EmptyState({
    text,
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
            </div>

            <p className="text-stone-500 text-sm">
                {text}
            </p>
        </div>
    )
}