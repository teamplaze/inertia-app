import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PurchaseCompletedEvent } from './PurchaseCompletedEvent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let projectTitle: string | null = null;
  let projectSlug: string | null = null;
  let eventProps: Parameters<typeof PurchaseCompletedEvent>[0]['props'] | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const { userId, tierId, projectId, processingFee, is_donation } = session.metadata || {};

      if (projectId) {
        const { data: project } = await supabaseAdmin
          .from('projects')
          .select('project_title, slug')
          .eq('id', projectId)
          .single();

        projectTitle = project?.project_title ?? null;
        projectSlug = project?.slug ?? null;
      }

      eventProps = {
        purchase_type: is_donation === 'true' ? 'donation' : 'tier',
        project_id: projectId ?? null,
        tier_id: tierId ?? null,
        amount: (session.amount_total ?? 0) / 100,
        cover_fee: processingFee != null && processingFee !== '0',
        stripe_session_id: session.id,
        user_id: userId ?? null,
      };
    } catch {
      // Graceful fallback — session missing or expired
    }
  }

  const backHref = projectSlug ? `/${projectSlug}` : '/';
  const backLabel = projectSlug ? 'Back to project' : 'Back to Homepage';

  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center py-20">
      {eventProps && <PurchaseCompletedEvent props={eventProps} />}
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">Contribution Successful!</h1>
      <p className="text-lg text-gray-300 mb-8">
        {projectTitle
          ? `Thank you for supporting ${projectTitle}. Your contribution will help bring it to life.`
          : 'Thank you for supporting this project. Your contribution will help bring it to life.'}
      </p>
      <Link href={backHref}>
        <button className="bg-brand-copper text-white px-6 py-2 rounded-md hover:bg-brand-copper/90">
          {backLabel}
        </button>
      </Link>
    </main>
  );
}
