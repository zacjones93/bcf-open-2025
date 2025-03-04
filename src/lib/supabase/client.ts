'use client'

import { createBrowserClient } from '@supabase/ssr'

export const WORKOUT_COMPLETION_POINT_TYPE_ID = "99b7a5f1-c8aa-4282-ade9-cb530aa4cca4";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}