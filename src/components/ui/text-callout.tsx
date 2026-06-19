import { cn } from "@/lib/utils"

interface TextCalloutProps {
  heading: string
  description: string
  icon?: string
  showIcon?: boolean
  className?: string
}

export function TextCallout({
  heading,
  description,
  icon,
  showIcon = true,
  className,
}: TextCalloutProps) {
  return (
    <div
      className={cn(
        "flex items-start",
        "rounded-[--callout-radius]",
        "p-[--callout-padding]",
        className
      )}
      style={{ gap: "var(--callout-gap)" }}
    >
      {icon && showIcon && (
        <div
          className="shrink-0 flex items-center justify-center rounded-[100px] p-[--spacing-3]"
          style={{ background: "var(--callout-icon-bg)" }}
        >
          <span
            className="material-symbols-rounded leading-[1.2]"
            style={{ fontSize: "24px", color: "var(--callout-icon-color)" }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
      )}

      <div
        className="flex flex-col items-start flex-1 min-w-[1px]"
        style={{ gap: "8px" }}
      >
        <span
          className={cn(
            "font-heading font-medium",
            "text-[length:--font-size-h6]",
            "leading-[1.2] tracking-normal",
            "text-[--callout-heading]",
            "w-full"
          )}
        >
          {heading}
        </span>

        <span
          className={cn(
            "font-body font-normal",
            "text-[length:--font-size-body-base]",
            "leading-[1.5] tracking-normal",
            "text-[--callout-body]",
            "w-full"
          )}
        >
          {description}
        </span>
      </div>
    </div>
  )
}
