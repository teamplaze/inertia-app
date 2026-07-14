'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Tier, Project } from '@/types'
import { CountdownTimer } from './CountdownTimer'

interface WaveCardProps {
  tier: Tier
  project: Project
  user: { id: string } | null
  paymentsEnabled: boolean
  onPurchase: (tierId: number) => Promise<void>
}

export function WaveCard({
  tier,
  project,
  user,
  paymentsEnabled,
  onPurchase,
}: WaveCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  const now = new Date()
  const saleEnded = tier.sale_end_at ? new Date(tier.sale_end_at) < now : false
  const saleStarted = tier.sale_start_at ? new Date(tier.sale_start_at) <= now : true

  const isActive = tier.status === 'active' && !saleEnded && saleStarted
  const isClosed = tier.status === 'closed' || (tier.status === 'active' && saleEnded)

  const waveNumber = tier.name.match(/\d+/)?.[0] ?? '1'

  const exclusivePerks = tier.perks.filter(p => p.is_exclusive)
  const standardPerks = tier.perks.filter(p => !p.is_exclusive)

  const handleJoinWaitlist = async () => {
    if (!user) return
    setIsJoining(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          tierId: tier.id,
        }),
      })
      setHasJoined(true)
    } catch {
      // silent fail — matches existing TierCard behavior
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-between',
        'rounded-[12px] overflow-hidden',
        'border',
        'px-[var(--spacing-5)] py-[var(--spacing-8)]',
        'gap-[var(--spacing-10)]',
      )}
      style={{
        background: 'var(--wave-bg)',
        borderColor: isActive
          ? 'var(--color-project-accent, var(--color-bg-teal))'
          : 'var(--wave-border-closed)',
      }}
    >
      {/* Section 1 — Badge + Price */}
      <div className="flex flex-col gap-[var(--spacing-4)]">
        {/* Badge */}
        <div
          className={cn(
            'inline-flex items-center gap-[var(--spacing-2)]',
            'px-[var(--spacing-2)] py-[2px]',
            'rounded-[4px]',
            'border',
            'w-fit',
          )}
          style={{
            borderColor: isActive
              ? 'var(--color-project-accent, var(--color-bg-teal))'
              : 'var(--wave-border-closed)',
          }}
        >
          <span
            className="material-symbols-rounded text-[18px] leading-none"
            style={{
              color: isActive
                ? 'var(--color-project-accent, var(--color-bg-teal))'
                : 'var(--wave-text-muted)',
            }}
            aria-hidden="true"
          >
            bolt
          </span>
          <span
            className={cn(
              'font-body font-semibold',
              'text-[18px]',
              'leading-[1.2]',
              isActive ? 'text-white' : 'text-[var(--wave-text-muted)]',
            )}
          >
            WAVE {waveNumber} &bull; {isActive ? 'Live' : 'Closed'}
          </span>
        </div>

        {/* Price block */}
        <div className="flex flex-col gap-[4px]">
          <span
            className={cn(
              'font-heading font-medium',
              'text-[32px] leading-[1.2]',
              isActive ? 'text-white' : 'text-[var(--wave-text-muted)]',
            )}
          >
            ${tier.price}
          </span>
          <span
            className={cn(
              'font-body font-normal',
              'text-[20px] leading-[1.5]',
              'text-[var(--wave-text-muted)]',
            )}
          >
            {tier.description}
          </span>
        </div>
      </div>

      {/* Section 2 — Alert bar */}
      {isActive && tier.sale_end_at && (
        <CountdownTimer
          endDate={tier.sale_end_at}
          label={`Wave ${waveNumber} closes in`}
        />
      )}

      {isClosed && (
        <div
          className={cn(
            'flex items-center gap-[2px]',
            'px-[var(--spacing-3)] py-[var(--spacing-2)]',
            'rounded-[4px]',
          )}
          style={{ background: '#262c2b' }}
        >
          <span
            className="material-symbols-rounded text-[18px] leading-none text-[var(--wave-text-muted)]"
            aria-hidden="true"
          >
            timer
          </span>
          <span className="font-body font-normal text-[18px] text-white">
            Wave {waveNumber} has closed
          </span>
        </div>
      )}

      {/* Section 3 — Perks list */}
      <div className="flex flex-col gap-[var(--spacing-4)]">
        <span
          className={cn(
            'font-body font-semibold',
            'text-[18px]',
            'text-[var(--wave-text-muted)]',
          )}
        >
          WHAT YOU GET
        </span>

        <div className="flex flex-col gap-[var(--spacing-4)]">
          {exclusivePerks.map(perk => (
            <div
              key={perk.id}
              className="flex items-start gap-[var(--spacing-2)]"
            >
              <span
                className="material-symbols-rounded text-[24px] leading-none shrink-0"
                style={{
                  color: isActive
                    ? 'var(--color-project-accent, var(--color-bg-teal))'
                    : 'var(--wave-text-muted)',
                }}
                aria-hidden="true"
              >
                star
              </span>
              <span
                className={cn(
                  'font-body font-normal text-[18px] leading-[1.5]',
                  isActive ? 'text-white' : 'text-[var(--wave-text-muted)]',
                )}
              >
                {perk.label}
              </span>
            </div>
          ))}

          {standardPerks.map(perk => (
            <div
              key={perk.id}
              className="flex items-start gap-[var(--spacing-2)]"
            >
              <span
                className="material-symbols-rounded text-[24px] leading-none shrink-0"
                style={{
                  color: isActive ? 'white' : 'var(--wave-text-muted)',
                }}
                aria-hidden="true"
              >
                check
              </span>
              <span
                className={cn(
                  'font-body font-normal text-[18px] leading-[1.5]',
                  isActive ? 'text-white' : 'text-[var(--wave-text-muted)]',
                )}
              >
                {perk.label}
              </span>
            </div>
          ))}
        </div>

        {exclusivePerks.length > 0 && (
          <span className="font-body font-normal text-[18px] text-[var(--wave-text-muted)]">
            *exclusive
          </span>
        )}
      </div>

      {/* Section 4 — CTA */}
      <div className="flex flex-col gap-[var(--spacing-3)]">
        {isActive && paymentsEnabled && (
          <button
            onClick={async () => {
              if (isPurchasing) return
              setIsPurchasing(true)
              try {
                await onPurchase(tier.id)
              } finally {
                setIsPurchasing(false)
              }
            }}
            disabled={isPurchasing}
            className={cn(
              'w-full flex items-center justify-center',
              'bg-white text-black',
              'font-heading font-medium',
              'text-[18px]',
              'leading-[1.2] tracking-normal',
              'px-[var(--spacing-5)] py-[var(--spacing-4)]',
              'rounded-none',
              'transition-colors duration-150',
              'hover:bg-[var(--color-project-accent,var(--color-bg-teal))]',
              'hover:text-white',
              'disabled:opacity-70 disabled:cursor-not-allowed',
            )}
          >
            {isPurchasing ? 'Processing...' : 'Claim your spot'}
          </button>
        )}

        {isClosed && (
          <>
            {user ? (
              <button
                onClick={handleJoinWaitlist}
                disabled={isJoining || hasJoined}
                className={cn(
                  'w-full flex items-center justify-center',
                  'bg-white text-black',
                  'font-heading font-medium',
                  'text-[18px]',
                  'leading-[1.2] tracking-normal',
                  'px-[var(--spacing-5)] py-[var(--spacing-4)]',
                  'rounded-none',
                  'transition-colors duration-150',
                  'hover:bg-[var(--color-project-accent,var(--color-bg-teal))]',
                  'hover:text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {hasJoined
                  ? "You're on the list ✓"
                  : isJoining
                  ? 'Joining...'
                  : 'Join the waitlist'}
              </button>
            ) : (
              <a
                href={`/sign-up?action=waitlist&projectId=${project.id}&tierId=${tier.id}`}
                className={cn(
                  'w-full flex items-center justify-center',
                  'bg-white text-black',
                  'font-heading font-medium',
                  'text-[18px]',
                  'leading-[1.2] tracking-normal',
                  'px-[var(--spacing-5)] py-[var(--spacing-4)]',
                  'rounded-none',
                  'transition-colors duration-150',
                  'hover:bg-[var(--color-project-accent,var(--color-bg-teal))]',
                  'hover:text-white',
                )}
              >
                Join the waitlist
              </a>
            )}

            <p className="font-body font-normal text-[14px] leading-[1.5] text-[var(--wave-text-muted)] text-center">
              *Additional Waves may become available, but are not guaranteed.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
