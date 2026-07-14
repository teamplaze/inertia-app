import Link from 'next/link';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PurchaseCompletedEvent } from './PurchaseCompletedEvent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <main
      className={cn(
        "flex-1 flex flex-col items-center",
        "justify-center text-center",
        "px-[var(--spacing-5)] md:px-[96px]",
        "pt-[120px] pb-[var(--spacing-12)]",
        "gap-[var(--spacing-6)]",
        "min-h-screen bg-black",
      )}
    >
      {eventProps && <PurchaseCompletedEvent props={eventProps} />}

      <span
        className="material-symbols-rounded text-[120px] leading-none"
        style={{ color: 'var(--color-bg-teal)' }}
        aria-hidden="true"
      >
        check_circle
      </span>

      <h1
        className={cn(
          "font-heading font-medium",
          "text-[32px] md:text-[40px]",
          "leading-[1.2] text-white",
        )}
      >
        Contribution Successful!
      </h1>

      <p
        className={cn(
          "font-body font-normal",
          "text-[18px] leading-[1.5]",
          "text-[--color-text-200]",
          "max-w-[560px]",
        )}
      >
        {projectTitle
          ? `Thank you for supporting ${projectTitle}. Your contribution will help bring it to life.`
          : 'Thank you for supporting this project. Your contribution will help bring it to life.'}
      </p>

      <Link href={backHref}>
        <Button variant="primary" size="lg">
          {backLabel}
        </Button>
      </Link>
    </main>
  );
}
