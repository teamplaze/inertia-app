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
        "p-[--spacing-3]",
        // Typography
        "font-body font-normal text-[length:--font-size-body-base] leading-[1.5] tracking-normal",
        // Default surface
        "bg-[--input-bg-default] border border-[--input-border-default]",
        // Default text / placeholder
        "text-[--input-text-placeholder] placeholder:text-[--input-text-placeholder]",
        // Active state
        "focus:bg-[--input-bg-active] focus:border-[--input-border-active] focus:text-[--input-text-primary]",
        // Keyboard focus ring
        "focus-visible:border-2 focus-visible:border-[--input-border-focus] focus-visible:outline-none focus-visible:ring-0",
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
