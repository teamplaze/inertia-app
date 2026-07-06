import { cn } from "@/lib/utils"

interface ArtistCardProps {
  imageSrc: string
  imageAlt: string
  artistName: string
  tag: string
  mobile?: boolean
  className?: string
}

export function ArtistCard({
  imageSrc,
  imageAlt,
  artistName,
  tag,
  mobile = false,
  className,
}: ArtistCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col justify-end",
        "rounded-[var(--card-radius)]",
        mobile ? "w-[300px] h-[300px]" : "w-[400px] h-[400px]",
        "p-[var(--spacing-6)]",
        "gap-[var(--spacing-3)]",
        className
      )}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-[var(--spacing-3)]">
        <span
          className={cn(
            "font-heading font-medium leading-[1.2]",
            "text-[--card-text-primary]",
            "text-[32px]"
          )}
        >
          {artistName}
        </span>
        <span
          className={cn(
            "font-body font-normal leading-[1.5]",
            "text-[--card-text-secondary]",
            "text-[18px]"
          )}
        >
          {tag}
        </span>
      </div>
    </div>
  )
}
