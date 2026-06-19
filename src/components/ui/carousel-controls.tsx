"use client"

import { cn } from "@/lib/utils"

interface CarouselControlsProps {
  count: number
  activeIndex: number
  onDotClick?: (index: number) => void
  onPrev?: () => void
  onNext?: () => void
  className?: string
}

export function CarouselControls({
  count,
  activeIndex,
  onDotClick,
  onPrev,
  onNext,
  className,
}: CarouselControlsProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {/* Dot indicators */}
      <div
        className="flex items-center"
        style={{ gap: "var(--carousel-dot-gap)" }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => onDotClick?.(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "rounded-[100px] transition-colors duration-150",
              "focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]"
            )}
            style={{
              width: "var(--carousel-dot-size)",
              height: "var(--carousel-dot-size)",
              background:
                i === activeIndex
                  ? "var(--carousel-dot-active)"
                  : "transparent",
              border:
                i === activeIndex
                  ? "none"
                  : "2px solid var(--carousel-dot-inactive-border)",
            }}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <div
        className="flex items-center"
        style={{ gap: "var(--carousel-arrow-gap)" }}
      >
        <button
          onClick={onPrev}
          aria-label="Previous slide"
          className={cn(
            "flex items-center justify-center",
            "bg-transparent",
            "border-2 border-[--carousel-arrow-border]",
            "rounded-none",
            "transition-colors duration-150",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
            "focus-visible:ring-offset-2"
          )}
          style={{ padding: "var(--carousel-arrow-padding)" }}
        >
          <span
            className="material-symbols-rounded leading-[1.2]"
            style={{
              fontSize: "18px",
              width: "22px",
              color: "var(--carousel-arrow-icon)",
            }}
            aria-hidden="true"
          >
            arrow_back
          </span>
        </button>

        <button
          onClick={onNext}
          aria-label="Next slide"
          className={cn(
            "flex items-center justify-center",
            "bg-transparent",
            "border-2 border-[--carousel-arrow-border]",
            "rounded-none",
            "transition-colors duration-150",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
            "focus-visible:ring-offset-2"
          )}
          style={{ padding: "var(--carousel-arrow-padding)" }}
        >
          <span
            className="material-symbols-rounded leading-[1.2]"
            style={{
              fontSize: "18px",
              width: "22px",
              color: "var(--carousel-arrow-icon)",
            }}
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  )
}
