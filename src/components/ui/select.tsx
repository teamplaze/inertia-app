"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-full items-center justify-between",
        "bg-[var(--input-bg-default)]",
        "border border-[var(--input-border-default)]",
        "rounded-none",
        "p-[var(--spacing-3)]",
        "gap-[var(--spacing-4)]",
        "font-body font-normal",
        "text-[18px] leading-[1.5]",
        "text-white",
        "[&_[data-placeholder]]:text-[var(--input-text-placeholder)]",
        "transition-[color,border-color,background-color]",
        "duration-150",
        "outline-none",
        "data-[state=open]:bg-[var(--input-bg-active)]",
        "data-[state=open]:border-[var(--input-border-active)]",
        "data-[state=open]:text-[var(--input-text-primary)]",
        "focus-visible:border-2",
        "focus-visible:border-[var(--input-border-focus)]",
        "focus-visible:ring-0",
        "aria-invalid:bg-[var(--input-bg-error)]",
        "aria-invalid:border-[var(--input-border-error)]",
        "aria-invalid:text-[#ff8383]",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span
          className="material-symbols-rounded text-[24px] leading-none shrink-0 text-[var(--input-text-placeholder)]"
          aria-hidden="true"
        >
          keyboard_arrow_down
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "z-50 relative",
          "min-w-[var(--radix-select-trigger-width)]",
          "max-h-[var(--radix-select-content-available-height)]",
          "overflow-hidden",
          "rounded-none",
          "border border-[var(--input-border-default)]",
          "shadow-md",
          "data-[state=open]:animate-in",
          "data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0",
          "data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95",
          "data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        style={{ background: '#0f1111' }}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "text-[var(--input-text-placeholder)] px-[var(--spacing-3)] py-[var(--spacing-2)] text-[14px]",
        className,
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default",
        "items-center gap-[var(--spacing-3)]",
        "py-[var(--spacing-3)] px-[var(--spacing-3)]",
        "font-body font-normal",
        "text-[18px] leading-[1.5]",
        "text-[var(--input-text-placeholder)]",
        "outline-none select-none",
        "focus:bg-white/10",
        "focus:text-white",
        "data-[state=checked]:text-white",
        "data-[disabled]:pointer-events-none",
        "data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute right-[var(--spacing-3)] flex size-3.5 items-center justify-center text-white">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-[var(--input-border-default)] pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-white",
        className,
      )}
      {...props}
    >
      <span className="material-symbols-rounded text-[20px] leading-none" aria-hidden="true">
        keyboard_arrow_up
      </span>
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-white",
        className,
      )}
      {...props}
    >
      <span className="material-symbols-rounded text-[20px] leading-none" aria-hidden="true">
        keyboard_arrow_down
      </span>
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
