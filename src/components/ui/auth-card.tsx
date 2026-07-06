'use client'

import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <main
      className={cn(
        "min-h-screen w-full",
        "flex items-center justify-center",
        "bg-black",
        "px-[var(--spacing-5)] py-[var(--spacing-12)]",
      )}
    >
      <div
        className={cn(
          "w-full max-w-[560px]",
          "flex flex-col",
          "gap-[var(--spacing-6)]",
          "p-[var(--spacing-8)]",
          "rounded-[12px]",
          className,
        )}
        style={{
          background: '#0f1111',
          border: '1px solid #3f4948',
        }}
      >
        {children}
      </div>
    </main>
  )
}
