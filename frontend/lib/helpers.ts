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


export function formatNoteDate(dateStr: string): string {
    const normalized = dateStr.endsWith('Z') || dateStr.includes('+')
        ? dateStr
        : dateStr + 'Z'
    const d = new Date(normalized)
    const date = d.toLocaleDateString('en-PK', {
        month: 'short',
        day: '2-digit',
        timeZone: 'Asia/Karachi'
    })
    const time = d.toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Karachi'
    })
    return `${date.split(' ').reverse().join(' ')} | ${time}`
}