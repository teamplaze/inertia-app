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

## Reskin status
Pre-reskin refactor complete. Design specs incoming from Figma.

Surfaces that update automatically when tokens change:
- All 13 shadcn primitives (Button, Card, Input base, Badge, etc.)

Surfaces requiring manual update when specs arrive:
- Header.tsx — inline rgba + 5 arbitrary classes (~8 lines)
- Footer.tsx — inline style object (~2 lines)
- layout.tsx — body background inline (1 line)
- page.tsx — two style objects + 8 arbitrary classes (~15 lines)
- project-client-ui.tsx — largest offender (~25 lines)
- account/layout.tsx — sidebar nav colors (~5 lines)
- FundingMeter.tsx — track/fill/milestone hardcoded (~8 lines)
- Auth pages (login, sign-up, forgot, reset) — ~4 lines each

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

8. Empty State — account + dashboard surfaces
   Shows: icon + heading + subtext + optional CTA
   Needed: spec

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

## Open Issues
- Heading font weight needs designer confirmation — currently 
  set to --font-weight-semibold: 500 (Medium) but spec says 600 
  (Bold). Visual check shows Medium is closer to mock. 
  Confirm with designer before launch.
  
  Focus ring color --color-border-focus is #9ecac6 in :root 
  (light mode) and #bfdcd9 in .dark. Figma spec uses #bfdcd9. 
  If light mode ships, align :root value to match or define 
  a separate light mode focus color intentionally.