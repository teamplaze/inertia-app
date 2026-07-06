import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Layout & geometry
        "flex w-full min-w-0 rounded-none min-h-[180px] resize-y",
        // Spacing
        "p-[var(--spacing-3)]",
        // Typography
        "font-body font-normal text-[18px] leading-[1.5] tracking-normal",
        // Default surface
        "bg-[var(--input-bg-default)] border border-[var(--input-border-default)]",
        // Default text / placeholder
        "text-[var(--input-text-placeholder)] placeholder:text-[var(--input-text-placeholder)]",
        // Active state
        "focus:bg-[var(--input-bg-active)] focus:border-[var(--input-border-active)] focus:text-[var(--input-text-primary)]",
        // Keyboard focus ring
        "focus-visible:border-2 focus-visible:border-[var(--input-border-focus)] focus-visible:outline-none focus-visible:ring-0",
        // Misc
        "transition-[color,border-color,background-color] duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
