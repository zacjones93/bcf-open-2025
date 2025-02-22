'use client'

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider'
import { createClient } from '@/lib/supabase/client'

export function useIsAdmin() {
  const { user } = useSupabaseAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: athlete } = await supabase
        .from('athletes')
        .select('type')
        .eq('user_id', user.id)
        .single()

      setIsAdmin(athlete?.type === 'admin')
      setLoading(false)
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, loading }
} 