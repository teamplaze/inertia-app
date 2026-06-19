import { cn } from "@/lib/utils"

interface TextCardBullet {
  text: string
}

interface TextCardProps {
  heading: string
  bullets: TextCardBullet[]
  variant?: "inertia" | "default"
  mobile?: boolean
  className?: string
}

export function TextCard({
  heading,
  bullets,
  variant = "default",
  mobile = false,
  className,
}: TextCardProps) {
  const isInertia = variant === "inertia"

  return (
    <div
      className={cn(
        "flex flex-col",
        "bg-[--card-bg]",
        "border",
        isInertia ? "border-[--card-border-accent]" : "border-[--card-border-default]",
        "rounded-[--card-radius]",
        "px-[--card-padding-base] py-[--card-padding-large]",
        "gap-[--spacing-8]",
        mobile ? "w-[350px]" : "w-[501px]",
        className
      )}
    >
      <span
        className={cn(
          "font-heading font-medium leading-[1.2]",
          "text-[--card-text-primary]",
          "text-[32px]"
        )}
      >
        {heading}
      </span>

      <div className="flex flex-col gap-[--spacing-4]">
        <span
          className={cn(
            "font-body font-semibold leading-[1.5]",
            "text-[--card-text-secondary]",
            "text-[length:--font-size-body-base]"
          )}
        >
          WHAT YOU GET
        </span>

        <div className="flex flex-col gap-[--spacing-4]">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-[--spacing-2]">
              <span
                className="material-symbols-rounded text-[24px] leading-none shrink-0"
                style={{
                  color: isInertia
                    ? "var(--card-icon-accent)"
                    : "var(--card-icon-muted)",
                }}
                aria-hidden="true"
              >
                {isInertia ? "star" : "check"}
              </span>
              <span
                className={cn(
                  "font-body font-normal leading-[1.5]",
                  "text-[--card-text-primary]",
                  "text-[20px]"
                )}
              >
                {bullet.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
