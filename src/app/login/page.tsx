'use client'

import { useState, type FormEvent, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/components/ui/auth-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function LoginForm() {
  const searchParams = useSearchParams()

  const redirectUrl = searchParams.get('redirect')
  const action = searchParams.get('action')
  const projectId = searchParams.get('projectId')
  const tierId = searchParams.get('tierId')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email.trim())
      newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Enter a valid email address'
    if (!password)
      newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else if (action === 'checkout' && projectId) {
        window.location.href = `/projects/${projectId}`
      } else {
        window.location.href = data.redirectTo || '/'
      }
    } else {
      setErrors({ general: data.details || 'Invalid credentials.' })
      setIsLoading(false)
    }
  }

  const getSignUpUrl = () => {
    const params = new URLSearchParams()
    if (action) params.set('action', action)
    if (projectId) params.set('projectId', projectId)
    if (tierId) params.set('tierId', tierId)
    if (redirectUrl) params.set('redirect', redirectUrl)

    const queryString = params.toString()
    return queryString ? `/sign-up?${queryString}` : '/sign-up'
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
          Log in
        </h1>
        <p
          className={cn(
            'font-body font-normal',
            'text-[18px] leading-[1.5]',
            'text-[--color-text-200]',
          )}
        >
          Welcome back.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleLoginSubmit}
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

        {/* Password field */}
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className={cn(
                'font-heading font-medium',
                'text-[14px] leading-[1.2]',
                'text-white',
              )}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className={cn(
                'font-body font-normal',
                'text-[14px] leading-[1.2]',
                'text-[--color-text-200]',
                'underline',
                'hover:text-white',
                'transition-colors duration-150',
              )}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
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
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      {/* Sign up link */}
      <p
        className={cn(
          'font-body font-normal text-center',
          'text-[14px] leading-[1.5]',
          'text-[--color-text-200]',
        )}
      >
        Don&apos;t have an account?{' '}
        <Link
          href={getSignUpUrl()}
          className="text-white underline hover:text-[--color-bg-teal] transition-colors duration-150"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
