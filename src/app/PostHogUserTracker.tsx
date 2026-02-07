'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import { createClient } from '@/lib/supabase/client'

export default function PostHogUserTracker() {
  const posthog = usePostHog()
  const supabase = createClient()

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    const handleAuthChange = async (session: any) => {
      if (session?.user) {
        // User is logged in
        posthog.identify(session.user.id, {
          email: session.user.email,
          // Add other user properties here if needed (e.g. name from metadata)
          name: session.user.user_metadata?.full_name
        })
      } else {
        // User is logged out
        posthog.reset()
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [posthog, supabase])

  return null
}