'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { AppUser } from '@/types/user'
import { FilterType, MeProfile, UsersFetchStatus } from '@/types/manager'
import { displayName } from '@/lib/helpers'
import ManagerSearchBar from '@/app/(authentication)/_components/ManagerSearchBar'
import ManagerHeader from '@/app/(authentication)/_components/manager/ManagerHeader'
import ManagerStats from '@/app/(authentication)/_components/manager/ManagerStats'
import ManagerContent from '@/app/(authentication)/_components/manager/ManagerContent'
import LoadingState from '@/app/(authentication)/_components/manager/LoadingState'
import EmptyState from '@/app/(authentication)/_components/manager/EmptyState'

export default function ManagerPage() {
    const { userId, isLoaded } = useAuth()
    const { user } = useUser()
    const [profile, setProfile] = useState<MeProfile | null>(null)
    const [meReady, setMeReady] = useState(false)
    const [users, setUsers] = useState<AppUser[]>([])
    const [usersFetchStatus, setUsersFetchStatus] = useState<UsersFetchStatus>('idle')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterType>('all')

    // get manager info
    useEffect(() => {
        if (!userId || !user) return

        queueMicrotask(() => setMeReady(false))
        fetch('http://127.0.0.1:8000/me', {
            headers: {
                'x-user-id': userId,
                'x-first-name': user.firstName ?? '',
                'x-last-name': user.lastName ?? '',
                'x-email': user.emailAddresses[0]?.emailAddress ?? '',
            },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => setProfile(data))
            .catch(() => setProfile(null))
            .finally(() => setMeReady(true))
    }, [userId, user])

    useEffect(() => {
        if (!meReady || profile?.role === 'manager') return
        queueMicrotask(() => {
            setUsers([])
            setUsersFetchStatus('idle')
        })
    }, [meReady, profile?.role])


    // get all users
    useEffect(() => {
        if (!userId || !meReady || profile?.role !== 'manager') {
            return
        }

        const ac = new AbortController()
        queueMicrotask(() => setUsersFetchStatus('loading'))

        fetch('http://127.0.0.1:8000/users', {
            headers: { 'x-user-id': userId },
            signal: ac.signal,
        })
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => {
                setUsers(Array.isArray(data) ? data : [])
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'AbortError') return
                setUsers([])
            })
            .finally(() => {
                if (!ac.signal.aborted) queueMicrotask(() => setUsersFetchStatus('done'))
            })

        return () => {
            ac.abort()
            queueMicrotask(() => setUsersFetchStatus('idle'))
        }
    }, [userId, meReady, profile?.role])

    // async function handleDeleteUser(targetId: string) {
    //     if (!userId) return

    //     await fetch(`http://127.0.0.1:8000/users/${targetId}`, {
    //         method: 'DELETE',
    //         headers: { 'x-user-id': userId },
    //     })
    //     // this only removes from UI
    //     setUsers((prev) => prev.filter((u) => u.clerk_user_id !== targetId))
    // }

    // const filtered = users.filter((u) => {
    //     const matchesFilter = filter === 'all' || u.role === filter
    //     const needle = search.toLowerCase()
    //     const matchesSearch =
    //         u.clerk_user_id.toLowerCase().includes(needle) ||
    //         displayName(u).toLowerCase().includes(needle) ||
    //         (u.email ?? '').toLowerCase().includes(needle)
    //     return matchesFilter && matchesSearch
    // })

    // const totalNotes = filtered.reduce((acc, u) => acc + u.note_count, 0)
    // const managerCount = filtered.filter((u) => u.role === 'manager').length


    async function handleDeleteUser(targetId: string) {
        if (!userId) return
        await fetch(`http://127.0.0.1:8000/users/${targetId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': userId },
        })
        setUsers((prev) => prev.filter((u) => u.clerkUserId !== targetId))
    }

    const filtered = users.filter((u) => {
        const matchesFilter = filter === 'all' || u.role === filter
        const needle = search.toLowerCase()
        const matchesSearch =
            u.clerkUserId.toLowerCase().includes(needle) ||
            displayName(u).toLowerCase().includes(needle) ||
            (u.email ?? '').toLowerCase().includes(needle)
        return matchesFilter && matchesSearch
    })

    const totalNotes = filtered.reduce((acc, u) => acc + u.noteCount, 0)
    const managerCount = filtered.filter((u) => u.role === 'manager').length

    return (
        <div className="min-h-screen bg-[#f7f5f0]">
            <div className="max-w-4xl mx-auto px-8 py-12">

                <ManagerHeader role={profile?.role} />
                <ManagerStats
                    totalUsers={filtered.length}
                    totalNotes={totalNotes}
                    managerCount={managerCount}
                />

                <ManagerSearchBar
                    search={search}
                    filter={filter}
                    onSearchChange={setSearch}
                    onFilterChange={setFilter}
                />

                {!isLoaded || !userId || !user || !meReady ? (
                    <LoadingState />
                ) : profile?.role !== 'manager' ? (
                    <EmptyState text="Manager access only." />
                ) : usersFetchStatus !== 'done' ? (
                    <LoadingState />
                ) : filtered.length === 0 ? (
                    <EmptyState text="No users found." />
                ) : (
                    <ManagerContent
                        users={filtered}
                        handleDeleteUser={handleDeleteUser}
                    />
                )}

            </div>
        </div>
    )
}