"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { ProjectMilestone } from "@/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMilestoneGoal(milestone: ProjectMilestone): number {
  return milestone.budget_line_items.reduce((sum, item) => sum + item.cost, 0)
}

function getCumulativeGoal(milestones: ProjectMilestone[], index: number): number {
  return milestones
    .slice(0, index + 1)
    .reduce((sum, m) => sum + getMilestoneGoal(m), 0)
}

type MilestoneState = "completed" | "active" | "locked"

function getMilestoneState(
  milestones: ProjectMilestone[],
  index: number,
  currentFunding: number
): MilestoneState {
  const cumulativeGoal = getCumulativeGoal(milestones, index)
  const prevCumulativeGoal = index > 0 ? getCumulativeGoal(milestones, index - 1) : 0

  if (currentFunding >= cumulativeGoal) return "completed"
  if (currentFunding > prevCumulativeGoal) return "active"
  return "locked"
}

function getActiveFillPercent(
  milestones: ProjectMilestone[],
  index: number,
  currentFunding: number
): number {
  const prevCumulativeGoal = index > 0
    ? getCumulativeGoal(milestones, index - 1)
    : 0
  const milestoneGoal = getMilestoneGoal(milestones[index])
  if (milestoneGoal === 0) return 0
  const progress = currentFunding - prevCumulativeGoal
  return Math.min(Math.max((progress / milestoneGoal) * 100, 0), 100)
}

// ---------------------------------------------------------------------------
// MilestoneBadge
// ---------------------------------------------------------------------------

interface MilestoneBadgeProps {
  number: number
  state: MilestoneState
  fillPercent?: number
}

function MilestoneBadge({ number, state, fillPercent = 0 }: MilestoneBadgeProps) {
  if (state === "active") {
    return (
      <div
        className="shrink-0 flex items-center justify-center rounded-[100px] relative w-[27px] h-[27px] md:w-[43px] md:h-[43px]"
        style={{
          background: `conic-gradient(var(--color-project-accent, var(--color-bg-teal)) ${fillPercent}%, var(--milestone-text-locked) ${fillPercent}%)`,
          opacity: 1,
        }}
      >
        <div
          className="absolute rounded-[100px] flex items-center justify-center"
          style={{ width: "clamp(21px, 5vw, 37px)", height: "clamp(21px, 5vw, 37px)", background: "var(--milestone-bg)" }}
        >
          <span
            className="font-heading font-medium leading-none text-[14px] md:text-[18px] text-[--milestone-text-active]"
          >
            {number}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-[100px] w-[27px] h-[27px] md:w-[43px] md:h-[43px]"
      style={{
        padding: "12px",
        background: state === "completed" ? "var(--color-project-accent, var(--color-bg-teal))" : "transparent",
        border: state === "completed" ? "none" : "2px solid var(--milestone-text-locked)",
        opacity: state === "locked" ? 0.4 : 1,
      }}
    >
      {state === "completed" ? (
        <span
          className="material-symbols-rounded leading-none"
          style={{ fontSize: "clamp(14px, 3vw, 19px)", color: "var(--interactive-text-primary)" }}
          aria-hidden="true"
        >
          check
        </span>
      ) : (
        <span
          className={cn(
            "font-heading font-medium leading-none",
            "text-[14px] md:text-[18px]",
            "text-[--milestone-text-locked]",
          )}
        >
          {number}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MilestoneRow
// ---------------------------------------------------------------------------

interface MilestoneRowProps {
  milestone: ProjectMilestone
  number: number
  state: MilestoneState
  fillPercent: number
  goalAmount: number
  isExpanded: boolean
  onToggle: () => void
}

function MilestoneRow({
  milestone,
  number,
  state,
  fillPercent,
  goalAmount,
  isExpanded,
  onToggle,
}: MilestoneRowProps) {
  const isLocked = state === "locked"
  const titleColor = isLocked ? "text-[--milestone-text-locked]" : "text-[--milestone-text-active]"
  const amountColor = isLocked ? "text-[--milestone-text-locked]" : "text-[--milestone-text-active]"

  return (
    <div
      className={cn(
        "flex flex-col",
        "bg-[--milestone-bg]",
        "border rounded-[12px]",
        "overflow-hidden",
        "transition-colors duration-150",
        isExpanded
          ? "border-[var(--milestone-border-expanded)]"
          : "border-[var(--milestone-border-default)]"
      )}
    >
      {/* Trigger row */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between",
          "w-full",
          "p-[var(--spacing-4)]",
          "md:px-[var(--spacing-5)] md:py-[var(--spacing-5)]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-inset",
        )}
        aria-expanded={isExpanded}
      >
        {/* Left group: badge + title */}
        <div className={cn(
          "flex items-center min-w-0",
          "gap-[var(--spacing-3)]",
          "md:gap-[var(--spacing-4)]",
          "flex-1",
        )}>
          <MilestoneBadge number={number} state={state} fillPercent={fillPercent} />
          <div className="flex flex-col gap-[4px] text-left min-w-0 flex-1">
            <span
              className={cn(
                "font-heading font-medium",
                "text-[16px] md:text-[length:--font-size-h6]",
                "leading-[1.2]",
                titleColor,
              )}
            >
              {milestone.title}
            </span>

            {/* Subhead — desktop only in trigger row */}
            <span
              className={cn(
                "font-body font-normal hidden md:block",
                "text-[length:--font-size-body-base]",
                "leading-[1.5]",
                "text-[--milestone-text-locked]",
              )}
            >
              {milestone.budget_line_items.map((item) => item.name).join(", ")}
            </span>
          </div>
        </div>

        {/* Right group: amount (desktop only) + icon */}
        <div className="flex items-center gap-[var(--spacing-3)] shrink-0">
          {/* Amount — hidden on mobile, visible on desktop */}
          <span
            className={cn(
              "font-heading font-medium hidden md:block",
              "text-[length:--font-size-h6]",
              "leading-[1.2] text-right",
              "w-[120px]",
              amountColor,
            )}
          >
            ${goalAmount.toLocaleString()}
          </span>
          <span
            className="material-symbols-rounded text-[24px] leading-none text-[--milestone-text-active]"
            aria-hidden="true"
          >
            {isExpanded ? "close" : "add"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={cn(
          "px-[var(--spacing-4)] pb-[var(--spacing-4)]",
          "md:px-[var(--spacing-5)] md:pb-[var(--spacing-5)]",
        )}>
          {/* Mobile only: subhead + amount row */}
          <div className={cn(
            "flex items-center justify-between",
            "gap-[var(--spacing-4)]",
            "mb-[var(--spacing-3)]",
            "md:hidden",
          )}>
            <span
              className={cn(
                "font-body font-normal flex-1",
                "text-[16px] leading-[1.5]",
                "text-[--milestone-text-locked]",
              )}
            >
              {milestone.budget_line_items.map((item) => item.name).join(", ")}
            </span>
            <span
              className={cn(
                "font-heading font-medium shrink-0",
                "text-[16px] leading-[1.2]",
                "w-[100px] text-right",
                amountColor,
              )}
            >
              ${goalAmount.toLocaleString()}
            </span>
          </div>

          {/* Separator */}
          <div
            className="w-full border-t mb-[var(--spacing-4)]"
            style={{ borderColor: "var(--milestone-separator)" }}
          />

          {/* Description */}
          {milestone.description && (
            <p
              className={cn(
                "font-body font-normal",
                "text-[14px] md:text-[length:--font-size-body-base]",
                "leading-[1.5]",
                "text-[--milestone-text-content]",
              )}
            >
              {milestone.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MilestonesList
// ---------------------------------------------------------------------------

interface MilestonesListProps {
  milestones: ProjectMilestone[]
  currentFunding: number
  className?: string
}

export function MilestonesList({
  milestones,
  currentFunding,
  className,
}: MilestonesListProps) {
  const [expandedId, setExpandedId] = React.useState<number | null>(() => {
    const activeIndex = milestones.findIndex(
      (_, i) => getMilestoneState(milestones, i, currentFunding) === "active"
    )
    return activeIndex >= 0 ? milestones[activeIndex].id : null
  })

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (!milestones || milestones.length === 0) return null

  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className={cn("flex flex-col gap-[var(--spacing-3)]", className)}>
      {sorted.map((milestone, index) => {
        const state = getMilestoneState(sorted, index, currentFunding)
        const fillPercent = state === "active"
          ? getActiveFillPercent(sorted, index, currentFunding)
          : 0
        const goalAmount = getMilestoneGoal(milestone)

        return (
          <MilestoneRow
            key={milestone.id}
            milestone={milestone}
            number={index + 1}
            state={state}
            fillPercent={fillPercent}
            goalAmount={goalAmount}
            isExpanded={expandedId === milestone.id}
            onToggle={() => handleToggle(milestone.id)}
          />
        )
      })}
    </div>
  )
}
