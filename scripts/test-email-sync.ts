/**
 * Standalone integration test for src/lib/loops.ts, src/lib/kit.ts, and the
 * four trigger points wired through src/lib/emailSync.ts. Hits real Loops +
 * KIT APIs and a real Supabase instance — not a unit test.
 *
 * Run with: npx tsx scripts/test-email-sync.ts
 * By default only runs steps 1, 3, 4, 5 (the ones affected by the
 * Loops create-then-update fallback and the KIT auth header fix).
 * Pass --all to run the full suite (adds steps 0, 2, 6-10).
 * Pass --steps=7,8,9,10 to run an explicit subset.
 *
 * Steps 7-10 replicate the sync logic inline from each route handler
 * (src/app/api/auth/sign-up, src/app/api/waitlist, src/app/api/webhooks/stripe,
 * src/app/api/profile/sync-complete) by calling the same src/lib/emailSync.ts
 * functions those routes call — not via HTTP. Because those functions swallow
 * errors internally (by design — sync failures must never block the
 * user-facing action), pass/fail for individual tag/field calls is inferred
 * from the [emailSync] console.error/console.warn output they produce.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const TEST_EMAIL = 'idibruno@gmail.com'
const TEST_FULL_NAME = 'Ian DiBruno'
const LOOPS_BASE = 'https://app.loops.so/api/v1'
const KIT_TAG_ID = 20992410

// ---------------------------------------------------------------------------
// .env.local loader (no dotenv dependency in this repo)
// ---------------------------------------------------------------------------
function loadEnvLocal(): void {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) {
    throw new Error(`.env.local not found at ${path}`)
  }
  const contents = readFileSync(path, 'utf-8')
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

// ---------------------------------------------------------------------------
// console helpers
// ---------------------------------------------------------------------------
function step(n: number, title: string): void {
  console.log(`\n=== Step ${n}: ${title} ===`)
}
function pass(msg: string): void {
  console.log(`[PASS] ${msg}`)
}
function fail(msg: string): void {
  console.log(`[FAIL] ${msg}`)
}
function skip(msg: string): void {
  console.log(`[SKIPPED] ${msg}`)
}
function manualVerify(msg: string): void {
  console.log(`[MANUAL VERIFY NEEDED] ${msg}`)
}
function info(msg: string): void {
  console.log(`       ${msg}`)
}

// Temporarily captures console.error/console.warn output produced while fn()
// runs, so we can infer pass/fail/skip for calls that swallow their own
// errors by design (everything routed through src/lib/emailSync.ts).
async function captureLogs<T>(fn: () => Promise<T>): Promise<{ result: T; logs: string[] }> {
  const logs: string[] = []
  const origError = console.error
  const origWarn = console.warn
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
    origError(...args)
  }
  console.warn = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
    origWarn(...args)
  }
  try {
    const result = await fn()
    return { result, logs }
  } finally {
    console.error = origError
    console.warn = origWarn
  }
}

// Classifies a kit.applyTag / kit.removeTag / kit.updateCustomField call by
// scanning captured logs for that call's [emailSync] skip or failure message.
function classifyKitCall(
  logs: string[],
  op: 'applyTag' | 'removeTag' | 'updateCustomField',
  key: string
): 'PASS' | 'FAIL' | 'SKIPPED' {
  if (logs.some(l => l.includes(`Skipping ${op} "${key}"`))) return 'SKIPPED'
  if (logs.some(l => l.includes(`${op}(${key})`) && l.includes('failed'))) return 'FAIL'
  return 'PASS'
}

// Classifies a loops.createOrUpdateContact / loops.sendEvent call the same way.
function classifyLoopsCall(logs: string[], label: 'loops.createOrUpdateContact' | 'loops.sendEvent'): 'PASS' | 'FAIL' {
  return logs.some(l => l.includes(`${label} failed`)) ? 'FAIL' : 'PASS'
}

function resolveSteps(): Set<number> {
  const args = process.argv.slice(2)
  if (args.includes('--all')) return new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  const stepsArg = args.find(a => a.startsWith('--steps='))
  if (stepsArg) {
    return new Set(
      stepsArg
        .slice('--steps='.length)
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => !Number.isNaN(n))
    )
  }
  return new Set([1, 3, 4, 5])
}

async function main() {
  loadEnvLocal()
  const selectedSteps = resolveSteps()
  console.log(`Running steps: ${[...selectedSteps].sort((a, b) => a - b).join(', ')}`)

  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LOOPS_API_KEY',
    'KIT_API_KEY_BABATUNDE',
  ]
  const missing = requiredEnv.filter(k => !process.env[k])
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }

  // Import after env vars are populated — loops.ts / kit.ts construct a
  // Supabase client at module load time from process.env.
  const { createOrUpdateContact, sendEvent } = await import('../src/lib/loops')
  const { createKitClient } = await import('../src/lib/kit')
  const { createClient } = await import('@supabase/supabase-js')
  const {
    getArtistForProject,
    resolveWaveLabel,
    splitFullName,
    safeLoopsContact,
    safeLoopsEvent,
    safeKitUpsert,
    safeKitApplyTag,
    safeKitApplyBuyerWaveTag,
    safeKitRemoveTag,
    safeKitUpdateCustomField,
  } = await import('../src/lib/emailSync')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ---------------------------------------------------------------------
  // Resolve a real userId for idibruno@gmail.com if one exists, else fake one
  // ---------------------------------------------------------------------
  step(0, 'Resolve userId for test email')
  let userId: string
  {
    let page = 1
    let found: string | null = null
    while (!found) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
      if (error) {
        fail(`auth.admin.listUsers failed: ${error.message}`)
        break
      }
      const match = data.users.find(
        u => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase()
      )
      if (match) {
        found = match.id
        break
      }
      if (data.users.length < 200) break // no more pages
      page++
    }
    if (found) {
      userId = found
      pass(`Found existing profiles user: ${userId}`)
    } else {
      userId = randomUUID()
      info(`No existing user for ${TEST_EMAIL} — using generated test uuid: ${userId}`)
      info('(profiles row writes for this uuid will no-op if the row does not exist)')
    }
  }

  // ---------------------------------------------------------------------
  // Step 1: Loops createOrUpdateContact
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(1)) {
    step(1, 'Loops createOrUpdateContact — SKIPPED')
  } else {
    step(1, 'Loops createOrUpdateContact')
    try {
      await createOrUpdateContact(
        TEST_EMAIL,
        { campaignStatus: 'prospect', artistInterest: 'babatunde' },
        userId
      )
      pass('createOrUpdateContact resolved without throwing')
    } catch (err) {
      fail(`createOrUpdateContact threw: ${(err as Error).message}`)
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('loops_contact_id, loops_sync_status, loops_synced_at')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      fail(`Could not read profiles row: ${error.message}`)
    } else if (!data) {
      fail(`No profiles row found for userId ${userId} — cannot confirm sync status write-back`)
    } else {
      info(`loops_contact_id=${data.loops_contact_id}`)
      info(`loops_sync_status=${data.loops_sync_status}`)
      info(`loops_synced_at=${data.loops_synced_at}`)
      if (data.loops_sync_status === 'synced') {
        pass('loops_sync_status written as "synced"')
      } else {
        fail(`Expected loops_sync_status="synced", got "${data.loops_sync_status}"`)
      }
    }
  }

  // ---------------------------------------------------------------------
  // Step 2: Loops sendEvent
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(2)) {
    step(2, 'Loops sendEvent (backerJoined) — SKIPPED')
  } else {
    step(2, 'Loops sendEvent (backerJoined)')
    try {
      await sendEvent(TEST_EMAIL, 'backerJoined', {
        projectName: 'Influencer to Artist',
        artistName: 'Babatunde',
        tierName: 'Act 1',
        amount: '100',
        projectId: 'test-123',
      })
      pass('sendEvent resolved without throwing')
    } catch (err) {
      fail(`sendEvent threw: ${(err as Error).message}`)
    }
  }

  // ---------------------------------------------------------------------
  // Step 3: KIT upsertSubscriber
  // ---------------------------------------------------------------------
  const kit = createKitClient(process.env.KIT_API_KEY_BABATUNDE!)

  // Reads a subscriber back from KIT and asserts a map of field -> expected
  // value. classifyKitCall only proves an updateCustomField call didn't
  // error — this is the only way to confirm the value actually persisted.
  async function verifyKitFields(
    label: string,
    subscriberId: number,
    expectedFields: Record<string, string | number | boolean>
  ): Promise<void> {
    try {
      const subscriber = await kit.getSubscriber(subscriberId)
      for (const [field, expected] of Object.entries(expectedFields)) {
        const actual = subscriber.fields?.[field]
        if (actual != null && String(actual) === String(expected)) {
          pass(`[${label}] getSubscriber: ${field} matches "${expected}"`)
        } else {
          fail(`[${label}] getSubscriber: ${field} expected "${expected}", got "${actual}"`)
        }
      }
    } catch (err) {
      fail(`[${label}] getSubscriber threw: ${(err as Error).message}`)
    }
  }

  let subscriberId: number | null = null
  if (!selectedSteps.has(3)) {
    step(3, 'KIT upsertSubscriber (Babatunde account) — SKIPPED')
  } else {
    step(3, 'KIT upsertSubscriber (Babatunde account)')
    try {
      subscriberId = await kit.upsertSubscriber(TEST_EMAIL, undefined, userId)
      pass(`upsertSubscriber returned subscriberId=${subscriberId}`)
    } catch (err) {
      fail(`upsertSubscriber threw: ${(err as Error).message}`)
    }
  }

  // ---------------------------------------------------------------------
  // Step 4: KIT applyTag
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(4)) {
    step(4, `KIT applyTag (tagId=${KIT_TAG_ID}) — SKIPPED`)
  } else {
    step(4, `KIT applyTag (tagId=${KIT_TAG_ID})`)
    if (subscriberId == null) {
      fail('Skipped — no subscriberId from step 3')
    } else {
      try {
        await kit.applyTag(subscriberId, KIT_TAG_ID)
        pass(`applyTag resolved for subscriberId=${subscriberId}`)
      } catch (err) {
        fail(`applyTag threw: ${(err as Error).message}`)
      }
    }
  }

  // ---------------------------------------------------------------------
  // Step 5: KIT removeTag
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(5)) {
    step(5, `KIT removeTag (tagId=${KIT_TAG_ID}) — SKIPPED`)
  } else {
    step(5, `KIT removeTag (tagId=${KIT_TAG_ID})`)
    if (subscriberId == null) {
      fail('Skipped — no subscriberId from step 3')
    } else {
      try {
        await kit.removeTag(subscriberId, KIT_TAG_ID)
        pass(`removeTag resolved for subscriberId=${subscriberId}`)
      } catch (err) {
        fail(`removeTag threw: ${(err as Error).message}`)
      }
    }
  }

  // ---------------------------------------------------------------------
  // Step 6: Simulate Loops 5xx failure, confirm retries + failed status,
  // confirm KIT is unaffected.
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(6)) {
    step(6, 'Simulate Loops 5xx failure (retry + failed sync status) — SKIPPED')
  } else {
    step(6, 'Simulate Loops 5xx failure (retry + failed sync status)')
    let requestCount = 0
    const badServer = createServer((_req, res) => {
      requestCount++
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'simulated failure' }))
    })
    await new Promise<void>(r => badServer.listen(0, r))
    const addr = badServer.address()
    const badPort = typeof addr === 'object' && addr ? addr.port : 0
    const badUrl = `http://127.0.0.1:${badPort}`

    const originalFetch = globalThis.fetch
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.startsWith(LOOPS_BASE)) {
        const redirected = url.replace(LOOPS_BASE, badUrl)
        return originalFetch(redirected, init)
      }
      return originalFetch(input, init)
    }) as typeof fetch

    const start = Date.now()
    try {
      await createOrUpdateContact(
        TEST_EMAIL,
        { campaignStatus: 'prospect', artistInterest: 'babatunde' },
        userId
      )
      fail('Expected createOrUpdateContact to throw after retries, but it resolved')
    } catch (err) {
      const elapsedMs = Date.now() - start
      info(`createOrUpdateContact threw as expected: ${(err as Error).message}`)
      if (requestCount === 3) {
        pass(`Retried 3 times against the bad endpoint (elapsed ${elapsedMs}ms)`)
      } else {
        fail(`Expected 3 attempts, observed ${requestCount} (elapsed ${elapsedMs}ms)`)
      }
    } finally {
      globalThis.fetch = originalFetch
      await new Promise<void>(r => badServer.close(() => r()))
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('loops_sync_status')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      fail(`Could not read profiles row: ${error.message}`)
    } else if (!data) {
      fail(`No profiles row found for userId ${userId}`)
    } else if (data.loops_sync_status === 'failed') {
      pass('loops_sync_status written as "failed"')
    } else {
      fail(`Expected loops_sync_status="failed", got "${data.loops_sync_status}"`)
    }

    // Confirm KIT is unaffected by the Loops outage — independent client/base URL.
    try {
      const id = await kit.upsertSubscriber(TEST_EMAIL, undefined, userId)
      pass(`KIT upsertSubscriber still succeeds independently (subscriberId=${id})`)
    } catch (err) {
      fail(`KIT upsertSubscriber unexpectedly failed: ${(err as Error).message}`)
    }
  }

  // ---------------------------------------------------------------------
  // Step 7: Sign-up sync (replicates src/app/api/auth/sign-up/route.ts)
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(7)) {
    step(7, 'Sign-up sync — SKIPPED')
  } else {
    step(7, 'Sign-up sync (replicates src/app/api/auth/sign-up/route.ts action handling)')

    // Runs the same sync logic the sign-up route runs for a given
    // (action, projectId) combo, then verifies both the write-call outcomes
    // (via captured [emailSync] logs) and — for KIT — the actual persisted
    // values via a real getSubscriber() read-back.
    async function runSignupSyncScenario(
      label: string,
      signupAction: 'checkout' | 'waitlist' | undefined,
      signupProjectId: number | undefined,
      expectKit: boolean
    ) {
      info(`--- ${label} ---`)
      const artist = signupProjectId != null ? getArtistForProject(signupProjectId) : null
      const expectedCampaignStatus = signupAction === 'checkout' ? 'cart_abandon' : 'prospect'
      let subscriberId: number | null = null

      const { logs } = await captureLogs(async () => {
        const syncPromises: Promise<unknown>[] = [
          safeLoopsContact(
            TEST_EMAIL,
            { campaignStatus: expectedCampaignStatus, ...(artist && { artistInterest: artist }) },
            userId
          ),
          safeLoopsEvent(TEST_EMAIL, 'accountCreated'),
        ]
        if (artist) {
          syncPromises.push(
            (async () => {
              subscriberId = await safeKitUpsert(
                artist,
                TEST_EMAIL,
                {
                  campaign_status: expectedCampaignStatus,
                  ...splitFullName(TEST_FULL_NAME),
                },
                userId
              )
              if (subscriberId != null) {
                await Promise.all([
                  safeKitApplyTag(artist, subscriberId, 'interest'),
                  safeKitUpdateCustomField(artist, subscriberId, TEST_EMAIL, 'inertia_user_id', userId),
                ])
              }
            })()
          )
        }
        await Promise.all(syncPromises)
      })

      const { data, error } = await supabase
        .from('profiles')
        .select('loops_sync_status')
        .eq('id', userId)
        .maybeSingle()
      if (error || !data) {
        fail(`[${label}] Could not read profiles row: ${error?.message ?? 'no row found'}`)
      } else if (data.loops_sync_status === 'synced') {
        pass(`[${label}] Loops contact synced (campaignStatus: '${expectedCampaignStatus}'${artist ? `, artistInterest: '${artist}'` : ''})`)
      } else {
        fail(`[${label}] Expected loops_sync_status="synced", got "${data.loops_sync_status}"`)
      }

      if (classifyLoopsCall(logs, 'loops.sendEvent') === 'PASS') {
        pass(`[${label}] accountCreated event fired in Loops (no failure logged)`)
      } else {
        fail(`[${label}] accountCreated event failed — see [emailSync] log above`)
      }

      if (!expectKit) {
        if (subscriberId == null) {
          pass(`[${label}] No KIT sync attempted (no project context)`)
        } else {
          fail(`[${label}] Expected no KIT sync, but a subscriber was created (id=${subscriberId})`)
        }
        return
      }

      if (subscriberId == null) {
        fail(`[${label}] Expected KIT sync to fire but upsertSubscriber returned no id`)
        return
      }
      pass(`[${label}] KIT subscriber upserted (id=${subscriberId})`)

      const interestStatus = classifyKitCall(logs, 'applyTag', 'interest')
      if (interestStatus === 'SKIPPED') skip(`[${label}] inertia_interest tag application (placeholder not configured)`)
      else if (interestStatus === 'PASS') pass(`[${label}] inertia_interest tag applied`)
      else fail(`[${label}] inertia_interest tag application failed — see [emailSync] log above`)

      const userIdFieldStatus = classifyKitCall(logs, 'updateCustomField', 'inertia_user_id')
      if (userIdFieldStatus === 'PASS') pass(`[${label}] inertia_user_id custom field written to KIT subscriber`)
      else fail(`[${label}] inertia_user_id custom field update failed — see [emailSync] log above`)

      // Read the subscriber back from KIT directly (not log inference) to
      // confirm the custom field values actually persisted.
      await verifyKitFields(label, subscriberId, {
        campaign_status: expectedCampaignStatus,
        inertia_user_id: userId,
      })
    }

    await runSignupSyncScenario('action=checkout, projectId=5', 'checkout', 5, true)
    await runSignupSyncScenario('action=waitlist, projectId=5', 'waitlist', 5, true)
    await runSignupSyncScenario('no action, no projectId', undefined, undefined, false)
  }

  // ---------------------------------------------------------------------
  // Step 8: Waitlist sync (replicates src/app/api/waitlist/route.ts)
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(8)) {
    step(8, 'Waitlist sync — SKIPPED')
  } else {
    step(8, 'Waitlist sync (project 5 / Babatunde)')
    const artist = getArtistForProject(5)
    let waitlistSubscriberId: number | null = null
    const { logs } = await captureLogs(async () => {
      const syncPromises: Promise<unknown>[] = [
        safeLoopsContact(TEST_EMAIL, { campaignStatus: 'waitlist' }, userId),
        safeLoopsEvent(TEST_EMAIL, 'waitlistJoined'),
      ]
      if (artist) {
        syncPromises.push(
          (async () => {
            waitlistSubscriberId = await safeKitUpsert(artist, TEST_EMAIL, undefined, userId)
            if (waitlistSubscriberId != null) {
              await Promise.all([
                safeKitApplyTag(artist, waitlistSubscriberId, 'waitlist'),
                safeKitUpdateCustomField(artist, waitlistSubscriberId, TEST_EMAIL, 'campaign_status', 'waitlist'),
                safeKitUpdateCustomField(artist, waitlistSubscriberId, TEST_EMAIL, 'inertia_user_id', userId),
              ])
            }
          })()
        )
      }
      await Promise.all(syncPromises)
    })

    const { data, error } = await supabase
      .from('profiles')
      .select('loops_sync_status')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) {
      fail(`Could not read profiles row: ${error?.message ?? 'no row found'}`)
    } else if (data.loops_sync_status === 'synced') {
      pass("Loops contact updated (campaignStatus: 'waitlist')")
    } else {
      fail(`Expected loops_sync_status="synced", got "${data.loops_sync_status}"`)
    }

    if (classifyLoopsCall(logs, 'loops.sendEvent') === 'PASS') {
      pass('waitlistJoined event fired in Loops (no failure logged)')
    } else {
      fail('waitlistJoined event failed — see [emailSync] log above')
    }

    const waitlistTagStatus = classifyKitCall(logs, 'applyTag', 'waitlist')
    if (waitlistTagStatus === 'SKIPPED') skip('inertia_waitlist tag application (placeholder not configured)')
    else if (waitlistTagStatus === 'PASS') pass('inertia_waitlist tag applied')
    else fail('inertia_waitlist tag application failed — see [emailSync] log above')

    const campaignFieldStatus = classifyKitCall(logs, 'updateCustomField', 'campaign_status')
    if (campaignFieldStatus === 'PASS') pass("campaign_status custom field updated to 'waitlist'")
    else fail('campaign_status custom field update failed — see [emailSync] log above')

    const waitlistUserIdFieldStatus = classifyKitCall(logs, 'updateCustomField', 'inertia_user_id')
    if (waitlistUserIdFieldStatus === 'PASS') pass('inertia_user_id custom field written to KIT subscriber (userId present)')
    else fail('inertia_user_id custom field update failed — see [emailSync] log above')

    // Read the subscriber back from KIT directly (not log inference) to
    // confirm the custom field values actually persisted.
    if (waitlistSubscriberId != null) {
      await verifyKitFields('waitlist sync', waitlistSubscriberId, {
        campaign_status: 'waitlist',
        inertia_user_id: userId,
      })
    }
  }

  // ---------------------------------------------------------------------
  // Step 9: Purchase sync (replicates the "6b" block in
  // src/app/api/webhooks/stripe/route.ts)
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(9)) {
    step(9, 'Purchase sync — SKIPPED')
  } else {
    const artist = getArtistForProject(5)
    const purchaseAmount = (100).toFixed(2)
    let purchaseSubscriberId: number | null = null

    // Look up a real non-wave-1 tier for project 5 so the dynamic wave-tag
    // mapping (resolveWaveLabel + safeKitApplyBuyerWaveTag) can be exercised
    // against something other than the wave-1 default/fallback.
    const { data: babatundeTiers } = await supabase
      .from('tiers')
      .select('id, name')
      .eq('project_id', 5)
    const nonWave1Tier = (babatundeTiers ?? []).find(t => {
      const n = t.name?.match(/\d+/)?.[0]
      return n != null && n !== '1'
    })
    const testTierId: number | null = nonWave1Tier?.id ?? null
    const testTierName: string = nonWave1Tier?.name ?? 'Act 1'
    const expectedWaveNumber = nonWave1Tier ? nonWave1Tier.name.match(/\d+/)?.[0] : '1'
    const expectedWaveTagKey = `buyer_wave_${expectedWaveNumber}`

    step(9, `Purchase sync (project 5 / Babatunde, tier "${testTierName}", amount 100)`)

    let transactionalCalled = false
    const originalFetch = globalThis.fetch
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/transactional')) transactionalCalled = true
      return originalFetch(input, init)
    }) as typeof fetch

    let logs: string[]
    try {
      ;({ logs } = await captureLogs(async () => {
        const syncPromises: Promise<unknown>[] = [
          safeLoopsContact(
            TEST_EMAIL,
            {
              campaignStatus: 'buyer',
              artistInterest: artist ?? 'babatunde',
              tier: testTierName,
              purchaseAmount,
              purchaseDate: new Date().toISOString(),
            },
            userId
          ),
          safeLoopsEvent(TEST_EMAIL, 'backerJoined', {
            projectName: 'Influencer to Artist',
            artistName: 'Babatunde',
            tierName: testTierName,
            amount: purchaseAmount,
            projectId: '5',
          }),
        ]
        if (artist) {
          syncPromises.push(
            (async () => {
              purchaseSubscriberId = await safeKitUpsert(artist, TEST_EMAIL, undefined, userId)
              if (purchaseSubscriberId != null) {
                const waveLabel = await resolveWaveLabel(artist, testTierId)
                await Promise.all([
                  safeKitApplyTag(artist, purchaseSubscriberId, 'buyer'),
                  safeKitApplyBuyerWaveTag(artist, purchaseSubscriberId, waveLabel),
                  safeKitApplyTag(artist, purchaseSubscriberId, 'purchased_any'),
                  safeKitApplyTag(artist, purchaseSubscriberId, 'do_not_promote'),
                  safeKitRemoveTag(artist, purchaseSubscriberId, 'waitlist'),
                  safeKitUpdateCustomField(artist, purchaseSubscriberId, TEST_EMAIL, 'campaign_status', 'buyer'),
                  safeKitUpdateCustomField(artist, purchaseSubscriberId, TEST_EMAIL, 'purchase_tier', testTierName),
                  safeKitUpdateCustomField(artist, purchaseSubscriberId, TEST_EMAIL, 'inertia_user_id', userId),
                ])
              }
            })()
          )
        }
        await Promise.all(syncPromises)
      }))
    } finally {
      globalThis.fetch = originalFetch
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('loops_sync_status')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) {
      fail(`Could not read profiles row: ${error?.message ?? 'no row found'}`)
    } else if (data.loops_sync_status === 'synced') {
      pass(`Loops contact updated (campaignStatus: 'buyer', tier: '${testTierName}', purchaseAmount: 100.00)`)
    } else {
      fail(`Expected loops_sync_status="synced", got "${data.loops_sync_status}"`)
    }

    if (classifyLoopsCall(logs, 'loops.sendEvent') === 'PASS') {
      pass('backerJoined event fired in Loops (no failure logged)')
    } else {
      fail('backerJoined event failed — see [emailSync] log above')
    }

    const buyerTagStatus = classifyKitCall(logs, 'applyTag', 'buyer')
    if (buyerTagStatus === 'SKIPPED') skip('inertia_buyer tag application (placeholder not configured)')
    else if (buyerTagStatus === 'PASS') pass('inertia_buyer tag applied')
    else fail('inertia_buyer tag application failed — see [emailSync] log above')

    const doNotPromoteStatus = classifyKitCall(logs, 'applyTag', 'do_not_promote')
    if (doNotPromoteStatus === 'SKIPPED') skip('inertia_do_not_promote tag application (placeholder not configured)')
    else if (doNotPromoteStatus === 'PASS') pass('inertia_do_not_promote tag applied')
    else fail('inertia_do_not_promote tag application failed — see [emailSync] log above')

    const purchaseUserIdFieldStatus = classifyKitCall(logs, 'updateCustomField', 'inertia_user_id')
    if (purchaseUserIdFieldStatus === 'PASS') pass('inertia_user_id custom field written to KIT subscriber after purchase')
    else fail('inertia_user_id custom field update failed — see [emailSync] log above')

    // Read the subscriber back from KIT directly (not log inference) to
    // confirm the custom field values actually persisted.
    if (purchaseSubscriberId != null) {
      await verifyKitFields('purchase sync', purchaseSubscriberId, {
        campaign_status: 'buyer',
        purchase_tier: testTierName,
        inertia_user_id: userId,
      })
    }

    if (nonWave1Tier) {
      const waveTagStatus = classifyKitCall(logs, 'applyTag', expectedWaveTagKey)
      if (waveTagStatus === 'SKIPPED') {
        skip(`${expectedWaveTagKey} tag application for tier "${testTierName}" (placeholder not configured)`)
      } else if (waveTagStatus === 'PASS') {
        pass(`Dynamic wave tag correctly resolved to ${expectedWaveTagKey} for tier "${testTierName}" (id=${testTierId}) — not the wave-1 default`)
      } else {
        fail(`${expectedWaveTagKey} tag application failed for tier "${testTierName}" — see [emailSync] log above`)
      }
    } else {
      manualVerify(
        `No tier other than wave 1 exists for Babatunde (project 5) in this database, so the dynamic ` +
        `buyer_wave_N mapping could only be exercised against the wave-1 default/fallback path — it has NOT ` +
        `been proven to correctly resolve buyer_wave_2 or buyer_wave_3 for a real non-wave-1 tier. To close this ` +
        `gap, create a second tier for project 5 with a digit other than "1" in its name (e.g. "Act 2") and rerun ` +
        `--steps=9.`
      )
    }

    if (!transactionalCalled) {
      pass('Both existing sendTransactionalEmail (/transactional) calls were NOT fired — Stripe-only, correctly excluded from this test')
    } else {
      fail('Unexpected call to a /transactional endpoint during purchase sync test')
    }
  }

  // ---------------------------------------------------------------------
  // Step 10: Profile completion sync (replicates
  // src/app/api/profile/sync-complete/route.ts)
  // ---------------------------------------------------------------------
  if (!selectedSteps.has(10)) {
    step(10, 'Profile completion sync — SKIPPED')
  } else {
    step(10, 'Profile completion sync (contributions -> project 5 / Babatunde)')
    info('Simulating the route\'s contributions lookup as project 5 directly,')
    info('rather than inserting a real row into the contributions table.')
    const artist = getArtistForProject(5)
    let profileSubscriberId: number | null = null
    const { logs } = await captureLogs(async () => {
      const syncPromises: Promise<unknown>[] = [
        safeLoopsContact(TEST_EMAIL, { profileStatus: 'complete' }, userId),
      ]
      if (artist) {
        syncPromises.push(
          (async () => {
            profileSubscriberId = await safeKitUpsert(artist, TEST_EMAIL, undefined, userId)
            if (profileSubscriberId != null) {
              await Promise.all([
                safeKitApplyTag(artist, profileSubscriberId, 'profile_completed'),
                safeKitUpdateCustomField(artist, profileSubscriberId, TEST_EMAIL, 'profile_status', 'complete'),
                safeKitUpdateCustomField(artist, profileSubscriberId, TEST_EMAIL, 'inertia_user_id', userId),
              ])
            }
          })()
        )
      }
      await Promise.all(syncPromises)
    })

    const { data, error } = await supabase
      .from('profiles')
      .select('loops_sync_status')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) {
      fail(`Could not read profiles row: ${error?.message ?? 'no row found'}`)
    } else if (data.loops_sync_status === 'synced') {
      pass("Loops contact updated (profileStatus: 'complete')")
    } else {
      fail(`Expected loops_sync_status="synced", got "${data.loops_sync_status}"`)
    }

    const profileTagStatus = classifyKitCall(logs, 'applyTag', 'profile_completed')
    if (profileTagStatus === 'SKIPPED') skip('inertia_profile_completed tag application (placeholder not configured)')
    else if (profileTagStatus === 'PASS') pass('inertia_profile_completed tag applied')
    else fail('inertia_profile_completed tag application failed — see [emailSync] log above')

    const profileFieldStatus = classifyKitCall(logs, 'updateCustomField', 'profile_status')
    if (profileFieldStatus === 'PASS') pass("profile_status custom field updated to 'complete'")
    else fail('profile_status custom field update failed — see [emailSync] log above')

    const profileUserIdFieldStatus = classifyKitCall(logs, 'updateCustomField', 'inertia_user_id')
    if (profileUserIdFieldStatus === 'PASS') pass('inertia_user_id custom field written to KIT subscriber')
    else fail('inertia_user_id custom field update failed — see [emailSync] log above')

    // Read the subscriber back from KIT directly (not log inference) to
    // confirm the custom field values actually persisted.
    if (profileSubscriberId != null) {
      await verifyKitFields('profile completion sync', profileSubscriberId, {
        profile_status: 'complete',
        inertia_user_id: userId,
      })
    }
  }

  console.log('\n=== Done ===')
}

main().catch(err => {
  console.error('\nUnhandled error in test script:')
  console.error(err)
  process.exit(1)
})
