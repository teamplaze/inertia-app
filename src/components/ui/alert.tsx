import { cn } from "@/lib/utils"

interface AlertProps {
  mainText?: string
  secondaryText?: string
  showSecondaryText?: boolean
  icon?: boolean
  mobile?: boolean
  className?: string
}

function Alert({
  mainText = "Main text",
  secondaryText = "Secondary text",
  showSecondaryText = true,
  icon = true,
  mobile = false,
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "px-[var(--spacing-3)] py-[var(--spacing-2)]",
        "rounded-[var(--alert-radius)]",
        "bg-[--alert-bg]",
        mobile && "flex-col items-center gap-[2px]",
        className
      )}
    >
      <div className="flex items-center gap-[2px]">
        {icon && (
          <span
            className="material-symbols-rounded text-[18px] leading-[1.2] text-[--alert-icon-color]"
            aria-hidden="true"
          >
            timer
          </span>
        )}
        <span
          className={cn(
            "font-body font-normal",
            "text-[length:--font-size-body-base]",
            "leading-[1.5] tracking-normal",
            "text-[--alert-text-main]"
          )}
        >
          {mainText}
        </span>
      </div>
      {showSecondaryText && (
        <span
          className={cn(
            "font-body font-semibold",
            "text-[length:--font-size-body-base]",
            "leading-[1.5] tracking-normal",
            "text-[--alert-text-secondary]"
          )}
        >
          {secondaryText}
        </span>
      )}
    </div>
  )
}

export { Alert }
