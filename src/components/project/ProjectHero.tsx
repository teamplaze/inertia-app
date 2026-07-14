"use client"

import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/project/ProgressBar"

const textPanelGradient =
  "radial-gradient(146.13% 116.83% at 50% -16.83%, " +
  "var(--color-project-accent, var(--color-bg-teal)) 0%, " +
  "#000 50%)"

interface ProjectHeroProps {
  artistName: string
  projectTitle: string
  projectStatus: 'Fundraising' | 'Completed' | 'Coming Soon'
  artistImageUrl: string
  currentFunding: number
  fundingGoal: number
  fundingPercentage: number
  percentFunded?: number
  backerCount?: number
  showProjectResults?: boolean
  projectResultsHref?: string
  onSupportClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function ProjectHero({
  artistName,
  projectTitle,
  projectStatus,
  artistImageUrl,
  currentFunding,
  fundingGoal,
  fundingPercentage,
  backerCount,
  showProjectResults,
  projectResultsHref,
  onSupportClick,
  className,
  style,
}: ProjectHeroProps) {
  const showFundingUI = projectStatus === 'Fundraising'

  return (
    <section
      className={cn(
        "flex flex-col md:flex-row",
        "w-full overflow-hidden",
        className,
      )}
      style={style}
    >
      {/* Text panel — gradient background
          Mobile: order-1 (top), Desktop: order-none (right) */}
      <div
        className={cn(
          "relative",
          "md:flex-[1_0_0]",
          "md:h-[700px]",
          "flex flex-col justify-center items-start",
          "gap-[var(--spacing-8)]",
          "pt-[104px] pb-[var(--spacing-10)] px-[var(--spacing-5)]",
          "md:pl-[64px] md:pr-[96px]",
          "md:pt-0 md:pb-0",
          "order-1 md:order-none",
        )}
        style={{ background: textPanelGradient }}
      >
        {/* Intro block */}
        <div className="flex flex-col gap-[var(--spacing-2)] w-full">
          <span
            className={cn(
              "font-body font-normal leading-[1.2]",
              "text-[16px] md:text-[18px]",
              "text-[var(--hero-text-tag)]",
            )}
          >
            {projectStatus}
          </span>

          <h1
            className={cn(
              "font-heading font-medium leading-[1.2]",
              "text-[32px] md:text-[60px]",
              "text-[var(--hero-text-name)]",
            )}
          >
            {artistName}
          </h1>

          <p
            className={cn(
              "font-body font-normal leading-[1.5]",
              "text-[18px] md:text-[20px]",
              "text-[var(--hero-text-desc)]",
            )}
          >
            {projectTitle}
          </p>
        </div>

        {/* Progress bar */}
        {showFundingUI && (
          <ProgressBar
            value={fundingPercentage}
            amountRaised={`$${currentFunding.toLocaleString()}`}
            goal={`of $${fundingGoal.toLocaleString()}`}
            percentFunded={fundingPercentage}
            backerCount={backerCount}
            showDetails={true}
            className="w-full"
          />
        )}

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-[var(--spacing-8)] w-full">
          {showFundingUI && (
            <button
              onClick={onSupportClick}
              className={cn(
                "w-full", "flex items-center justify-center",
                "bg-white text-black",
                "font-heading font-medium",
                "text-[18px]",
                "leading-[1.2]",
                "px-[var(--spacing-5)] py-[var(--spacing-4)]",
                "rounded-none",
                "transition-colors duration-150",
                "hover:bg-[var(--color-project-accent,var(--color-bg-teal))]",
                "hover:text-white",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--color-border-focus)]",
              )}
            >
              Support {artistName}
            </button>
          )}

          {showProjectResults && projectResultsHref && (
            <Link
              href={projectResultsHref}
              className={cn(
                "shrink-0 flex flex-col items-center",
                "gap-[4px]",
                "font-heading font-medium",
                "text-[12px] md:text-[14px]",
                "leading-[1.2] tracking-normal",
                "text-white",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--color-border-focus)]",
              )}
            >
              <span>View project results</span>
              <span
                className="w-full block"
                style={{ height: '2px', background: 'white' }}
              />
            </Link>
          )}
        </div>

      </div>

      {/* Artist image
          Mobile: order-2 (bottom, 350px), Desktop: order-first (left, 700px) */}
      <div
        className={cn(
          "md:flex-[1_0_0] md:h-[700px]",
          "h-[350px] w-full",
          "relative overflow-hidden",
          "order-2 md:order-first",
        )}
      >
        <img
          src={artistImageUrl || "/placeholder.svg"}
          alt={artistName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </section>
  )
}
