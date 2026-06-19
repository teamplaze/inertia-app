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
- Full spec not yet pulled — pending

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
- Material Symbols Rounded not installed — used by 
  Inputs (help, search, credit_card icons), Accordions 
  (add, close, check icons), and likely other components.
  Needs to be added as a dependency before icon variants 
  can be fully implemented.
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