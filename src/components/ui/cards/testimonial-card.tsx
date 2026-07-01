import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  quote: string
  name: string
  location: string
  className?: string
}

export function TestimonialCard({
  quote,
  name,
  location,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center",
        "rounded-[12px]",
        "p-[var(--spacing-6)] md:p-[var(--spacing-8)]",
        "gap-[var(--spacing-6)] md:gap-[var(--spacing-8)]",
        "w-[350px] md:w-[394px]",
        "shrink-0",
        className
      )}
      style={{
        background: 'var(--testimonial-card-bg)',
        border: '1px solid var(--color-project-accent, var(--color-bg-teal))',
      }}
    >
      <p
        className={cn(
          "font-body font-normal leading-[1.5]",
          "text-[18px] md:text-[20px]",
          "text-white w-full",
        )}
      >
        {quote}
      </p>

      <div
        className={cn(
          "flex items-center w-full",
          "gap-[var(--spacing-3)] md:gap-[var(--spacing-4)]",
        )}
      >
        {/* Avatar badge */}
        <div
          className={cn(
            "shrink-0 flex items-center justify-center",
            "rounded-[100px] p-[var(--spacing-3)]",
          )}
          style={{
            background: 'var(--color-project-accent, var(--color-bg-teal))',
          }}
        >
          <span
            className="material-symbols-rounded text-[24px] leading-none"
            style={{ color: 'var(--interactive-text-primary, #000000)' }}
            aria-hidden="true"
          >
            person
          </span>
        </div>

        {/* Name + location */}
        <div className="flex flex-col gap-[4px] min-w-0">
          <span
            className={cn(
              "font-heading font-medium leading-[1.2]",
              "text-[16px] md:text-[length:--font-size-h6]",
              "text-white",
            )}
          >
            {name}
          </span>
          <span
            className={cn(
              "font-body font-normal leading-[1.5]",
              "text-[16px] md:text-[length:--font-size-body-base]",
              "text-white",
            )}
          >
            {location}
          </span>
        </div>
      </div>
    </div>
  )
}
