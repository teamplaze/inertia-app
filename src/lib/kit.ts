import { createClient } from '@supabase/supabase-js'

const KIT_BASE = 'https://api.kit.com/v4'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type KitFields = Record<string, string | number | boolean>

export interface KitSubscriber {
  id: number
  first_name: string | null
  last_name?: string | null
  email_address: string
  state: string
  created_at: string
  fields: Record<string, string | number | boolean | null>
}

class KitApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'KitApiError'
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const retryable =
        !(err instanceof KitApiError) ||
        err.status === 429 ||
        err.status >= 500
      if (!retryable || attempt === maxAttempts) throw err
      await new Promise<void>(r => setTimeout(r, Math.pow(2, attempt - 1) * 1000))
    }
  }
  throw lastError
}

async function writeSyncStatus(
  userId: string,
  status: 'synced' | 'failed',
  subscriberId?: number
): Promise<void> {
  await supabaseAdmin.from('profiles').update({
    kit_sync_status: status,
    ...(status === 'synced' && { kit_synced_at: new Date().toISOString() }),
    ...(subscriberId != null && { kit_subscriber_id: String(subscriberId) }),
  }).eq('id', userId)
}

/**
 * Create a KIT client bound to a specific artist's API key.
 *
 * Usage:
 *   const kit = createKitClient(process.env.KIT_API_KEY_BABATUNDE!)
 *   const kit = createKitClient(process.env.KIT_API_KEY_GOLDSTEPS!)
 */
export function createKitClient(apiKey: string) {
  async function kitFetch(method: string, path: string, body?: object): Promise<any> {
    const res = await fetch(`${KIT_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Kit-Api-Key': apiKey,
      },
      ...(body != null && { body: JSON.stringify(body) }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new KitApiError(res.status, text)
    }
    if (res.status === 204) return null
    return res.json()
  }

  return {
    /**
     * Create or update a KIT subscriber. KIT returns the existing subscriber
     * if the email already exists. Pass userId to write kit_subscriber_id and
     * kit_sync_status back to the matching profile row.
     */
    async upsertSubscriber(
      email: string,
      fields?: KitFields,
      userId?: string
    ): Promise<number> {
      const { first_name, last_name, ...customFields } = fields ?? {}
      const body: Record<string, unknown> = { email_address: email }
      if (first_name != null) body.first_name = String(first_name)
      if (last_name != null) body.last_name = String(last_name)
      if (Object.keys(customFields).length > 0) body.custom_fields = customFields

      try {
        const data = await withRetry(() => kitFetch('POST', '/subscribers', body))
        const subscriberId: number = data.subscriber.id
        if (userId) await writeSyncStatus(userId, 'synced', subscriberId)
        return subscriberId
      } catch (err) {
        if (userId) await writeSyncStatus(userId, 'failed')
        throw err
      }
    },

    async applyTag(subscriberId: number, tagId: number): Promise<void> {
      await withRetry(() =>
        kitFetch('POST', `/tags/${tagId}/subscribers/${subscriberId}`, {})
      )
    },

    async removeTag(subscriberId: number, tagId: number): Promise<void> {
      await withRetry(() =>
        kitFetch('DELETE', `/tags/${tagId}/subscribers/${subscriberId}`)
      )
    },

    async updateCustomField(
      subscriberId: number,
      field: string,
      value: string | number | boolean
    ): Promise<void> {
      await withRetry(() =>
        kitFetch('PATCH', `/subscribers/${subscriberId}`, {
          custom_fields: { [field]: value },
        })
      )
    },

    /**
     * Fetch a subscriber's full record — first_name, last_name, email,
     * and custom field values under `fields`. Read-only: no sync-status
     * side effects.
     */
    async getSubscriber(subscriberId: number): Promise<KitSubscriber> {
      const data = await withRetry(() => kitFetch('GET', `/subscribers/${subscriberId}`))
      return data.subscriber
    },
  }
}
