// import { AppUser } from "@/types/user"

// export function getInitials(first_name?: string | null, last_name?: string | null): string {
//     const first = first_name?.trim()?.[0] || ''
//     const last = last_name?.trim()?.[0] || ''

//     return `${first}${last}`.toUpperCase() || 'NA'
// }

// export function displayName(user: AppUser): string {
//     const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
//     return full || user.email || user.clerk_user_id
// }
import { AppUser } from "@/types/user"

export function getInitials(firstName?: string | null, lastName?: string | null): string {
    const first = firstName?.trim()?.[0] || ''
    const last = lastName?.trim()?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'NA'
}

export function displayName(user: AppUser): string {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    if (user.firstName) return user.firstName
    if (user.lastName) return user.lastName
    return user.email || user.clerkUserId
}