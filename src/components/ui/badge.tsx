import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-[4px]",
    "px-[var(--spacing-2)] py-[2px]",
    "rounded-[var(--badge-radius)]",
    "bg-transparent",
    "font-body font-semibold",
    "text-[18px]",
    "leading-[1.5] tracking-normal",
    "border",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-[var(--badge-border-default)]",
          "text-[var(--badge-text-default)]",
        ].join(" "),

        highlight: [
          "border-[var(--badge-border-highlight)]",
          "text-[var(--badge-text-highlight)]",
          "[&_.badge-icon]:text-[var(--badge-icon-highlight)]",
        ].join(" "),

        secondary: [
          "border-[var(--badge-border-default)]",
          "text-[var(--badge-text-default)]",
        ].join(" "),

        destructive: [
          "border-red-500",
          "text-red-400",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: string
  showIcon?: boolean
}

function Badge({
  className,
  variant,
  icon,
  showIcon = true,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon && showIcon && (
        <span
          className="material-symbols-rounded badge-icon text-[18px] leading-[1.2]"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
