'use client'
import { useAuth } from '@clerk/nextjs'
import React from 'react'

export default function ManagerWrapper(
    { children }: {children:React.ReactNode}
) {
    const { userId, isLoaded } = useAuth()
console.log('userid from wrappper: ', userId);

  return (
    <div>
        ManagerWrapper
        <main>{children}</main>
    </div>
  )
}
