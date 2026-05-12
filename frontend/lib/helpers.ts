import { AppUser } from "@/types/user"

export function getInitials(first_name?: string | null, last_name?: string | null): string {
    const first = first_name?.trim()?.[0] || ''
    const last = last_name?.trim()?.[0] || ''

    return `${first}${last}`.toUpperCase() || 'NA'
}

export function displayName(user: AppUser): string {
    const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    return full || user.email || user.clerk_user_id
}