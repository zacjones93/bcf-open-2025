'use server'

import { cookies } from 'next/headers'
import { createServerClient } from './server'
import type { User } from '@supabase/supabase-js'

// Session cache duration in seconds (should match middleware.ts)
const SESSION_CACHE_DURATION = 5 * 60

/**
 * Get the user from the cached session cookie if available and fresh,
 * otherwise fetch from Supabase
 */
export async function getCachedUser(): Promise<User | null> {
  try {
    // Check for cached session in cookies
    const cookieList = await cookies();
    const cachedSessionStr = cookieList.get('cached_session')?.value;
    const cachedTimestampStr = cookieList.get('cached_session_timestamp')?.value;

    // If we have a cached session, check if it's still fresh
    if (cachedSessionStr && cachedTimestampStr) {
      try {
        const cachedTimestamp = parseInt(cachedTimestampStr, 10)
        const currentTime = Math.floor(Date.now() / 1000)

        // Check if the cached session is still fresh (within cache duration)
        if (currentTime - cachedTimestamp < SESSION_CACHE_DURATION) {
          const cachedSession = JSON.parse(cachedSessionStr)
          return cachedSession.user || null
        }
      } catch (error) {
        console.error('Error parsing cached session:', error)
      }
    }
  } catch (error) {
    console.error('Error accessing cookies:', error)
  }

  // If no valid cached session or error accessing cookies, fetch from Supabase
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getSession()

  // Note: We can't set cookies in server components directly
  // The middleware will handle setting the cookies when it fetches a new session

  return data.session?.user || null
}

/**
 * Get the session from the cached session cookie if available and fresh,
 * otherwise fetch from Supabase
 */
export async function getCachedSession() {
  try {
    // Check for cached session in cookies
    const cookieList = await cookies();
    const cachedSessionStr = cookieList.get('cached_session')?.value;
    const cachedTimestampStr = cookieList.get('cached_session_timestamp')?.value;

    // If we have a cached session, check if it's still fresh
    if (cachedSessionStr && cachedTimestampStr) {
      try {
        const cachedTimestamp = parseInt(cachedTimestampStr, 10)
        const currentTime = Math.floor(Date.now() / 1000)

        // Check if the cached session is still fresh (within cache duration)
        if (currentTime - cachedTimestamp < SESSION_CACHE_DURATION) {
          return JSON.parse(cachedSessionStr)
        }
      } catch (error) {
        console.error('Error parsing cached session:', error)
      }
    }
  } catch (error) {
    console.error('Error accessing cookies:', error)
  }

  // If no valid cached session or error accessing cookies, fetch from Supabase
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getSession()


  return data.session
} 