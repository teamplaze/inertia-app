type LogoVariant = "default" | "underline"
type LogoColor = "teal" | "black" | "white"

interface LogoProps {
  variant?: LogoVariant
  color?: LogoColor
  width?: number
  className?: string
  alt?: string
}

export function Logo({
  variant = "default",
  color = "teal",
  width = 200,
  className,
  alt = "Inertia",
}: LogoProps) {
  const src = `/logo/inertia-${color}${variant === "underline" ? "-underline" : ""}.svg`

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height="auto"
      className={className}
    />
  )
}
