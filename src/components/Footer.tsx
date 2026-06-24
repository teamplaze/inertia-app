// File: src/components/Footer.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export default function Footer() {
  return (
    <footer
      className="w-full flex flex-col items-center justify-end"
      style={{
        background: 'radial-gradient(ellipse at 50% 100%, rgba(62,149,142,1) 0%, rgba(47,112,107,1) 13.28%, rgba(31,75,71,1) 26.56%, rgba(23,56,53,1) 33.21%, rgba(16,37,36,1) 39.85%, rgba(8,19,18,1) 46.49%, rgba(4,9,9,1) 49.81%, #000 53.13%)',
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
              "text-[18px] md:text-[length:--font-size-btn-large]",
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
