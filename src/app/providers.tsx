'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Import the PageView capture component dynamically here (Client Component)
const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in production to avoid polluting data with local dev
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only', 
        capture_pageview: false, // Handled manually via PostHogPageView
        loaded: (posthog) => {
            if (process.env.NODE_ENV !== 'production') posthog.opt_out_capturing()
        }
      })
    }
  }, [])

  return (
    <PostHogProvider client={posthog}>
      {/* We wrap the tracker in Suspense to avoid de-opting the whole app on build */}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}