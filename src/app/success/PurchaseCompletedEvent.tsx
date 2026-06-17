'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

type Props = {
  purchase_type: 'donation' | 'tier';
  project_id: string | null;
  tier_id: string | null;
  amount: number;
  cover_fee: boolean;
  stripe_session_id: string;
  user_id: string | null;
};

export function PurchaseCompletedEvent({ props }: { props: Props }) {
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !posthog) return;
    posthog.capture('purchase_completed', {
      ...props,
      source: 'success_page',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
