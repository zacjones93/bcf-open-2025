'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createClientComponentClient<Database>()
} 