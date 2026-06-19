"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type CarouselContextType = {
  scrollRef: React.RefObject<HTMLDivElement | null>
  scrollPrev: () => void
  scrollNext: () => void
}

const CarouselContext = React.createContext<CarouselContextType | null>(null)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("useCarousel must be used within a Carousel")
  return ctx
}

function Carousel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scrollPrev = React.useCallback(() => {
    scrollRef.current?.scrollBy({
      left: -(scrollRef.current.offsetWidth),
      behavior: "smooth",
    })
  }, [])

  const scrollNext = React.useCallback(() => {
    scrollRef.current?.scrollBy({
      left: scrollRef.current.offsetWidth,
      behavior: "smooth",
    })
  }, [])

  return (
    <CarouselContext.Provider value={{ scrollRef, scrollPrev, scrollNext }}>
      <div data-slot="carousel" className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { scrollRef } = useCarousel()
  return (
    <div className="overflow-hidden">
      <div
        ref={scrollRef}
        data-slot="carousel-content"
        className={cn("flex", className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollPrev } = useCarousel()
  return (
    <button
      data-slot="carousel-previous"
      onClick={scrollPrev}
      aria-label="Previous slide"
      className={cn(
        "flex items-center justify-center",
        "bg-transparent",
        "border-2 border-[--carousel-arrow-border]",
        "rounded-none",
        "transition-colors duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
        "focus-visible:ring-offset-2",
        className
      )}
      style={{ padding: "var(--carousel-arrow-padding)" }}
      {...props}
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
  )
}

function CarouselNext({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollNext } = useCarousel()
  return (
    <button
      data-slot="carousel-next"
      onClick={scrollNext}
      aria-label="Next slide"
      className={cn(
        "flex items-center justify-center",
        "bg-transparent",
        "border-2 border-[--carousel-arrow-border]",
        "rounded-none",
        "transition-colors duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[--color-border-focus]",
        "focus-visible:ring-offset-2",
        className
      )}
      style={{ padding: "var(--carousel-arrow-padding)" }}
      {...props}
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
  )
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
