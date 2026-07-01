import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    // Layout & geometry
    "flex w-full min-w-0 rounded-none",
    // Spacing
    "p-[var(--spacing-3)]",
    // Typography
    "font-body font-normal text-[length:--font-size-body-base] leading-[1.5] tracking-normal",
    // Default surface
    "bg-[--input-bg-default] border border-[--input-border-default]",
    // Default text / placeholder
    "text-[--input-text-placeholder] placeholder:text-[--input-text-placeholder]",
    // Active state (mouse click or typing)
    "focus:bg-[--input-bg-active] focus:border-[--input-border-active] focus:text-[--input-text-primary]",
    // Keyboard focus ring (overrides border colour from active state)
    "focus-visible:border-2 focus-visible:border-[--input-border-focus] focus-visible:outline-none focus-visible:ring-0",
    // Misc
    "transition-[color,border-color,background-color] duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default IS the dark/Inertia style — dark is kept as an alias
        // so existing auth forms using variant="dark" continue to work
        default: "",
        dark: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input }
