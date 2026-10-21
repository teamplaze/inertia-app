import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchWaitlistContext, type WaitlistContext } from '@/lib/fetchProject';

type JoinedStatus = 'joined' | 'already_on_list' | 'error';

type SearchParams = Promise<{
  projectId?: string | string[];
  tierId?: string | string[];
  status?: string | string[];
}>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseId(value: string | string[] | undefined): number | null {
  const raw = firstParam(value);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeStatus(value: string | string[] | undefined): JoinedStatus {
  const raw = firstParam(value);
  return raw === 'already_on_list' || raw === 'error' ? raw : 'joined';
}

async function loadContext(projectId: number | null): Promise<WaitlistContext | null> {
  if (projectId == null) return null;
  try {
    return await fetchWaitlistContext(projectId);
  } catch {
    return null;
  }
}

function projectHref(context: WaitlistContext): string {
  return context.slug ? `/${context.slug}` : `/projects/${context.id}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const context = await loadContext(parseId(params.projectId));
  return {
    title: context ? `You're on the list — ${context.project_title}` : "You're on the list",
    robots: { index: false },
  };
}

export default async function WaitlistJoinedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tierId = parseId(params.tierId);
  const status = normalizeStatus(params.status);
  const context = await loadContext(parseId(params.projectId));

  let heading: string;
  let body: string | null = null;
  if (!context) {
    heading = "You're on the list";
    body = "We'll email you when it opens.";
  } else if (status === 'already_on_list') {
    heading = "You're already on the list";
  } else if (status === 'error') {
    heading = 'Almost there';
    body = "Your account is set up, but we couldn't confirm your waitlist spot.";
  } else {
    heading = "You're on the list";
  }

  const showCheck = !context || status !== 'error';

  let retryHref = '/';
  if (context) {
    const retryParams = new URLSearchParams({ action: 'waitlist', projectId: String(context.id) });
    if (tierId != null) retryParams.set('tierId', String(tierId));
    retryHref = `/sign-up?${retryParams.toString()}`;
  }

  const secondaryLinkClass = cn(
    "font-body font-normal",
    "text-[14px] leading-[1.5]",
    "text-white underline",
    "hover:text-[var(--color-bg-teal)] transition-colors duration-150",
  );

  return (
    <main
      className={cn(
        "flex-1 flex flex-col items-center",
        "justify-start md:justify-center text-center",
        "px-[var(--spacing-5)] md:px-[96px]",
        "pt-[96px] md:pt-[120px] pb-[48px] md:pb-[var(--spacing-12)]",
        "gap-[var(--spacing-6)]",
        "md:min-h-screen bg-black",
      )}
    >
      {context?.project_image_url && (
        <div className="relative w-[120px] h-[120px] md:w-[160px] md:h-[160px] shrink-0 overflow-hidden rounded-[12px]">
          <Image
            src={context.project_image_url}
            alt={context.project_title}
            fill
            sizes="(min-width: 768px) 160px, 120px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {context && (
        <p
          className={cn(
            "font-body font-normal",
            "text-[14px] leading-[1.5]",
            "text-[var(--color-text-200)] break-words",
            "max-w-[560px]",
          )}
        >
          {context.artist_name || context.project_title}
        </p>
      )}

      {showCheck && (
        <span
          className="material-symbols-rounded text-[64px] leading-none"
          style={{ color: 'var(--color-bg-teal)' }}
          aria-hidden="true"
        >
          check_circle
        </span>
      )}

      <h1
        className={cn(
          "font-heading font-medium",
          "text-[32px] md:text-[40px]",
          "leading-[1.2] text-white",
          "max-w-[560px]",
        )}
      >
        {heading}
      </h1>

      {body && (
        <p
          className={cn(
            "font-body font-normal",
            "text-[18px] leading-[1.5]",
            "text-[var(--color-text-200)]",
            "max-w-[560px]",
          )}
        >
          {body}
        </p>
      )}

      {!context && (
        <Link href="/">
          <Button variant="primary" size="lg">
            Back to home
          </Button>
        </Link>
      )}

      {context && status !== 'error' && (
        <div className="flex flex-col items-center gap-[var(--spacing-4)]">
          <Link href={projectHref(context)}>
            <Button variant="primary" size="lg">
              Back to {context.project_title}
            </Button>
          </Link>
          <Link href="/account/profile" className={secondaryLinkClass}>
            Complete your profile
          </Link>
        </div>
      )}

      {context && status === 'error' && (
        <div className="flex flex-col items-center gap-[var(--spacing-4)]">
          <Link href={retryHref}>
            <Button variant="primary" size="lg">
              Try again
            </Button>
          </Link>
          <Link href={projectHref(context)} className={secondaryLinkClass}>
            Back to project
          </Link>
        </div>
      )}
    </main>
  );
}
