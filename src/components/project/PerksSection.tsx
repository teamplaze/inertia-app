import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<string, { icon: string; description: string }> = {
  "Inertia Perks": {
    icon: "crown",
    description:
      "100% of your contribution goes directly to the artist, and you'll receive a share of album royalties.",
  },
  Physical: {
    icon: "checkroom",
    description:
      "Enjoy merch discounts, a contributor-edition tour poster, and an exclusive vinyl test press.*",
  },
  "Events & Livestreams": {
    icon: "confirmation_number",
    description:
      "Get guest list access to a future show, join an in-person meetup,* and watch exclusive rehearsal livestreams.",
  },
  Community: {
    icon: "group",
    description:
      "Join the group chat, get added to close friends on IG, and help shape decisions through interactive fan polls.",
  },
  "Exclusive Content": {
    icon: "star",
    description: "Get behind-the-scenes studio footage and music video footage (pending budget).",
  },
  Recognition: {
    icon: "workspace_premium",
    description:
      "Get your name in the album's liner notes and a personal dedication in the artist's thank you video.",
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
    perks?: Array<{
      category: string
    }>
  }>
  artistName: string
  onSupportClick?: () => void
  className?: string
}

export function PerksSection({
  tiers,
  artistName: _artistName,
  onSupportClick,
  className,
}: PerksSectionProps) {
  const availableCategories = new Set(
    tiers
      .flatMap((tier) => tier.perks ?? [])
      .map((perk) => perk.category)
      .filter(Boolean)
  )

  const categories = CATEGORY_ORDER.filter((cat) => availableCategories.has(cat))
  const extraCategories = Array.from(availableCategories).filter(
    (cat) => !CATEGORY_ORDER.includes(cat)
  )
  const allCategories = [...categories, ...extraCategories]

  if (allCategories.length === 0) return null

  return (
    <section className={cn("w-full", className)}>
      {/* Section header */}
      <div className="flex items-start justify-between mb-[--spacing-8]">
        <div className="flex flex-col gap-[--spacing-2]">
          <h2
            className={cn(
              "font-heading font-medium",
              "text-[length:--font-size-h2]",
              "leading-[1.2]",
              "text-[--perks-heading]"
            )}
          >
            Perks
          </h2>
          <p
            className={cn(
              "font-body font-normal",
              "text-[length:--font-size-body-base]",
              "leading-[1.5]",
              "text-[--perks-label-sub]"
            )}
          >
            Fuel the music. Join the inner circle.
          </p>
        </div>

        <div className="flex items-center gap-[--spacing-4] shrink-0">
          <Button variant="border" size="sm">
            Read our FAQs
          </Button>
          <Button variant="link" size="sm" onClick={onSupportClick}>
            Contact us
          </Button>
        </div>
      </div>

      {/* 2-column perks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[--spacing-10]">
        {allCategories.map((category) => {
          const config = CATEGORY_CONFIG[category]
          if (!config) return null

          return (
            <div key={category} className="flex items-start gap-[--spacing-5]">
              {/* Icon badge */}
              <div
                className="shrink-0 flex items-center justify-center rounded-[100px] p-[--spacing-3]"
                style={{ background: "var(--perks-icon-bg)" }}
              >
                <span
                  className="material-symbols-rounded text-[24px] leading-none"
                  style={{ color: "var(--perks-icon-color)" }}
                  aria-hidden="true"
                >
                  {config.icon}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-[--spacing-2]">
                <span
                  className={cn(
                    "font-heading font-medium",
                    "text-[length:--font-size-h6]",
                    "leading-[1.2]",
                    "text-[--perks-label]"
                  )}
                >
                  {category}
                </span>
                <p
                  className={cn(
                    "font-body font-normal",
                    "text-[length:--font-size-body-base]",
                    "leading-[1.5]",
                    "text-[--perks-body]"
                  )}
                >
                  {config.description}
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
          "text-[--perks-label-sub]",
          "mt-[--spacing-8]"
        )}
      >
        *Limited availability
      </p>
    </section>
  )
}
