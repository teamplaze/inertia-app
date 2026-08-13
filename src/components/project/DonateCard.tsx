'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface DonateCardProps {
  project: Project
  onDonate: (amount: number, coverFee: boolean) => Promise<void>
  variant?: 'default' | 'compact'
}

export function DonateCard({ project, onDonate, variant = 'default' }: DonateCardProps) {
  const isCompact = variant === 'compact'
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [coverFee, setCoverFee] = useState(true)
  const [isDonating, setIsDonating] = useState(false)

  const handleDonate = async () => {
    const finalAmount = selectedPreset !== null
      ? selectedPreset
      : Number(customAmount)
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return
    setIsDonating(true)
    try {
      await onDonate(finalAmount, coverFee)
    } finally {
      setIsDonating(false)
    }
  }

  const header = (
    <div className="flex flex-col gap-[var(--spacing-4)]">
      {/* Badge */}
      <div
        className={cn(
          'inline-flex items-center gap-[var(--spacing-2)]',
          'px-[var(--spacing-2)] py-[2px]',
          'rounded-[4px] border w-fit',
        )}
        style={{
          borderColor: 'var(--color-project-accent, var(--color-bg-teal))',
        }}
      >
        <span
          className="material-symbols-rounded text-[18px] leading-none"
          style={{
            color: 'var(--color-project-accent, var(--color-bg-teal))',
          }}
          aria-hidden="true"
        >
          paid
        </span>
        <span className="font-body font-semibold text-[18px] leading-[1.2] text-white">
          DONATE
        </span>
      </div>

      {/* Title + sub */}
      <div className="flex flex-col gap-[4px]">
        <span className="font-heading font-medium text-[24px] leading-[1.2] text-white">
          Support {project.artist_name}
        </span>
        <span className="font-body font-normal text-[20px] leading-[1.5] text-[var(--wave-text-muted)]">
          100% will go to support {project.artist_name}. No extra fees.
        </span>
      </div>
    </div>
  )

  const presetButtons = (
    <div className={cn('flex flex-col gap-[var(--spacing-4)] w-full', isCompact && 'md:flex-row md:w-auto md:shrink-0 md:gap-[var(--spacing-2)]')}>
      {[10, 25, 50, 100].map(preset => (
        <button
          key={preset}
          onClick={() => {
            setSelectedPreset(preset)
            setCustomAmount('')
          }}
          className={cn(
            'w-full px-[var(--spacing-3)] py-[var(--spacing-3)]',
            'border text-center',
            'font-body font-normal text-[18px] leading-[1.5]',
            'rounded-none transition-colors duration-150',
            selectedPreset === preset ? 'text-white' : 'text-[var(--color-text-200)]',
            isCompact && 'md:w-[76px] md:py-[var(--spacing-2)]',
          )}
          style={{
            background: 'var(--wave-bg)',
            borderColor: selectedPreset === preset
              ? 'var(--color-project-accent, var(--color-bg-teal))'
              : 'var(--donate-amount-border)',
          }}
        >
          ${preset}
        </button>
      ))}
    </div>
  )

  const customInput = (
    <div
      className={cn(
        'flex items-center gap-[var(--spacing-3)]',
        'px-[var(--spacing-3)] py-[var(--spacing-3)]',
        'border w-full',
        isCompact && 'md:flex-1 md:min-w-[160px] md:py-[var(--spacing-2)]',
      )}
      style={{
        background: 'var(--wave-bg)',
        borderColor: customAmount
          ? 'var(--color-project-accent, var(--color-bg-teal))'
          : 'var(--donate-amount-border)',
      }}
    >
      <span
        className="material-symbols-rounded text-[24px] leading-none text-[var(--wave-text-muted)]"
        aria-hidden="true"
      >
        attach_money
      </span>
      <input
        type="number"
        min="1"
        placeholder="Custom amount"
        value={customAmount}
        onFocus={() => setSelectedPreset(null)}
        onChange={e => {
          setCustomAmount(e.target.value)
          setSelectedPreset(null)
        }}
        className={cn(
          'flex-1 bg-transparent text-left',
          'font-body font-normal text-[18px] leading-[1.5]',
          'text-[var(--color-text-200)]',
          'placeholder:text-[var(--wave-text-muted)] placeholder:text-left',
          'focus:outline-none',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />
    </div>
  )

  const feeCheckbox = (
    <label
      className={cn(
        'flex items-center gap-[var(--spacing-3)]',
        'cursor-pointer',
      )}
    >
      <input
        type="checkbox"
        checked={coverFee}
        onChange={e => setCoverFee(e.target.checked)}
        className="w-4 h-4 accent-[var(--color-project-accent,var(--color-bg-teal))] cursor-pointer"
      />
      <span
        className={cn(
          'font-body font-normal text-[14px] leading-[1.5]',
          'text-[var(--color-text-200)]',
        )}
      >
        Cover processing fee so the artist gets 100% of your donation
      </span>
    </label>
  )

  const donateButton = (
    <button
      onClick={handleDonate}
      disabled={isDonating || (selectedPreset === null && (!customAmount || Number(customAmount) <= 0))}
      className={cn(
        'w-full flex items-center justify-center',
        'bg-transparent text-white',
        'font-heading font-medium',
        'text-[18px]',
        'leading-[1.2] tracking-normal',
        'rounded-none',
        'transition-colors duration-150',
        'hover:border-[var(--color-project-accent,var(--color-bg-teal))]',
        'hover:text-[var(--color-project-accent,var(--color-bg-teal))]',
        'disabled:hover:border-white',
        'disabled:hover:text-white',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        isCompact && 'md:w-auto md:shrink-0',
      )}
      style={{
        padding: '16px 20px',
        border: '2px solid #ffffff',
        alignSelf: isCompact ? undefined : 'stretch',
      }}
    >
      {isDonating ? 'Processing...' : 'Donate'}
    </button>
  )

  if (isCompact) {
    return (
      <div
        className={cn(
          'flex flex-col',
          'rounded-[12px] overflow-hidden',
          'border border-[var(--donate-border)]',
          'w-full',
          'px-[20px] py-[32px]',
          'gap-[32px]',
        )}
        style={{ background: 'var(--donate-bg)' }}
      >
        {header}

        {/* Row 2 — preset buttons, custom input, donate button */}
        <div className="flex flex-col gap-[var(--spacing-3)] md:flex-row md:flex-wrap md:items-stretch md:gap-[var(--spacing-4)]">
          {presetButtons}
          {customInput}
          {donateButton}
        </div>

        {/* Row 3 — fee checkbox */}
        {feeCheckbox}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-between',
        'h-full',
        'rounded-[12px] overflow-hidden',
        'border border-[var(--donate-border)]',
        'px-[var(--spacing-5)] py-[var(--spacing-8)]',
        'gap-[var(--spacing-8)]',
      )}
      style={{ background: 'var(--donate-bg)' }}
    >
      {header}

      {/* Amount selector */}
      <div className="flex flex-col gap-[var(--spacing-3)]">
        {presetButtons}
        {customInput}
      </div>

      {feeCheckbox}
      {donateButton}
    </div>
  )
}
