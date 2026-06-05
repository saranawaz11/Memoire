'use client'
import { Button } from '@/components/ui/button'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import { Archive, NotepadText, PlusIcon, SeparatorHorizontal, Settings, Trash, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { DeleteUser } from '../components/DeleteUser'
import { usePathname, useRouter } from 'next/navigation'
type MeProfile = { userId: string; role: string }

export default function Sidebar() {
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const { user } = useUser()
  const { userId, signOut } = useAuth()
  const router = useRouter()

  const pathname = usePathname()

  // const isEditorPage = pathname.startsWith('/notes/form')

  useEffect(() => {
    if (!userId || !user) return

    fetch('http://127.0.0.1:8000/me', {
      headers: {
        'x-user-id': userId,
        'x-first-name': user.firstName ?? '',
        'x-last-name': user.lastName ?? '',
        'x-email': user.emailAddresses[0]?.emailAddress ?? '',
      },
    })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
  }, [userId, user])


  const segments = pathname.split('/').filter(Boolean)

const isEditorPage =
  segments.length === 2 &&
  segments[0] === 'notes'

  // console.log('profile in sidebar:- ', user);

  return (
    // <div className='bg-white shadow-lg p-10 rounded-lg w-1/4 min-h-full flex flex-col'>
    <div
      className={`
        flex flex-col min-h-full p-10 w-1/4  rounded-lg transition-all duration-300
        ${isEditorPage
          ? 'bg-transparent shadow-none border-none opacity-50 hover:opacity-100'
          : 'bg-white shadow-lg'}
      `}
    >
      <h1 className='text-2xl font-bold'>Mémoire</h1>
      <div>
        <p className="text-xs font-medium tracking-widest text-green-600 uppercase mb-1">
          Your workspace
          {profile?.role && (
            <span className="ml-2 normal-case text-stone-500 font-normal tracking-normal">
              | {profile.role}
            </span>
          )}
        </p>
        {
          profile?.role === 'manager' ? (
            <Link href={'/manager'} className='my-2 text-sm text-stone-500 capitalize hover:underline hover:text-stone-800'>go to manager workspace</Link>
          ) : null}
      </div>

      <div className='flex flex-col gap-2 border border-px border-black p-4 my-6 rounded-lg'>
        <div className='flex gap-2 items-center'>
          <UserButton afterSwitchSessionUrl='/' />

          <p className='text-md font-semibold'>Sara Nawaz</p>
        </div>
        <p className='text-sm text-gray-500 ml-2'>sara@memoire.com</p>
      </div>

      <div className='my-4 h-0.5 w-full bg-black' />
      <div>
        <Button variant="outline" onClick={() => router.push('/notes/form')} className='w-full font-extrabold text-xl my-4 py-5 bg-green-700 text-white hover:bg-green-800 hover:text-white transition-colors'>

          <PlusIcon className='w-5! h-5! mr-1 text-3xl' />New Note
        </Button>

        {/* <button
              onClick={() => router.push('/notes/form')}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <span className="text-lg leading-none">+</span> New note
            </button> */}

        <Link href='/notes' className='flex items-center gap-2 text-lg font-semibold hover:text-green-900 transition-colors my-3'>
          <NotepadText className='w-5 h-5' />
          All Notes
        </Link>

        <Link href='/notes' className='flex items-center gap-2 text-lg font-semibold hover:text-green-900 transition-colors my-3'>
          <Trash2 className='w-5 h-5' />
          Trash
        </Link>

        <Link href='/notes' className='flex items-center gap-2 text-lg font-semibold hover:text-green-900 transition-colors my-3'>
          <Archive className='w-5 h-5' />
          Archive
        </Link>
      </div>
      <div className='my-4 h-0.5 w-full bg-black' />
      <div>
        <Link href='/notes' className='flex items-center gap-2 text-lg font-semibold hover:text-green-900 transition-colors my-3'>
          <Settings className='w-5 h-5' />
          Settings
        </Link>

        <DeleteUser
              userId={userId}
              signOut={signOut}
              onDeleted={() => router.push('/')}
            />
      </div>
    </div>
  )
}
