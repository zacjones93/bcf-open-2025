import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

// Session cache duration in seconds (5 minutes)
const SESSION_CACHE_DURATION = 5 * 60

export async function middleware(request: NextRequest) {
  // Only perform auth checks on protected routes or auth-related routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register'

  // Skip auth checks for API routes that don't need authentication
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthApiRoute = request.nextUrl.pathname.startsWith('/api/auth')

  // Only proceed with auth checks if necessary
  if (!isProtectedRoute && !isAuthRoute && !(isApiRoute && !isAuthApiRoute)) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // Check for cached session in cookies
  const cachedSessionStr = request.cookies.get('cached_session')?.value
  const cachedTimestampStr = request.cookies.get('cached_session_timestamp')?.value

  let session = null
  let shouldFetchNewSession = true

  // If we have a cached session, check if it's still fresh
  if (cachedSessionStr && cachedTimestampStr) {
    try {
      const cachedTimestamp = parseInt(cachedTimestampStr, 10)
      const currentTime = Math.floor(Date.now() / 1000)

      // Check if the cached session is still fresh (within cache duration)
      if (currentTime - cachedTimestamp < SESSION_CACHE_DURATION) {
        session = JSON.parse(cachedSessionStr)
        shouldFetchNewSession = false
      }
    } catch (error) {
      // If there's an error parsing the cached session, fetch a new one
      console.error('Error parsing cached session:', error)
    }
  }

  // If we need to fetch a new session
  if (shouldFetchNewSession) {
    const supabase = createMiddlewareClient<Database>({ req: request, res })

    const { data } = await supabase.auth.getSession()
    session = data.session

    // Cache the session in cookies
    if (session) {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      res.cookies.set('cached_session', JSON.stringify(session), {
        path: '/',
        maxAge: SESSION_CACHE_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      res.cookies.set('cached_session_timestamp', currentTimestamp.toString(), {
        path: '/',
        maxAge: SESSION_CACHE_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    } else {
      // Clear cached session if no active session
      res.cookies.delete('cached_session')
      res.cookies.delete('cached_session_timestamp')
    }
  }

  // If no session and trying to access protected routes, redirect to login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth routes, redirect to dashboard
  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated but no athlete profile, redirect to onboarding
  if (session && isProtectedRoute) {
    const supabase = createMiddlewareClient<Database>({ req: request, res })

    const { data: athlete } = await supabase
      .from('athletes')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!athlete) {
      const redirectUrl = new URL('/onboarding', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Update matcher to be more specific about which routes to process
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Auth routes
    '/login',
    '/register',
    '/onboarding',
    // Auth-related API routes that need session checks
    '/api/auth/:path*'
  ],
} 