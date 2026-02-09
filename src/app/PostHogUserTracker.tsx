'use client'

import { useEffect, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'
import { createClient } from '@/lib/supabase/client'

export default function PostHogUserTracker() {
  const posthog = usePostHog()
  const supabase = createClient()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const handleAuthChange = (session: any, event?: string) => {
      // Ignore initial null session while loading
      if (!hasInitialized.current) {
        hasInitialized.current = true
        if (!session?.user) return
      }

      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        })
      } else if (event === 'SIGNED_OUT') {
        posthog.reset()
      }
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session)
    })

    // Auth listener
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        handleAuthChange(session, event)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [posthog, supabase])

  return null
}
