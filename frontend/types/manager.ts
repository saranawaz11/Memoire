export type FilterType = 'all' | 'user' | 'manager'

export type MeProfile = {
    userId:    string
    role:      string
    firstName: string | null
    lastName:  string | null
    email:     string | null
}

export type UsersFetchStatus = 'idle' | 'loading' | 'done'
