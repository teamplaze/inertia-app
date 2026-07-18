import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const INERTIA_PERKS_DESCRIPTION_WITH_ROYALTIES =
  "100% of your contribution goes directly to the artist, and you'll receive a share of album royalties."

const INERTIA_PERKS_DESCRIPTION_WITHOUT_ROYALTIES =
  "100% of your contribution goes directly to the artist."

const CATEGORY_CONFIG: Record<string, { icon: string; description: string }> = {
  "Inertia Perks": {
    icon: "crown",
    description: INERTIA_PERKS_DESCRIPTION_WITH_ROYALTIES,
  },
  Physical: {
    icon: "apparel",
    description:
      "Collect limited merch and memorabilia, including signed posters, handwritten notes, postcards, laminates, and other project keepsakes.*",
  },
  "Events & Livestreams": {
    icon: "confirmation_number",
    description:
      "Go beyond the feed with private livestreams, AMAs, soundchecks, studio hangs, watch parties, and project-only moments.",
  },
  Community: {
    icon: "group",
    description:
      "Step into the inner circle with private chats, polls, playlists, Q&As, and chances to help shape parts of the project.",
  },
  "Exclusive Content": {
    icon: "star",
    description:
      "Behind-the-scenes videos, tour diaries, sneak peeks, demos, photos, and updates made just for contributors.",
  },
  Recognition: {
    icon: "star_shine",
    description:
      "Get your name, story, or support recognized through shoutouts, thank-you reels, liner notes, stage moments, or other special acknowledgments.",
  },
}

const CATEGORY_ORDER = [
  "Inertia Perks",
  "Physical",
  "Events & Livestreams",
  "Community",
  "Exclusive Content",
  "Recognition",
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PerksSectionProps {
  tiers: Array<{
    id?: number
    name?: string
    perks?: Array<{
      category: string
    }>
  }>
  artistName: string
  className?: string
  hasRoyalties?: boolean
}

export function PerksSection({
  tiers,
  artistName: _artistName,
  className,
  hasRoyalties = true,
}: PerksSectionProps) {
  // Warn in development if any tier_perks row carries a category outside
  // CATEGORY_ORDER — those tiles have no CATEGORY_CONFIG entry and cannot
  // render. This is a data-authoring error, not a runtime concern.
  if (process.env.NODE_ENV !== 'production') {
    const unknown: Record<string, Array<string | number>> = {}
    for (const tier of tiers) {
      for (const perk of tier.perks ?? []) {
        if (perk.category && !CATEGORY_ORDER.includes(perk.category)) {
          if (!unknown[perk.category]) unknown[perk.category] = []
          const label = tier.name ?? tier.id
          if (label != null && !unknown[perk.category].includes(label)) {
            unknown[perk.category].push(label)
          }
        }
      }
    }
    for (const [cat, tNames] of Object.entries(unknown)) {
      console.warn(
        `[PerksSection] Unknown perk category "${cat}" in tier(s): ${tNames.join(', ')}. ` +
        `Add it to CATEGORY_ORDER and CATEGORY_CONFIG, or fix the tier_perks data.`
      )
    }
  }

  const allCategories = CATEGORY_ORDER

  return (
    <section className={cn("w-full", "py-[var(--spacing-12)] md:py-[120px]", className)}>
      {/* Section header */}
      <div className={cn(
        "flex flex-col gap-[var(--spacing-4)]",
        "mb-[var(--spacing-8)]",
        "md:flex-row md:items-start md:justify-between",
      )}>
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <h2
            className={cn(
              "font-heading font-medium",
              "text-[20px] md:text-[32px]",
              "leading-[1.2]",
              "text-[var(--perks-heading)]"
            )}
          >
            Perks
          </h2>
          <p
            className={cn(
              "font-body font-normal",
              "text-[18px]",
              "leading-[1.5]",
              "text-[var(--perks-label-sub)]"
            )}
          >
            Fuel the music. Join the inner circle.
          </p>
        </div>

        <div className="flex items-center gap-[var(--spacing-4)] shrink-0">
          <a
            href="#faq"
            className={cn(
              "flex items-center justify-center",
              "bg-transparent text-white",
              "font-heading font-medium",
              "text-[14px]",
              "leading-[1.2] tracking-normal",
              "px-[var(--spacing-5)] py-[var(--spacing-3)]",
              "rounded-none",
              "border-2 border-white",
              "transition-colors duration-150",
              "hover:border-[var(--color-project-accent,var(--color-bg-teal))]",
              "hover:text-[var(--color-project-accent,var(--color-bg-teal))]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--color-border-focus)]",
            )}
          >
            Read our FAQs
          </a>
          <Button variant="link" size="sm" asChild>
            <a href="mailto:team@theinertiaproject.com">Contact us</a>
          </Button>
        </div>
      </div>

      {/* 2-column perks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-10)]">
        {allCategories.map((category) => {
          const config = CATEGORY_CONFIG[category]
          if (!config) return null

          const description =
            category === 'Inertia Perks' && !hasRoyalties
              ? INERTIA_PERKS_DESCRIPTION_WITHOUT_ROYALTIES
              : config.description

          return (
            <div key={category} className="flex items-start gap-[var(--spacing-5)]">
              {/* Icon badge */}
              <div
                className="shrink-0 flex items-center justify-center rounded-[100px] p-[var(--spacing-3)]"
                style={{
                  background: category === 'Inertia Perks'
                    ? 'var(--color-project-accent, var(--color-bg-teal))'
                    : 'transparent',
                  border: category === 'Inertia Perks'
                    ? 'none'
                    : '2px solid var(--color-project-accent, var(--color-bg-teal))',
                }}
              >
                <span
                  className="material-symbols-rounded text-[24px] leading-none"
                  style={{
                    color: category === 'Inertia Perks'
                      ? 'var(--perks-icon-color)'
                      : 'var(--color-project-accent, var(--color-bg-teal))',
                  }}
                  aria-hidden="true"
                >
                  {config.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-[var(--spacing-2)]">
                <span
                  className={cn(
                    "font-heading font-medium",
                    "text-[18px]",
                    "leading-[1.2]",
                    "text-[var(--perks-label)]"
                  )}
                >
                  {category}
                </span>
                <p
                  className={cn(
                    "font-body font-normal",
                    "text-[18px]",
                    "leading-[1.5]",
                    "text-[var(--perks-body)]"
                  )}
                >
                  {description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p
        className={cn(
          "font-body font-normal",
          "text-[14px] leading-[1.5]",
          "text-[var(--perks-label-sub)]",
          "mt-[var(--spacing-8)]"
        )}
      >
        *Limited availability
      </p>
    </section>
  )
}
