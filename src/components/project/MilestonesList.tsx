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
  const prevCumulativeGoal = index > 0 ? getCumulativeGoal(milestones, index - 1) : 0
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
  const strokeWidth = 2
  const radius = 15.9

  return (
    <div className="relative shrink-0 w-[48px] h-[48px] flex items-center justify-center">
      <svg
        viewBox="0 0 36 36"
        className="absolute inset-0 w-full h-full -rotate-90"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={
            state === "completed"
              ? "var(--milestone-badge-completed)"
              : state === "active"
              ? "var(--milestone-border-active)"
              : "var(--milestone-text-locked)"
          }
          strokeWidth={strokeWidth}
          opacity={state === "locked" ? 0.4 : 1}
        />

        {/* Progress arc — active only */}
        {state === "active" && fillPercent > 0 && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="var(--milestone-border-active)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillPercent} ${100 - fillPercent}`}
            strokeLinecap="round"
          />
        )}

        {/* Completed fill */}
        {state === "completed" && (
          <circle cx="18" cy="18" r={radius} fill="var(--milestone-badge-completed)" />
        )}
      </svg>

      <div className="relative z-10 flex items-center justify-center">
        {state === "completed" ? (
          <span
            className="material-symbols-rounded text-[19px] leading-none"
            style={{ color: "var(--interactive-text-primary)" }}
            aria-hidden="true"
          >
            check
          </span>
        ) : (
          <span
            className={cn(
              "font-heading font-medium text-[18px] leading-none",
              state === "active"
                ? "text-[--milestone-text-active]"
                : "text-[--milestone-text-locked]"
            )}
          >
            {number}
          </span>
        )}
      </div>
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
          ? "border-[--milestone-border-expanded]"
          : state === "active"
          ? "border-[--milestone-border-active]"
          : "border-[--milestone-border-default]"
      )}
    >
      {/* Trigger row */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between",
          "w-full p-[--spacing-5]",
          "gap-[--spacing-8]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[--color-border-focus]",
          "focus-visible:ring-inset"
        )}
        aria-expanded={isExpanded}
      >
        {/* Left: badge + text */}
        <div className="flex items-center gap-[--spacing-4]">
          <MilestoneBadge number={number} state={state} fillPercent={fillPercent} />
          <div className="flex flex-col gap-[4px] text-left">
            <span
              className={cn(
                "font-heading font-medium",
                "text-[length:--font-size-h6]",
                "leading-[1.2]",
                titleColor
              )}
            >
              {milestone.title}
            </span>
            {milestone.budget_line_items.length > 0 && (
              <span
                className={cn(
                  "font-body font-normal",
                  "text-[length:--font-size-body-base]",
                  "leading-[1.5]",
                  "text-[--milestone-text-locked]"
                )}
              >
                {milestone.budget_line_items.map((item) => item.name).join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Right: amount + toggle icon */}
        <div className="flex items-center gap-[--spacing-3] shrink-0">
          <span
            className={cn(
              "font-heading font-medium",
              "text-[length:--font-size-h6]",
              "leading-[1.2]",
              amountColor
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
      {isExpanded && milestone.description && (
        <div className={cn("px-[--spacing-5]", "pb-[--spacing-5]")}>
          <div
            className="w-full border-t mb-[--spacing-4]"
            style={{ borderColor: "var(--milestone-separator)" }}
          />
          <p
            className={cn(
              "font-body font-normal",
              "text-[length:--font-size-body-base]",
              "leading-[1.5]",
              "text-[--milestone-text-content]"
            )}
          >
            {milestone.description}
          </p>
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
    <div className={cn("flex flex-col gap-[--spacing-3]", className)}>
      {sorted.map((milestone, index) => {
        const state = getMilestoneState(sorted, index, currentFunding)
        const fillPercent =
          state === "active" ? getActiveFillPercent(sorted, index, currentFunding) : 0
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
