'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/components/ui/auth-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!password)
      newErrors.password = 'Password is required'
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
    const data = await response.json()

    if (response.ok) {
      setSuccessMessage(
        data.message +
        ' You will be redirected to the login page shortly.'
      )
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
      // isLoading stays true intentionally
    } else {
      setErrors({
        general: data.details ||
          'Failed to reset password. The link may have expired.',
      })
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
          Reset password
        </h1>
        <p
          className={cn(
            'font-body font-normal',
            'text-[18px] leading-[1.5]',
            'text-[--color-text-200]',
          )}
        >
          Choose a new password for your account.
        </p>
      </div>

      {/* Success state */}
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
        </div>
      ) : (
        /* Form */
        <form
          onSubmit={handlePasswordReset}
          noValidate
          className="flex flex-col gap-[var(--spacing-5)]"
        >
          {/* New password field */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label
              htmlFor="password"
              className={cn(
                'font-heading font-medium',
                'text-[14px] leading-[1.2]',
                'text-white',
              )}
            >
              New password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrors(prev => ({ ...prev, password: undefined }))
                }}
                aria-invalid={!!errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'absolute right-[var(--spacing-3)]',
                  'top-1/2 -translate-y-1/2',
                  'text-[--color-text-300]',
                  'hover:text-white',
                  'transition-colors duration-150',
                  'focus-visible:outline-none',
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span
                  className="material-symbols-rounded text-[24px] leading-none"
                  aria-hidden="true"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm password field */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label
              htmlFor="confirmPassword"
              className={cn(
                'font-heading font-medium',
                'text-[14px] leading-[1.2]',
                'text-white',
              )}
            >
              Confirm new password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }}
                aria-invalid={!!errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={cn(
                  'absolute right-[var(--spacing-3)]',
                  'top-1/2 -translate-y-1/2',
                  'text-[--color-text-300]',
                  'hover:text-white',
                  'transition-colors duration-150',
                  'focus-visible:outline-none',
                )}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <span
                  className="material-symbols-rounded text-[24px] leading-none"
                  aria-hidden="true"
                >
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.confirmPassword}
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
            {isLoading ? 'Resetting...' : 'Reset password'}
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
