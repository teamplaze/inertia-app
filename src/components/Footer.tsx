// File: src/components/Footer.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export default function Footer() {
  return (
    <footer
      className="w-full flex flex-col items-center justify-end"
      style={{
        background: 'radial-gradient(ellipse at 50% 100%, var(--color-project-accent, rgba(62,149,142,1)) 0%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 75%, #000) 13.28%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 50%, #000) 26.56%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 37%, #000) 33.21%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 25%, #000) 39.85%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 12%, #000) 46.49%, color-mix(in srgb, var(--color-project-accent, rgba(62,149,142,1)) 6%, #000) 49.81%, #000 53.13%)',
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '96px',
        paddingRight: '96px',
        gap: '64px',
      }}
    >
      {/* Nav links + copyright row */}
      <div
        className={cn(
          "flex items-center justify-between w-full",
          "flex-col gap-[var(--spacing-6)] text-center",
          "md:flex-row md:gap-0 md:text-left",
        )}
      >
        {/* Nav links */}
        <div
          className={cn(
            "flex items-center",
            "gap-[var(--spacing-8)]",
            "flex-wrap justify-center md:justify-start",
          )}
        >
          <Link
            href="/network"
            className={cn(
              "font-heading font-medium",
              "text-[18px] md:text-[18px]",
              "leading-[1.2] tracking-normal",
              "text-white hover:opacity-70",
              "transition-opacity duration-150",
            )}
          >
            Join Our Network
          </Link>
        </div>

        {/* Copyright */}
        <p
          className={cn(
            "font-body font-normal",
            "text-[14px] leading-[1.5]",
            "text-white",
          )}
        >
          © {new Date().getFullYear()} Inertia. All rights reserved.
        </p>
      </div>

      {/* Large INERTIA wordmark */}
      <div className="w-full">
        <Logo
          variant="default"
          color="white"
          width={1440}
          className="w-full h-auto"
        />
      </div>
    </footer>
  );
}
