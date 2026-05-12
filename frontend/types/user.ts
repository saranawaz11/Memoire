export type AppUser = {
    clerk_user_id: string
    role: 'user' | 'manager'
    first_name: string | null
    last_name: string | null
    email: string
    note_count: number
    joined_at?: string
}