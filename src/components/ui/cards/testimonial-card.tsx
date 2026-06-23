import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  quote: string
  name: string
  location: string
  mobile?: boolean
  className?: string
}

export function TestimonialCard({
  quote,
  name,
  location,
  mobile = false,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        "bg-[--card-bg]",
        "border border-[--card-border-accent]",
        "rounded-[var(--card-radius)]",
        "px-[var(--card-padding-large)] py-[var(--spacing-12)]",
        "gap-[var(--spacing-8)]",
        mobile ? "w-[350px]" : "w-[501px]",
        className
      )}
    >
      <p
        className={cn(
          "font-body font-normal leading-[1.5]",
          "text-[--card-text-primary]",
          "text-[20px]"
        )}
      >
        {quote}
      </p>

      <div className="flex items-center gap-[var(--spacing-4)]">
        <div
          className="shrink-0 flex items-center justify-center rounded-[100px] p-[var(--spacing-3)]"
          style={{ background: "var(--card-border-accent)" }}
        >
          <span
            className="material-symbols-rounded text-[24px] leading-none"
            style={{ color: "var(--interactive-text-primary)" }}
            aria-hidden="true"
          >
            person
          </span>
        </div>

        <div className="flex flex-col gap-[4px]">
          <span
            className={cn(
              "font-heading font-medium leading-[1.2]",
              "text-[--card-text-primary]",
              "text-[length:--font-size-h6]"
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "font-body font-normal leading-[1.5]",
              "text-[--card-text-primary]",
              "text-[length:--font-size-body-base]"
            )}
          >
            {location}
          </span>
        </div>
      </div>
    </div>
  )
}
