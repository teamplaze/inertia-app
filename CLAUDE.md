# Inertia — Claude Code Project Brief

## Project
Music artist crowdfunding and fan membership platform (The Inertia Project).
Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Supabase. Deployed on Vercel.

Three proof-of-concept campaigns are complete or live: Twist It, Babatunde, Gold Steps.
The codebase is moving into a build phase.

## Current goals (build phase)
Focus: remove the biggest pain points that come up while a project is live. Admin inputs will eventually
get a UI, but that is not needed yet — do not build one.

1. **Smoother data entry for new waves.** Perks (`tier_perks`) and budget numbers are loaded into the DB
   by hand today. Goal: an agent or project where Ian supplies raw input and the required import
   files/SQL are generated automatically, which he can review and tweak before applying.
2. **Email list management and sync.** When a new wave launches, a separate tag and segment should be
   created in KIT automatically. Also simplify the tagging system as a whole, then write an artist-facing
   guide covering what each tag means and how to send communications with them.
3. **Email sending flow.** The current flow is: generate a template in Claude, preview it in an MJML
   previewer, tweak with AI, save iterations, and upload files to Loops. Goals: (a) transactional email
   templates editable in an easy drag-and-drop editor; (b) automated DRIP emails so Discord updates to
   backers are no longer sent manually.
4. **Database and codebase audit.** The new UI left stale DB columns and likely outdated files. Walk
   through, review, and clean up what is no longer relevant. This is collaborative: propose removals with
   evidence (usage in code, usage in DB) and never drop a column or delete a file unilaterally.
   Known candidate to review: the status Badge helper on the artist dashboard accepts `active` / `Live`, which
   are not real `projects.status` values.

### Suggested build order
1. Audit the tables in scope for goal 1 (`tier_perks`, budget tables) before building any importers.
2. Goal 2 as a chain: simplify the KIT tag scheme → automate per-wave tag + segment → write the artist guide.
3. Goal 1 import generator, once step 1 has settled the schema.
4. Goal 3 (templates, DRIP) is Loops-side and can run in parallel with any step. First check whether the
   Loops built-in visual editor already covers drag-and-drop before adding tooling or integrations.
5. Finish the rest of the goal 4 audit.

## Workflow rules
- For non-trivial changes, start with a read-only assessment: report findings, make no edits.
  Implement only after the findings are reviewed.
- Implementation work uses exact field/column names, and respects any file exclusions given.
- Final gate before reporting done: `npx tsc --noEmit` must pass.
- Never assume the production schema matches dev. Check before shipping anything that needs new columns.

## Hard rules
- Never hardcode brand palette hex values in .tsx files — use BRAND.* (JS) or brand-* utilities (Tailwind).
- Never use Tailwind arbitrary values [#hex] for brand colors.
- Approved non-brand UI hex values (they exist because Tailwind v4 cannot infer color from CSS vars):
  #0f1111 (dark surface), #3f4948 (dark border), #bfdcd9 (focus ring), #ff8383 (error text).
  Do not introduce new hardcoded hex values beyond these without asking.
- BudgetBreakdown.tsx — removed. Replaced by MilestonesList.
- Textarea does not have a variant prop — use className for overrides.

## Styling conventions
- Brand colors in JS/inline style contexts → BRAND.* from src/lib/colors.ts
- Brand colors in Tailwind → brand-* utilities (bg-brand-copper, text-brand-teal, etc.)
- Dark card surfaces → <DarkCard> from src/components/ui/card-dark.tsx
- Auth/dark form inputs → <Input variant="dark">
- Card style objects → regularCardStyle / gradientCardStyle from src/lib/cardStyles.ts

## Token locations
- src/lib/colors.ts — BRAND constants for all JS contexts
- src/globals.css — --color-brand-* for all Tailwind utilities
- src/components/ui/card-dark.tsx — DarkCard wrapper
- src/components/ui/input.tsx — Input CVA variants including "dark"
- src/lib/cardStyles.ts — regularCardStyle, gradientCardStyle

## Data layer

### Single source of truth
- All Supabase project queries go through src/lib/fetchProject.ts. Do not query `projects` directly in pages or components.
- src/app/[slug]/page.tsx and src/app/projects/[id]/page.tsx are thin wrappers (~22 lines each) around fetchProject. Keep them thin.

### Table and column conventions
- `projects`: id, created_at, artist_name, project_title (not `name`), project_image_url, funding_goal,
  current_funding, status, artist_profile_image_url, artist_bio, audio_preview_url, backer_count,
  artist_message_video_url, from_the_artist_message, slug, donation_link, spotify_artist_id,
  video_thumbnail_url, video_url, project_colors (array; first entry = accent), has_royalties, discord_invite_url
- `projects.status` is a free string: no DB check constraint or enum, typed as `string` in src/types.ts.
  App code expects `Fundraising`, `Coming Soon`, `Completed` — match these exactly (see Open Issues: DB rows may hold `Complete`).
- `profiles`: name column is `full_name` (not `display_name`)
- `tiers`: `name` holds the wave name (e.g. "Wave 1"); also `status` (constrained to `upcoming` / `active` / `closed`), `sale_start_at`, `sale_end_at`
- `tier_perks`: label, is_exclusive, sort_order, category (replaced the old flat `perks text[]` column)
- `contributions`: purchases — backer_email, tier_id, project_id, user_id, created_at
- `waitlist` table (partial unique indexes) + `waitlist_email_list` view
- `project_milestones`
- No generated Supabase types file exists in the repo; `projects` is typed by hand in src/types.ts.

### Rules
- After any CSV import with explicit IDs, fix the sequence:
  `SELECT setval(pg_get_serial_sequence('<table>', 'id'), (SELECT MAX(id) FROM <table));`
- Tier scheduling uses sale_start_at / sale_end_at with `America/Chicago` timezone casting.
  `tiers.status` must be flipped manually — there is no auto-scheduler (see Open Issues).
- `has_royalties` (projects, default true) is data, not code. Never hardcode project IDs or artist names for it.
  Currently false only for Gold Steps (slug: gold-steps-tour).

## Email and lifecycle sync

### Current architecture
- Loops.so — all transactional and post-purchase DRIP emails (Inertia-owned).
- KIT — broadcast ESP for artist campaigns (Inertia-managed on behalf of artists).
- src/lib/emailSync.ts — sync logic. `ARTIST_KIT_CONFIG` is the single source of truth for per-artist
  KIT API keys and tag IDs. Both entries (`babatunde`, `goldsteps`) are fully configured with 10 tags each.
- Sync fires at four trigger points: sign-up, waitlist, purchase, profile completion.
- Sync state is tracked with the `email_sync_status` enum.
- Post-purchase DRIP (Babatunde): 3 emails (Day 2, 4, 7), triggered by the custom Loops event
  `backerJoined`, separate from the transactional receipt. Copy drafted; MJML build pending.

### API gotchas
- Loops: `userId` must be sent in the request body.
- KIT `applyTag`: subscriber ID goes in the URL path, not the body.
- Do not write `artistInterest` to KIT.

### Onboarding a new artist (current process)
1. Add an entry to ARTIST_KIT_CONFIG with real KIT tag IDs.
2. If the artist uses another ESP (Mailchimp, Beehiiv, Brevo…), migrate their list to KIT via CSV import.
   Do not build new per-ESP integrations — each one adds an API client, tag conventions, suppression logic, and maintenance.

### Under evaluation — do not build against these yet
- Loops stays the transactional/DRIP layer for now.
- Considering either partnering with additional email services or choosing a preferred partner the
  platform integrates with natively. OnPitch is the candidate being investigated for a tight integration.
- Goal: replace the hand-built MJML → Loops upload flow with something better (see Current goals, #3).
- Goal: simplify the KIT tagging scheme and auto-create a tag + segment per new wave (see Current goals, #2).
- Longer term: an in-house CRM layer in Supabase (contacts, segmentation, lifecycle state) with sending
  still delegated to external providers. Not viable until deliverability expertise or budget exists.

## Analytics and feature flags
- PostHog `purchase_completed` has two independent call sites for the same purchase:
  - Stripe webhook (src/app/api/webhooks/stripe/route.ts): server-side via `posthog-node`, production only,
    distinctId = userId ?? session.id, `source: 'webhook'`. Duplicate webhook deliveries are stopped upstream
    by the unique constraint on the contributions insert.
  - /success page (src/app/success/PurchaseCompletedEvent.tsx): client-side `posthog.capture`, `source: 'success_page'`,
    fires on every mount, so a page refresh fires it again.
  - Both include `stripe_session_id`, but nothing de-duplicates on it (see Open Issues).
- Feature flags live in src/lib/featureFlags.ts. `SHOW_SLOT_LIMITS` gates slot-limit display.

## Reskin status

### Complete
- Navigation, Footer, / (homepage)
- /projects/[id] (also served at /[slug]): ProjectHero, About (bio + artist-note accordion), MilestonesList,
  Support Levels (WaveCard + DonateCard, TierCard, CountdownTimer, waitlist flow), PerksSection,
  Fan Stories, FAQSection (10 hardcoded Q&A)
- Auth pages: /sign-up, /login, /forgot-password, /reset-password
- /network, /account, /account/profile, /success

### Remaining
- /artist/dashboard
- Artist invite page (/admin/invite, src/app/admin/invite/page.tsx)

## Key patterns — reskin conventions

### AuthCard pattern (all auth + form pages)
Component: src/components/ui/auth-card.tsx
- Black full-screen bg, centered card
- Card: #0f1111 bg, 1px solid #3f4948 border, rounded-[12px], p-[var(--spacing-8)]
- max-w-[560px] default, overridable via className
- Top padding: pt-[96px] mobile / pt-[120px] desktop to clear fixed navigation
- No logo (navigation handles branding)

### Form pattern (all forms)
- noValidate on all <form> elements
- errors state object with per-field keys
- validate() function runs on submit before API call
- aria-invalid={!!errors.fieldName} on all inputs
- Error text: text-[#ff8383] hardcoded (not token — Tailwind v4 cannot infer color from CSS var)
- Success: teal alert box replaces form
- General API errors → errors.general

### Tailwind v4 known bugs — critical
1. text-[var(--font-size-*)] generates color: not font-size: — use hardcoded px instead:
   text-[32px] not text-[var(--font-size-h4)]
2. bg-[--token] without var() generates an empty rule — always use bg-[var(--token)]
3. text-[--token] (including text-[--color-text-*]) without var() generates an empty rule —
   always use text-[var(--token)] or hardcoded hex from the approved list
4. md:text-[var(--*)] responsive variants with CSS vars don't generate — use hardcoded px for all responsive font sizes
5. CLAUDE.md content is scanned as class candidates — keep `@source not "../../CLAUDE.md"` in globals.css

### Typography — heading sizes (hardcoded px)
- H2: text-[48px]
- H3: text-[40px]
- H4: text-[32px] desktop / text-[20px] mobile
- H5: text-[20px]
- H6: text-[18px] desktop / text-[16px] mobile
- Section headings: text-[20px] md:text-[32px]

### Icons
Material Symbols Rounded — installed via the `material-symbols` npm package, imported in globals.css.
Use class `material-symbols-rounded` with the icon name as text content.

### Section spacing (project page)
All sections: py-[var(--spacing-12)] md:py-[120px]
Horizontal: px-[var(--spacing-5)] md:px-[96px]

### Accent color cascade
Project accent set on <main> as inline style:
  style={{ '--color-project-accent': project.project_colors?.[0] }}
All child components reference directly:
  var(--color-project-accent, var(--color-bg-teal))
Never use intermediary tokens — they can't inherit the inline style cascade.

### Button component (src/components/ui/button.tsx)
Variants: primary, border, link, ghost, outline
Sizes: sm (14px), default (16px), lg (18px)
Primary: bg-[var(--interactive-bg-primary)] text-black
  hover: bg-[var(--interactive-bg-hover-primary)]
Border: border-2 border-white text-white
  hover: border teal text teal
All font sizes hardcoded px (not token)

### Input component (src/components/ui/input.tsx)
Dark surface: bg-[var(--input-bg-default)] #0f1111
Border: var(--input-border-default) #3f4948
Active: bg black, border white
Focus: border-2 #bfdcd9
Error: aria-invalid → red border + red text

### Select component (src/components/ui/select.tsx)
Fully restyled to dark design system
Chevron: Material Symbol keyboard_arrow_down 24px
18px Albert Sans, rounded-none
SelectContent: #0f1111 bg, dark border

### Textarea component (src/components/ui/textarea.tsx)
Dark surface matching Input
resize-none, min-h-[180px]
aria-invalid error state

### Commercial font
MADE Outer Sans commercial files in public/fonts/
4 weights: Regular(400), Medium(500), Bold(600), Black(700)
Loaded via localFont() in layout.tsx
CSS var: --font-made-outer-sans → --font-heading
Heading weight in use: 500. The base h1–h6 rule uses `--font-weight-semibold`, which is 500 despite its name;
components also add `font-medium` explicitly.

### Project page states
- Only projects with status `Fundraising` render the full page; every other status (`Coming Soon`, `Completed`) renders
  ProjectHero only. Gated by `isActiveFundraising` in src/app/projects/[id]/project-client-ui.tsx. ProjectHero's own
  funding UI is gated separately by `showFundingUI`.

### has_royalties flag
Column on projects table, default true. Read from data (see Data layer).
Controls the Inertia Perks description in PerksSection: false → omits the royalties mention.

### Fan Stories carousel rules
- 1-3 cards: static centered grid, no controls
- 4+ cards: carousel with CarouselControls
- Max 6 cards, randomized order via useMemo
- Mobile: single card full width, % translateX
- Desktop: fixed 394px cards, pixel translateX

### Homepage project cards
- 1-3 projects: static flex-row, flex-1 cards
- 4+ projects: carousel, 400px fixed cards
- Sort order: Fundraising → Coming Soon → Completed
- API: /api/projects/featured (no limit)

### In-app hub pattern (/account)
Not an AuthCard surface. Sidebar + content grid:
  container mx-auto px-4 py-12 max-w-7xl
  grid grid-cols-1 md:grid-cols-4 gap-8
Sidebar: col-span-1, #0f1111 bg, #3f4948 border, rounded-[12px], font-heading text-[20px] heading
Content: col-span-3, children

## Self-directed design decisions

These were made without a designer spec and are deliberate choices — do not revert mistaking them for placeholders.

### /account hub (2026-07-07)
- **Sidebar active state**: bg-white/10 — neutral on-dark tint; teal is reserved for actionable and
  success states, not nav selection highlights
- **Sort buttons**: variant="primary" active / variant="border" inactive — reuses existing button
  states, introduces no new patterns
- **Contribution amount color**: text-white — amount is factual display data; green/teal reserved for
  action confirmation, not financial values
- **Empty state (no contributions)**: icon + heading + subtext + CTA to /#featured-projects, inline in
  ContributionsTable; not extracted — two items too small to justify a shared component
- **Sidebar nav**: inline in layout.tsx — two links too few to justify a shared component
- **Profile card sections**: inline #0f1111 / #3f4948 style, not DarkCard — DarkCard update deferred to
  dashboard reskin to avoid touching unreskinned dashboard surfaces prematurely
- **Nav-clearance coupling**: pt-[96px] md:pt-[120px] is currently baked into AuthCard, so every AuthCard
  page gets it automatically. /account is the first non-AuthCard authenticated page to need clearance;
  /success, /artist/dashboard, and /admin/invite hit the same issue and currently handle it inconsistently (see below). Decision: apply locally per layout
  for now (pt-[96px] md:pt-[120px] on the outer container in account/layout.tsx). Revisit hoisting to a
  shared authenticated shell when /artist/dashboard is reskinned and we can see all consumers — same
  deferral logic as DarkCard.
  Current state: /success uses a flat pt-[120px] (no mobile variant); /artist/dashboard has no clearance, so its
  sticky top-0 header is overlapped by the fixed nav; /admin/invite uses py-20 (80px), below the 96px/120px
  convention (content is vertically centered, so overlap is unlikely in practice).

### PerksSection (2026-07-09)
- **All six categories render unconditionally**: removed the `availableCategories.has(cat)` filter so
  CATEGORY_ORDER always renders in full regardless of which categories appear in tier_perks. Reasoning:
  the section is a platform-level explainer of what Inertia perk categories can include; per-project
  specifics live in the tier cards below. Consistent six-category layout also resolves the
  sparse-whitespace issue on projects with few perk categories, since md:py-[120px] was calibrated for
  three grid rows.
- **ALWAYS_SHOW removed**: was redundant once all six render unconditionally; "Inertia Perks" stays first
  by position in CATEGORY_ORDER.
- **Unknown-category warn**: tier_perks rows with a category outside CATEGORY_ORDER emit a console.warn in
  development naming the category and the tier(s) it came from. Silently skipped in production (no broken
  tile rendered).

## Open issues
- WaveCard: closed state doesn't auto-update when sale_end_at passes without a page reload.
  SQL to manually close: UPDATE tiers SET status='closed' WHERE sale_end_at < NOW() AND status='active'
- Focus ring color :root vs .dark mismatch (dark #bfdcd9, light #9ecac6 — confirm light value if light mode ships)
- Navigation mobile: further review may be needed
- `projects.status` mismatch: the DB export showed `Complete` for Twist It and Gold Steps, but code compares against
  `Completed` (ContributionsTable, featured route sort map, ProjectHero, project-client-ui). Verify with
  `SELECT DISTINCT status FROM projects;` and align the DB or the code.
- `purchase_completed` can be double-counted: it fires from both the Stripe webhook and the /success page with no shared
  dedup key, and refreshing /success fires the client event again.
- /artist/dashboard: sticky header is overlapped by the fixed nav (no clearance applied).