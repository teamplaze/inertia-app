import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-heading font-medium tracking-normal",
    "rounded-none",
    "transition-colors duration-150",
    "disabled:pointer-events-none",
    "focus-visible:outline-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[--interactive-bg-primary] text-[--interactive-text-primary]",
          "border-0",
          "hover:bg-[--interactive-bg-hover-primary] hover:text-[--interactive-text-secondary]",
          "focus-visible:bg-[--interactive-bg-hover-primary]",
          "focus-visible:text-[--interactive-text-secondary]",
          "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-offset-4",
          "disabled:bg-[--interactive-bg-disabled]",
          "disabled:text-[--interactive-text-disabled]",
        ].join(" "),

        border: [
          "bg-transparent text-[--interactive-text-secondary]",
          "border-2 border-[--interactive-bg-primary]",
          "hover:border-[--interactive-bg-hover-primary]",
          "focus-visible:border-[--interactive-bg-hover-primary]",
          "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-offset-4",
          "disabled:border-[--interactive-bg-disabled]",
          "disabled:text-[--interactive-text-disabled]",
        ].join(" "),

        link: [
          "bg-transparent text-[--interactive-text-secondary]",
          "border-0",
          "underline underline-offset-4 decoration-2",
          "decoration-[--interactive-bg-primary]",
          "hover:decoration-[--interactive-bg-hover-primary]",
          "focus-visible:decoration-[--interactive-bg-hover-primary]",
          "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-offset-2",
          "disabled:text-[--interactive-text-disabled]",
          "disabled:decoration-[--interactive-text-disabled]",
        ].join(" "),

        default: [
          "bg-[--interactive-bg-primary] text-[--interactive-text-primary]",
          "border-0",
          "hover:bg-[--interactive-bg-hover-primary]",
          "hover:text-[--interactive-text-secondary]",
          "focus-visible:bg-[--interactive-bg-hover-primary]",
          "focus-visible:text-[--interactive-text-secondary]",
          "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-offset-4",
          "disabled:bg-[--interactive-bg-disabled]",
          "disabled:text-[--interactive-text-disabled]",
        ].join(" "),

        ghost: "bg-transparent hover:bg-white/10",

        outline: [
          "bg-transparent border-2 border-[--interactive-bg-primary]",
          "hover:border-[--interactive-bg-hover-primary]",
        ].join(" "),
      },
      size: {
        sm: [
          "text-[--font-size-btn-small]",
          "px-[var(--spacing-3)] py-[var(--spacing-2)]",
        ].join(" "),

        default: [
          "text-[--font-size-btn-base]",
          "px-[var(--spacing-5)] py-[var(--spacing-3)]",
        ].join(" "),

        lg: [
          "text-[--font-size-btn-large]",
          "px-[var(--spacing-5)] py-[var(--spacing-4)]",
        ].join(" "),

        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
