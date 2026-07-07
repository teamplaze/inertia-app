# Inertia — Claude Code Project Brief

## Project
Music project crowdfunding platform.
Next.js 14, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase.

## Styling conventions
- Brand colors in JS/inline style contexts → BRAND.* from src/lib/colors.ts
- Brand colors in Tailwind → brand-* utilities (bg-brand-copper, text-brand-teal, etc.)
- Dark card surfaces → <DarkCard> from src/components/ui/card-dark.tsx
- Auth/dark form inputs → <Input variant="dark">
- Card style objects → regularCardStyle / gradientCardStyle from src/lib/cardStyles.ts

## Hard rules
- Never hardcode hex values in .tsx files
- Never use Tailwind arbitrary values [#hex] for brand colors
- BudgetBreakdown.tsx — removed. Replaced by MilestonesList (pending).
- Textarea does not have a variant prop — use className for overrides

## Token locations
- src/lib/colors.ts — BRAND constants for all JS contexts
- src/globals.css — --color-brand-* for all Tailwind utilities
- src/components/ui/card-dark.tsx — DarkCard wrapper
- src/components/ui/input.tsx — Input CVA variants including "dark"
- src/lib/cardStyles.ts — regularCardStyle, gradientCardStyle

## Reskin Status

### Completed ✅
- Navigation.tsx — floating pill, white gradient,
  STAY. INDIE. tagline, person icon/avatar auth
- Footer.tsx — teal radial gradient, full-width
  wordmark, nav links + copyright
- /projects/[id] — full project page:
  - ProjectHero (gradient, ProgressBar, Support btn,
    View project results link)
  - About section (bio + A note from artist accordion)
  - MilestonesList (active/locked/completed states)
  - Support Levels (WaveCard + DonateCard)
  - PerksSection (Inertia Perks always first,
    has_royalties flag, accent icon colors)
  - Fan Stories (carousel 4+ cards, static grid 1-3,
    max 6 randomized, TestimonialCard)
  - FAQSection (accordion, 10 hardcoded Q&A)
- / (homepage) — hero, featured projects carousel,
  text+image section, comparison cards
- /sign-up — AuthCard, field errors, validate(),
  password toggle, Terms dialog restyled
- /login — AuthCard, field errors, password toggle
- /forgot-password — AuthCard, success state
- /reset-password — AuthCard, dual password toggle,
  success state + 3s redirect
- /network — AuthCard (max-w-768px), 10 fields,
  Select + Textarea restyled, validate()
- /account — in-app hub layout, sidebar nav,
  ContributionsTable (sort controls, contribution
  cards, empty first-run state)
- /account/profile — ProfileForm (card sections,
  labels, inputs, aria-invalid error states,
  success indicator, save button)

### Remaining ⬜
- /artist/dashboard
- /success

## Key Patterns — Reskin Conventions

### AuthCard pattern (all auth + form pages)
Component: src/components/ui/auth-card.tsx
- Black full-screen bg, centered card
- Card: #0f1111 bg, 1px solid #3f4948 border,
  rounded-[12px], p-[var(--spacing-8)]
- max-w-[560px] default, overridable via className
- Top padding: pt-[96px] mobile / pt-[120px] desktop
  to clear fixed navigation
- No logo (navigation handles branding)

### Form pattern (all forms)
- noValidate on all <form> elements
- errors state object with per-field keys
- validate() function runs on submit before API call
- aria-invalid={!!errors.fieldName} on all inputs
- Error text: text-[#ff8383] hardcoded (not token —
  Tailwind v4 cannot infer color from CSS var)
- Success: teal alert box replaces form
- General API errors → errors.general

### Tailwind v4 known bugs — critical
1. text-[var(--font-size-*)] generates color: not
   font-size: — use hardcoded px instead:
   text-[32px] not text-[var(--font-size-h4)]
2. bg-[--token] without var() generates empty rule —
   always use bg-[var(--token)]
3. text-[--token] without var() generates empty rule —
   always use text-[var(--token)]
4. md:text-[var(--*)] responsive variants with CSS
   vars don't generate — use hardcoded px for all
   responsive font sizes

### Typography — heading sizes (hardcoded px)
All responsive heading sizes use hardcoded px:
- H2: text-[48px]
- H3: text-[40px]
- H4: text-[32px] desktop / text-[20px] mobile
- H5: text-[20px]
- H6: text-[18px] desktop / text-[16px] mobile
Section headings: text-[20px] md:text-[32px]

### Section spacing (project page)
All sections: py-[var(--spacing-12)] md:py-[120px]
Horizontal: px-[var(--spacing-5)] md:px-[96px]

### Accent color cascade
Project accent set on <main> as inline style:
  style={{ '--color-project-accent': project.project_colors?.[0] }}
All child components reference directly:
  var(--color-project-accent, var(--color-bg-teal))
Never use intermediary tokens — they can't inherit
inline style cascade.

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
4 weights: Regular(400), Medium(500),
  Bold(600), Black(700)
Loaded via localFont() in layout.tsx
CSS var: --font-made-outer-sans → --font-heading

### has_royalties flag
Column on projects table, default true
Gold Steps (id=2) and Twist It (id=4) = false
Controls Inertia Perks description in PerksSection:
  false → omits royalties mention

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
Sidebar: col-span-1, #0f1111 bg, #3f4948 border,
  rounded-[12px], font-heading text-[20px] heading
Content: col-span-3, children

## Self-directed Design Decisions

These were made without a designer spec and are
deliberate choices — do not revert mistaking them
for placeholders.

### /account hub (2026-07-07)
- **Sidebar active state**: bg-white/10 — neutral
  on-dark tint; teal is reserved for actionable and
  success states, not nav selection highlights
- **Sort buttons**: variant="primary" active /
  variant="border" inactive — reuses existing button
  states, introduces no new patterns
- **Contribution amount color**: text-white — amount
  is factual display data; green/teal reserved for
  action confirmation, not financial values
- **Empty state (no contributions)**: icon + heading
  + subtext + CTA to /#featured-projects, inline in
  ContributionsTable; not extracted — two items too
  small to justify a shared component
- **Sidebar nav**: inline in layout.tsx — two links
  too few to justify a shared component
- **Profile card sections**: inline #0f1111 / #3f4948
  style, not DarkCard — DarkCard update deferred to
  dashboard reskin to avoid touching unreskinned
  dashboard surfaces prematurely
- **Nav-clearance coupling**: pt-[96px] md:pt-[120px]
  is currently baked into AuthCard, so every AuthCard
  page gets it automatically. /account is the first
  non-AuthCard authenticated page to need clearance;
  /artist/dashboard and /success will hit the same
  issue. Decision: apply locally per layout for now
  (pt-[96px] md:pt-[120px] on the outer container in
  account/layout.tsx). Revisit hoisting to a shared
  authenticated shell when /artist/dashboard is
  reskinned and we can see all consumers — same
  deferral logic as DarkCard.

## Designer Requests — Net New Components Needed

These UI patterns appear across multiple pages but have 
no component spec in the UI kit. Each needs a Figma 
spec before implementation.

### High Priority (blocks multiple pages)
1. AuthCard — branded container used on all auth pages
   (login, sign-up, forgot-password, reset-password, network)
   Current: inline BRAND.teal bg + BRAND.copper border
   Needed: reusable wrapper component with spec

2. Project Grid Card — homepage + browse surfaces
   Shows: project image, title, artist name, 
   funding progress bar, CTA button
   Different from ArtistCard and TextCard

3. Hero Section — homepage + project page
   Shows: background treatment, heading, subtext, CTAs
   Needs: desktop + mobile spec

4. Form Feedback (inline error/success) — all forms
   Current: ad hoc text-red-400 / text-green-300
   Needed: Input error state + form-level message component
   Note: already flagged in Designer Feedback Required

### Medium Priority
5. Stats Card — artist dashboard
   Shows: large metric number + label, repeated 4+ times
   Needed: desktop + mobile spec

6. Status Badge — semantic variants
   Current Badge has default + highlight only
   Needed: success, warning, error, pending variants

7. Success/Confirmation Card — /success page
   Shows: icon + heading + body + CTA
   Needed: spec for post-action confirmation state

8. Empty State — artist/dashboard surfaces
   Shows: icon + heading + subtext + optional CTA
   /account implemented self-directed (see Self-directed
   Design Decisions). Dashboard still needs spec or
   a matching self-directed decision.

### Low Priority
9. Copy Button — admin invite page
   clipboard copy with icon swap (Copy → Check)
   Could self-implement without spec

10. Divider — artist dashboard
    Horizontal/vertical separator rule
    Could self-implement without spec

## Designer Feedback Required

These items are missing from the UI kit and need to be 
defined before implementation is complete. Share with 
designer for completion.

### Buttons
- No error state defined
- No loading/spinner state defined

### Inputs
- No error state defined (border color, text color, 
  error message style)
- No disabled state defined
- No label component defined (inputs are bare fields only)
- No helper text / error message text component defined
- Textarea font size inconsistency — spec shows 16px but 
  Input uses 18px. Confirm intended value.
- Textarea font family token references fallback Inter 
  instead of Albert Sans — confirm intended font

### Accordion (Basic)
- No hover state defined
- No disabled state defined
- No focus/keyboard state defined
- No animation/transition specified (duration, easing, 
  direction)
- No divider style defined between stacked accordion items
- Desktop expanded icon: stays as add (+) — confirm whether 
  this is intentional or should rotate/change to close (×)
- Mobile icon behavior (add → close) not replicated on 
  desktop — confirm intentional

### Accordion (Milestone)
- No hover state defined
- No focus/keyboard state defined
- No animation/transition specified
- No divider style between stacked milestone items
- Material Symbols Rounded font not yet installed — 
  check (✓) and add (+) / close (×) icons are placeholders
  until dependency is added

### Alert
- No severity variants defined (info/success/warning/error) — 
  all alerts look identical regardless of meaning. Confirm 
  whether variants are needed or if single-variant is intentional.
- No dismiss/close button defined — confirm whether alerts 
  are dismissible
- Background is rgba(38,44,43,0.15) at 15% opacity — very 
  subtle on dark backgrounds. Confirm this is intentional.
- Icon is fixed to timer glyph with boolean show/hide only — 
  confirm whether icon should be swappable per usage context
- Secondary text role unclear — right-aligned and semibold, 
  may be intended as a CTA or action link rather than 
  descriptive text. Confirm intended use.

### Badge
- Full spec not yet pulled — pending

### Carousel
- Full spec not yet pulled — pending

### Progress Bar
- Full spec not yet pulled — pending

### Text Callout
- Full spec not yet pulled — pending

### Logo
- Full spec not yet pulled — pending

### Cards
- Full spec not yet pulled — pending

### Global
- Material Symbols Rounded — installed via npm package 
  material-symbols, imported in globals.css. Use class 
  material-symbols-rounded with icon name as text content.
- Focus/keyboard states not defined on most components — 
  needed for accessibility compliance
- No motion/animation system defined — transitions, 
  durations, and easing curves not specified anywhere 
  in the UI kit

## Designer Follow-ups (open)
- Fan Stories desktop: carousel vs 2-column grid
  (node 751-5259 shows grid, mobile uses carousel,
  awaiting confirmation)
- Heading font weight: 500 vs 600 (currently 500,
  spec says 600, visual check favors 500)
- Textarea font: spec shows Inter fallback but
  Albert Sans used — confirm intended font
- Textarea font size: spec 16px, impl 18px —
  confirm intended size
- Focus ring color: #bfdcd9 dark, #9ecac6 light —
  confirm light mode value if shipped
- Accordion hover/focus/disabled states not defined
- Alert severity variants not defined
- Badge full spec not pulled

## Pending Designer Specs (blocking)
- Stats Card (artist dashboard)
- Status Badge variants (success/warning/error/pending)
- Success/Confirmation Card (/success page)
- Empty State (artist/dashboard only — /account done)

## Open Issues
- WaveCard: closed state doesn't auto-update when
  sale_end_at passes without page reload
  SQL to manually close: UPDATE tiers SET status='closed'
  WHERE sale_end_at < NOW() AND status='active'
- Focus ring color :root vs .dark mismatch
- Navigation mobile: further review may be needed
- text-[--color-text-*] classes without var() may
  generate empty rules — use text-[var(--color-text-*)]
  or hardcoded hex values
