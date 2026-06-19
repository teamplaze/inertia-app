import * as React from "react"
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
        "px-[--spacing-3] py-[--spacing-2]",
        "rounded-[--alert-radius]",
        "bg-[--alert-bg]",
        mobile && "flex-col items-center gap-[2px]",
        className
      )}
    >
      <div className="flex items-center gap-[2px]">
        {icon && (
          <span
            className={cn("text-[--alert-icon-color]", "text-[18px] leading-[1.2]")}
            aria-hidden="true"
          >
            ⏱
            {/* TODO: Replace with Material Symbols Rounded 'timer' icon once font is installed */}
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
