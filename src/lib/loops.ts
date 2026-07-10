import { createClient } from '@supabase/supabase-js'

const LOOPS_BASE = 'https://app.loops.so/api/v1'

// Same admin pattern as the Stripe webhook — service role, no cookies needed
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type LoopsProps = Record<string, string | boolean | number>

class LoopsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'LoopsApiError'
  }
}

// Retries on network errors, 429, and 5xx. Lets 4xx (bad request, bad auth) through immediately.
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const retryable =
        !(err instanceof LoopsApiError) ||
        err.status === 429 ||
        err.status >= 500
      if (!retryable || attempt === maxAttempts) throw err
      await new Promise<void>(r => setTimeout(r, Math.pow(2, attempt - 1) * 1000))
    }
  }
  throw lastError
}

async function loopsFetch(path: string, body: object): Promise<any> {
  const res = await fetch(`${LOOPS_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new LoopsApiError(res.status, text)
  }
  return res.json()
}

async function writeSyncStatus(
  userId: string,
  status: 'synced' | 'failed',
  contactId?: string
): Promise<void> {
  await supabaseAdmin.from('profiles').update({
    loops_sync_status: status,
    ...(status === 'synced' && { loops_synced_at: new Date().toISOString() }),
    ...(contactId != null && { loops_contact_id: contactId }),
  }).eq('id', userId)
}

/**
 * Create or update a Loops contact. Loops treats POST /contacts/create as an
 * upsert — existing contacts are updated in place. Mirrors the call in
 * /api/network/route.ts but adds retry and optional sync-status write-back.
 *
 * Pass userId (Supabase auth UID) to record loops_contact_id / loops_sync_status
 * on the matching profile row.
 */
export async function createOrUpdateContact(
  email: string,
  properties?: LoopsProps,
  userId?: string
): Promise<void> {
  try {
    const data = await withRetry(() =>
      loopsFetch('/contacts/create', { email, ...properties })
    )
    if (userId) await writeSyncStatus(userId, 'synced', data?.id ?? undefined)
  } catch (err) {
    if (userId) await writeSyncStatus(userId, 'failed')
    throw err
  }
}

/**
 * Fire a Loops event — triggers any automations listening for eventName.
 * No sync-status side effect: events are actions, not contact records.
 */
export async function sendEvent(
  email: string,
  eventName: string,
  eventProperties?: LoopsProps
): Promise<void> {
  await withRetry(() =>
    loopsFetch('/events/send', {
      email,
      eventName,
      ...(eventProperties != null && { eventProperties }),
    })
  )
}
