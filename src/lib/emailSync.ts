import { createClient } from '@supabase/supabase-js'
import { createOrUpdateContact, sendEvent } from '@/lib/loops'
import { createKitClient } from '@/lib/kit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Artist = 'babatunde' | 'goldsteps'

export type CampaignStatus = 'prospect' | 'cart_abandon' | 'waitlist' | 'buyer'

// Maps a projects.id to the KIT account that owns that artist's audience.
export const PROJECT_ARTIST_MAP: Record<number, Artist> = {
  5: 'babatunde',
  2: 'goldsteps',
}

export function getArtistForProject(
  projectId: number | string | null | undefined
): Artist | null {
  if (projectId == null) return null
  return PROJECT_ARTIST_MAP[Number(projectId)] ?? null
}

// Splits a full name into first_name/last_name on the first space, e.g.
// "John Michael Smith" -> { first_name: "John", last_name: "Michael Smith" }.
// A single name (no space) goes entirely into first_name. Null/empty input
// returns an empty object so callers can spread it in without sending KIT
// empty-string fields.
export function splitFullName(fullName?: string | null): { first_name?: string; last_name?: string } {
  const trimmed = fullName?.trim()
  if (!trimmed) return {}
  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) return { first_name: trimmed }
  return {
    first_name: trimmed.slice(0, spaceIndex),
    last_name: trimmed.slice(spaceIndex + 1).trim(),
  }
}

function getArtistKitApiKey(artist: Artist): string {
  const envVar = ARTIST_KIT_CONFIG[artist].apiKeyEnv
  const key = process.env[envVar]
  if (!key) throw new Error(`Missing KIT API key env var "${envVar}" for artist "${artist}"`)
  return key
}

function getKitClientForArtist(artist: Artist) {
  return createKitClient(getArtistKitApiKey(artist))
}

type TagKey =
  | 'interest'
  | 'waitlist'
  | 'buyer'
  | 'buyer_wave_1'
  | 'buyer_wave_2'
  | 'buyer_wave_3'
  | 'nonbuyer_wave_1'
  | 'nonbuyer_wave_2'
  | 'purchased_any'
  | 'do_not_promote'
  | 'profile_completed'
  | 'discord_joined'

// ARTIST ONBOARDING: When adding a new artist, add a new entry here with
// their KIT API key env var and all tag IDs.
// Tag IDs are found in KIT by clicking a tag and reading the numeric ID
// from the URL.
// Set -1 for any tag not yet configured — calls will be skipped with a
// console.warn until real IDs are provided.
const ARTIST_KIT_CONFIG: Record<Artist, { apiKeyEnv: string; tags: Record<TagKey, number> }> = {
  babatunde: {
    apiKeyEnv: 'KIT_API_KEY_BABATUNDE',
    tags: {
      interest: 20992410,
      waitlist: 20992414,
      buyer: 20992412,
      buyer_wave_1: 20992416,
      buyer_wave_2: 20992417,
      buyer_wave_3: 20992418,
      nonbuyer_wave_1: 20992421,
      nonbuyer_wave_2: 20992422,
      purchased_any: 20992429,
      do_not_promote: 20992432,
      profile_completed: 20992430,
      discord_joined: 20992431,
    },
  },
  goldsteps: {
    apiKeyEnv: 'KIT_API_KEY_GOLDSTEPS',
    tags: {
      interest: 21129517,
      waitlist: 21129552,
      buyer: 21129550,
      buyer_wave_1: 21129553,
      buyer_wave_2: 21129554,
      buyer_wave_3: 21129556,
      nonbuyer_wave_1: 21129557,
      nonbuyer_wave_2: 21129558,
      purchased_any: 21129596,
      do_not_promote: 21129599,
      profile_completed: 21129597,
      discord_joined: 21129598,
    },
  },
}

// Email marketing sync must never block the user-facing action it's
// attached to — every call in this module logs failures instead of throwing.
async function safe(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (err) {
    console.error(`[emailSync] ${label} failed:`, err instanceof Error ? err.message : err)
  }
}

type LoopsContactProperties = Record<string, string | number | boolean> & {
  campaignStatus?: CampaignStatus
}

export function safeLoopsContact(
  email: string,
  properties: LoopsContactProperties,
  userId?: string
): Promise<void> {
  return safe('loops.createOrUpdateContact', () =>
    createOrUpdateContact(email, properties, userId)
  )
}

export function safeLoopsEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, string | number | boolean>
): Promise<void> {
  return safe('loops.sendEvent', () => sendEvent(email, eventName, eventProperties))
}

// Upserts a KIT subscriber; returns the subscriber ID, or null if the call failed.
export async function safeKitUpsert(
  artist: Artist,
  email: string,
  fields?: Record<string, string | number | boolean>,
  userId?: string
): Promise<number | null> {
  try {
    return await getKitClientForArtist(artist).upsertSubscriber(email, fields, userId)
  } catch (err) {
    console.error(
      `[emailSync] kit.upsertSubscriber (${artist}) failed:`,
      err instanceof Error ? err.message : err
    )
    return null
  }
}

export async function safeKitApplyTag(
  artist: Artist,
  subscriberId: number,
  tagKey: TagKey
): Promise<void> {
  const tagId = ARTIST_KIT_CONFIG[artist].tags[tagKey]
  if (tagId < 0) {
    console.warn(
      `[emailSync] Skipping applyTag "${tagKey}" for ${artist} — placeholder tag ID not configured.`
    )
    return
  }
  await safe(`kit.applyTag(${tagKey})`, () => getKitClientForArtist(artist).applyTag(subscriberId, tagId))
}

export async function safeKitRemoveTag(
  artist: Artist,
  subscriberId: number,
  tagKey: TagKey
): Promise<void> {
  const tagId = ARTIST_KIT_CONFIG[artist].tags[tagKey]
  if (tagId < 0) {
    console.warn(
      `[emailSync] Skipping removeTag "${tagKey}" for ${artist} — placeholder tag ID not configured.`
    )
    return
  }
  await safe(`kit.removeTag(${tagKey})`, () => getKitClientForArtist(artist).removeTag(subscriberId, tagId))
}

export async function safeKitUpdateCustomField(
  artist: Artist,
  subscriberId: number,
  email: string,
  field: string,
  value: string | number | boolean
): Promise<void> {
  await safe(`kit.updateCustomField(${field})`, () =>
    getKitClientForArtist(artist).updateCustomField(subscriberId, email, field, value)
  )
}

// Same wave-number extraction WaveCard.tsx uses to label a tier ("Wave 2" -> 2).
// Babatunde's existing convention is "act_N" (matches KIT tag names like
// inertia_buyer_act_1); Gold Steps has no tiers live yet, so "wave_N" is used
// as its equivalent. Falls back to N=1 when there's no tier context.
export async function resolveWaveLabel(
  artist: Artist | null,
  tierId: number | string | null
): Promise<string> {
  const prefix = artist === 'goldsteps' ? 'wave' : 'act'
  if (tierId) {
    const { data: tier } = await supabaseAdmin
      .from('tiers')
      .select('name')
      .eq('id', tierId)
      .maybeSingle()
    const waveNumber = tier?.name?.match(/\d+/)?.[0]
    if (waveNumber) return `${prefix}_${waveNumber}`
  }
  return `${prefix}_1`
}

// Applies the buyer_wave_N tag matching a resolveWaveLabel()-style string
// (e.g. "act_2" -> buyer_wave_2). Only waves 1-3 have tags configured — for
// anything else, logs a warning and skips rather than guessing.
export async function safeKitApplyBuyerWaveTag(
  artist: Artist,
  subscriberId: number,
  waveLabel: string
): Promise<void> {
  const waveNumber = Number(waveLabel.match(/_(\d+)$/)?.[1])
  const tagKey: TagKey | null =
    waveNumber === 1 ? 'buyer_wave_1' : waveNumber === 2 ? 'buyer_wave_2' : waveNumber === 3 ? 'buyer_wave_3' : null
  if (!tagKey) {
    console.warn(
      `[emailSync] Could not resolve a buyer_wave tag from wave label "${waveLabel}" (only waves 1-3 are configured) — skipping wave-specific tag.`
    )
    return
  }
  await safeKitApplyTag(artist, subscriberId, tagKey)
}
