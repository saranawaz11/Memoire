import { Spinner } from '@/components/ui/spinner'

export default function LoadingState() {
    return (
        <div className="flex justify-center items-center py-24">
            <Spinner className="w-10 h-10 text-green-600" />
        </div>
    )
}