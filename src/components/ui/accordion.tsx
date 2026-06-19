"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex flex-col gap-[--spacing-3]", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "bg-[--accordion-bg]",
        "border border-[--accordion-border-default]",
        "rounded-[--accordion-radius]",
        "overflow-hidden",
        "transition-colors duration-150",
        "data-[state=open]:border-[--accordion-border-expanded]",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // Layout
          "flex flex-1 items-center justify-between w-full",
          // Spacing
          "p-[--spacing-5]",
          // Typography — MADE Outer Sans 500, 18px
          "font-heading font-medium text-[length:--font-size-h6] leading-[1.2] tracking-normal",
          // Color
          "text-[--accordion-text-trigger]",
          // Gap between label and icon
          "gap-[--spacing-4]",
          // States
          "hover:opacity-90",
          "transition-all outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        {/* TODO: Replace ChevronDown with Material Symbols "add" icon once
            the font is installed. Per spec: desktop shows "add" (+) for both
            collapsed and expanded states (no rotation). Mobile should swap
            "add" → "close" (×) when expanded. */}
        <ChevronDownIcon className="text-[--accordion-text-trigger] pointer-events-none size-5 shrink-0" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          // Typography — Albert Sans 400, 20px
          "font-body font-normal text-[length:--font-size-body-large] leading-[1.5] tracking-normal",
          // Color
          "text-[--accordion-text-content]",
          // Spacing — 32px gap from trigger top, 20px sides and bottom
          "px-[--spacing-5] pb-[--spacing-5] pt-[--spacing-8]",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
