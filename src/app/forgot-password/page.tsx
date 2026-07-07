'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/components/ui/auth-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    general?: string
  }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email.trim())
      newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Enter a valid email address'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordResetRequest = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage(data.message)
      } else {
        setErrors({ general: data.error || 'An unexpected error occurred.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard>
      {/* Heading */}
      <div className="flex flex-col gap-[var(--spacing-2)]">
        <h1
          className={cn(
            'font-heading font-medium',
            'text-[32px] leading-[1.2]',
            'text-white',
          )}
        >
          Forgot password?
        </h1>
        <p
          className={cn(
            'font-body font-normal',
            'text-[18px] leading-[1.5]',
            'text-[--color-text-200]',
          )}
        >
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Success state — show instead of form */}
      {successMessage ? (
        <div className="flex flex-col gap-[var(--spacing-6)]">
          <div
            className={cn(
              'flex items-start gap-[var(--spacing-3)]',
              'p-[var(--spacing-4)]',
              'rounded-[4px]',
            )}
            style={{
              background: 'rgba(62,149,142,0.15)',
              border: '1px solid var(--color-bg-teal)',
            }}
          >
            <span
              className="material-symbols-rounded text-[24px] leading-none shrink-0"
              style={{ color: 'var(--color-bg-teal)' }}
              aria-hidden="true"
            >
              check_circle
            </span>
            <p
              className={cn(
                'font-body font-normal',
                'text-[18px] leading-[1.5]',
                'text-white',
              )}
            >
              {successMessage}
            </p>
          </div>

          <Link href="/login" className="w-full">
            <Button variant="primary" size="lg" className="w-full">
              Back to log in
            </Button>
          </Link>
        </div>
      ) : (
        /* Form */
        <form
          onSubmit={handlePasswordResetRequest}
          noValidate
          className="flex flex-col gap-[var(--spacing-5)]"
        >
          {/* Email field */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label
              htmlFor="email"
              className={cn(
                'font-heading font-medium',
                'text-[14px] leading-[1.2]',
                'text-white',
              )}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setErrors(prev => ({ ...prev, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              required
            />
            {errors.email && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.email}
              </p>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <p className="font-body font-normal text-[14px] text-[#ff8383] text-center">
              {errors.general}
            </p>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>

          {/* Back to login */}
          <p
            className={cn(
              'font-body font-normal text-center',
              'text-[14px] leading-[1.5]',
              'text-[--color-text-200]',
            )}
          >
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-white underline hover:text-[var(--color-bg-teal)] transition-colors duration-150"
            >
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  )
}
