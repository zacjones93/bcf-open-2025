'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createServerClient() {
  return createServerComponentClient<Database>({ cookies })
} 