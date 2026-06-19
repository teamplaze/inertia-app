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
        mobile ? "gap-[--spacing-4]" : "gap-[--spacing-5]",
        className
      )}
    >
      {/* Money progress row */}
      <div className="flex items-baseline justify-between w-full">
        <span
          className={cn(
            "font-heading font-medium leading-[1.2]",
            "text-[--progress-text-amount]",
            mobile ? "text-[length:--font-size-h5]" : "text-[24px]"
          )}
        >
          {amountRaised}
        </span>

        <span
          className={cn(
            "font-body font-normal leading-[1.5]",
            "text-[--progress-text-goal]",
            mobile ? "text-[16px]" : "text-[length:--font-size-body-base]"
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
        <div className="flex items-center gap-[--spacing-4]">
          {percentFunded !== undefined && (
            <div className="flex items-center gap-[4px]">
              <span
                className={cn(
                  "material-symbols-rounded leading-none",
                  "text-[--progress-text-amount]",
                  mobile ? "text-[18px]" : "text-[24px]"
                )}
                aria-hidden="true"
              >
                percent
              </span>
              <span
                className={cn(
                  "font-body font-normal leading-[1.5]",
                  "text-[--progress-text-stats]",
                  mobile ? "text-[14px]" : "text-[length:--font-size-body-base]"
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
                  "text-[--progress-text-amount]",
                  mobile ? "text-[18px]" : "text-[24px]"
                )}
                aria-hidden="true"
              >
                people
              </span>
              <span
                className={cn(
                  "font-body font-normal leading-[1.5]",
                  "text-[--progress-text-stats]",
                  mobile ? "text-[14px]" : "text-[length:--font-size-body-base]"
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
