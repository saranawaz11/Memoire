export type AppUser = {
    clerkUserId: string
    role: 'user' | 'manager'
    firstName: string | null
    lastName: string | null
    email: string | null
    noteCount: number
    joinedAt?: string
}