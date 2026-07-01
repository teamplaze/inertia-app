'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface DonateCardProps {
  project: Project
}

export function DonateCard({ project }: DonateCardProps) {
  const [amount, setAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)

  const handleDonate = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    setIsDonating(true)
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          amount: Number(amount),
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silent fail for now
    } finally {
      setIsDonating(false)
    }
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
      {/* Header */}
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
          <span className="font-body font-semibold text-[length:--font-size-body-base] leading-[1.2] text-white">
            DONATE
          </span>
        </div>

        {/* Title + sub */}
        <div className="flex flex-col gap-[4px]">
          <span className="font-heading font-medium text-[24px] leading-[1.2] text-white">
            Support {project.artist_name}
          </span>
          <span className="font-body font-normal text-[20px] leading-[1.5] text-[--wave-text-muted]">
            100% will go to support {project.artist_name}. No extra fees.
          </span>
        </div>
      </div>

      {/* Amount selector */}
      <div className="flex flex-col gap-[var(--spacing-3)]">
        {/* Preset buttons */}
        <div className="flex flex-col gap-[var(--spacing-4)] w-full">
          {(['10', '25', '50', '100'] as const).map(preset => (
            <button
              key={preset}
              onClick={() => setAmount(preset)}
              className={cn(
                'w-full flex items-center justify-center',
                'py-[var(--spacing-3)]',
                'border',
                'font-heading font-medium text-[18px] leading-[1.2]',
                'transition-colors duration-150',
                'bg-transparent',
                amount === preset ? 'text-white' : 'text-[--wave-text-muted]',
              )}
              style={{
                borderColor: amount === preset
                  ? 'var(--color-project-accent, var(--color-bg-teal))'
                  : 'var(--donate-amount-border)',
              }}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div
          className={cn(
            'flex items-center gap-[var(--spacing-3)]',
            'px-[var(--spacing-3)] py-[var(--spacing-3)]',
            'border',
            'w-full',
          )}
          style={{
            borderColor: amount && !['10', '25', '50', '100'].includes(amount)
              ? 'var(--color-project-accent, var(--color-bg-teal))'
              : 'var(--donate-amount-border)',
            background: 'var(--wave-bg)',
          }}
        >
          <span
            className="material-symbols-rounded text-[24px] leading-none text-[--wave-text-muted]"
            aria-hidden="true"
          >
            attach_money
          </span>
          <input
            type="number"
            min="1"
            placeholder="Custom amount"
            value={['10', '25', '50', '100'].includes(amount) ? '' : amount}
            onChange={e => setAmount(e.target.value)}
            className={cn(
              'flex-1 bg-transparent',
              'font-body font-normal text-[18px] leading-[1.5]',
              'text-[--color-text-200]',
              'placeholder:text-[--wave-text-muted]',
              'focus:outline-none',
            )}
          />
        </div>
      </div>

      {/* Donate button */}
      <button
        onClick={handleDonate}
        disabled={isDonating}
        className={cn(
          'w-full flex items-center justify-center',
          'bg-transparent text-white',
          'font-heading font-medium',
          'text-[length:--font-size-btn-large]',
          'leading-[1.2] tracking-normal',
          'rounded-none',
          'transition-colors duration-150',
          'hover:border-[var(--color-project-accent,var(--color-bg-teal))]',
          'hover:text-[var(--color-project-accent,var(--color-bg-teal))]',
          'disabled:cursor-not-allowed',
        )}
        style={{
          padding: '16px 20px',
          border: '2px solid #ffffff',
          alignSelf: 'stretch',
        }}
      >
        {isDonating ? 'Processing...' : 'Donate'}
      </button>
    </div>
  )
}
