import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/notes(.*)', '/notes'])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth()

    // not signed in + trying to access protected route → redirect to sign-in
    if (!userId && isProtectedRoute(req)) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // signed in + trying to access / → redirect to /notes
    if (userId && req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/notes', req.url))
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};