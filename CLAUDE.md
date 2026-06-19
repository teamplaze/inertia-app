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