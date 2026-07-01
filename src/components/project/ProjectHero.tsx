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
  projectTitle?: string
  description: string
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
  description,
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
        {showProjectResults && projectResultsHref && (
          <div className="absolute top-[var(--spacing-4)] right-[var(--spacing-4)]">
            <Link href={projectResultsHref}>
              <button
                className={cn(
                  "flex items-center justify-center",
                  "bg-white text-black",
                  "font-heading font-medium",
                  "text-[length:--font-size-btn-base]",
                  "leading-[1.2]",
                  "px-[var(--spacing-5)] py-[var(--spacing-4)]",
                  "rounded-none",
                  "transition-colors duration-150",
                  "hover:bg-[var(--color-project-accent,var(--color-bg-teal))]",
                  "hover:text-white",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[--color-border-focus]",
                )}
              >
                Project Results
              </button>
            </Link>
          </div>
        )}

        {/* Intro block */}
        <div className="flex flex-col gap-[var(--spacing-2)] w-full">
          {projectTitle && (
            <span
              className={cn(
                "font-body font-normal leading-[1.2]",
                "text-[16px] md:text-[length:--font-size-body-base]",
                "text-[--hero-text-tag]",
              )}
            >
              {projectTitle}
            </span>
          )}

          <h1
            className={cn(
              "font-heading font-medium leading-[1.2]",
              "text-[32px] md:text-[60px]",
              "text-[--hero-text-name]",
            )}
          >
            {artistName}
          </h1>

          <p
            className={cn(
              "font-body font-normal leading-[1.5]",
              "text-[18px] md:text-[20px]",
              "text-[--hero-text-desc]",
            )}
          >
            {description}
          </p>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={fundingPercentage}
          amountRaised={`$${currentFunding.toLocaleString()}`}
          goal={`of $${fundingGoal.toLocaleString()}`}
          percentFunded={fundingPercentage}
          backerCount={backerCount}
          showDetails={true}
          className="w-full"
        />

        {/* CTA Button */}
        <button
          onClick={onSupportClick}
          className={cn(
            "w-full", "flex items-center justify-center",
            "bg-white text-black",
            "font-heading font-medium",
            "text-[length:--font-size-btn-large]",
            "leading-[1.2]",
            "px-[var(--spacing-5)] py-[var(--spacing-4)]",
            "rounded-none",
            "transition-colors duration-150",
            "hover:bg-[var(--color-project-accent,var(--color-bg-teal))]",
            "hover:text-white",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[--color-border-focus]",
          )}
        >
          Support {artistName}
        </button>

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
