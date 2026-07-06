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
          "bg-[var(--interactive-bg-primary)] text-black",
          "border-0",
          "hover:bg-[var(--interactive-bg-hover-primary)] hover:text-black",
          "focus-visible:bg-[var(--interactive-bg-hover-primary)]",
          "focus-visible:text-black",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
          "focus-visible:ring-offset-4",
          "disabled:bg-[var(--interactive-bg-disabled)]",
          "disabled:text-[var(--interactive-text-disabled)]",
        ].join(" "),

        border: [
          "bg-transparent text-[var(--interactive-text-secondary)]",
          "border-2 border-[var(--interactive-bg-primary)]",
          "hover:border-[var(--interactive-bg-hover-primary)]",
          "focus-visible:border-[var(--interactive-bg-hover-primary)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
          "focus-visible:ring-offset-4",
          "disabled:border-[var(--interactive-bg-disabled)]",
          "disabled:text-[var(--interactive-text-disabled)]",
        ].join(" "),

        link: [
          "bg-transparent text-[var(--interactive-text-secondary)]",
          "border-0",
          "underline underline-offset-4 decoration-2",
          "decoration-[var(--interactive-bg-primary)]",
          "hover:decoration-[var(--interactive-bg-hover-primary)]",
          "focus-visible:decoration-[var(--interactive-bg-hover-primary)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
          "focus-visible:ring-offset-2",
          "disabled:text-[var(--interactive-text-disabled)]",
          "disabled:decoration-[var(--interactive-text-disabled)]",
        ].join(" "),

        default: [
          "bg-[var(--interactive-bg-primary)] text-black",
          "border-0",
          "hover:bg-[var(--interactive-bg-hover-primary)]",
          "hover:text-black",
          "focus-visible:bg-[var(--interactive-bg-hover-primary)]",
          "focus-visible:text-black",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
          "focus-visible:ring-offset-4",
          "disabled:bg-[var(--interactive-bg-disabled)]",
          "disabled:text-[var(--interactive-text-disabled)]",
        ].join(" "),

        ghost: "bg-transparent hover:bg-white/10",

        outline: [
          "bg-transparent border-2 border-[var(--interactive-bg-primary)]",
          "hover:border-[var(--interactive-bg-hover-primary)]",
        ].join(" "),
      },
      size: {
        sm: [
          "text-[var(--font-size-btn-small)]",
          "px-[var(--spacing-3)] py-[var(--spacing-2)]",
        ].join(" "),

        default: [
          "text-[var(--font-size-btn-base)]",
          "px-[var(--spacing-5)] py-[var(--spacing-3)]",
        ].join(" "),

        lg: [
          "text-[var(--font-size-btn-large)]",
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
