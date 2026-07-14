import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  amountRaised: string
  goal: string
  percentFunded?: number
  backerCount?: number
  showDetails?: boolean
  mobile?: boolean
  className?: string
}

export function ProgressBar({
  value,
  amountRaised,
  goal,
  percentFunded,
  backerCount,
  showDetails = true,
  mobile = false,
  className,
}: ProgressBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full",
        mobile ? "gap-[var(--spacing-4)]" : "gap-[var(--spacing-6)]",
        className
      )}
    >
      {/* Money progress row */}
      <div className="flex items-baseline justify-between w-full">
        <span
          className={cn(
            "font-heading font-medium leading-[1.2]",
            "text-[var(--progress-text-amount)]",
            mobile ? "text-[20px]" : "text-[24px]"
          )}
        >
          {amountRaised}
        </span>

        <span
          className={cn(
            "font-body font-normal leading-[1.5]",
            "text-[var(--progress-text-goal)]",
            mobile ? "text-[16px]" : "text-[18px]"
          )}
        >
          {goal}
        </span>
      </div>

      {/* Track + Fill */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "var(--progress-track-height)",
          background: "var(--progress-track-bg)",
          borderRadius: "var(--progress-radius)",
        }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            background: "var(--color-project-accent, var(--color-bg-teal))",
            borderRadius: "var(--progress-radius)",
          }}
        />
      </div>

      {/* Stats row */}
      {showDetails && (
        <div className="flex items-center justify-between w-full">
          {percentFunded !== undefined && (
            <div className="flex items-center gap-[4px]">
              <span
                className={cn(
                  "material-symbols-rounded leading-none",
                  "text-[var(--progress-text-amount)]",
                  mobile ? "text-[18px]" : "text-[24px]"
                )}
                aria-hidden="true"
              >
                percent
              </span>
              <span
                className={cn(
                  "font-body font-normal leading-[1.5]",
                  "text-[var(--progress-text-stats)]",
                  mobile ? "text-[14px]" : "text-[18px]"
                )}
              >
                {percentFunded}% funded
              </span>
            </div>
          )}

          {backerCount !== undefined && (
            <div className="flex items-center gap-[4px]">
              <span
                className={cn(
                  "material-symbols-rounded leading-none",
                  "text-[var(--progress-text-amount)]",
                  mobile ? "text-[18px]" : "text-[24px]"
                )}
                aria-hidden="true"
              >
                people
              </span>
              <span
                className={cn(
                  "font-body font-normal leading-[1.5]",
                  "text-[var(--progress-text-stats)]",
                  mobile ? "text-[14px]" : "text-[18px]"
                )}
              >
                {backerCount} backers
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
