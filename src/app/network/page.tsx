'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AuthCard } from '@/components/ui/auth-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const SPECIALTIES = [
  'Graphic Design',
  'Videography/Photography',
  'Publicity',
  'Marketing',
  'Social Media/Branding',
  'Studio Engineering/Producing',
  'Media Influencer',
  'Artist Management',
  'Booking Agent',
  'Legal/Lawyer',
  'Financial Management',
  'Content Management',
]

const CONTACT_METHODS = ['Email', 'Phone']

export default function NetworkPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    specialty?: string
    contactMethod?: string
    general?: string
  }>({})

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [contactMethod, setContactMethod] = useState('')
  const [socials, setSocials] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [genre, setGenre] = useState('')

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!firstName.trim())
      newErrors.firstName = 'First name is required'
    if (!lastName.trim())
      newErrors.lastName = 'Last name is required'
    if (!email.trim())
      newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Enter a valid email address'
    if (!specialty)
      newErrors.specialty = 'Please select a specialty'
    if (!contactMethod)
      newErrors.contactMethod = 'Please select a contact method'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          companyName, specialty, contactMethod,
          socials, portfolio, genre,
        }),
      })
      if (response.ok) {
        setSuccessMessage(
          "Thank you for joining our network! We'll be in touch soon."
        )
        setFirstName(''); setLastName('')
        setEmail(''); setPhone('')
        setCompanyName(''); setSpecialty('')
        setContactMethod(''); setSocials('')
        setPortfolio(''); setGenre('')
      } else {
        const errorData = await response.json()
        setErrors({
          general: errorData.details || 'Submission failed. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard className="max-w-[768px]">
      {/* Heading */}
      <div className="flex flex-col w-full gap-[var(--spacing-2)]">
        <h1
          className={cn(
            'font-heading font-medium',
            'text-[32px] leading-[1.2] text-white',
          )}
        >
          Join Our Network
        </h1>
        <p
          className={cn(
            'font-body font-normal',
            'text-[18px] leading-[1.5]',
            'text-[--color-text-200]',
          )}
        >
          Complete this form to be listed in our network and become visible to
          artists looking for your specialty.
        </p>
      </div>

      {/* Success state */}
      {successMessage ? (
        <div
          className={cn(
            'flex items-start gap-[var(--spacing-3)]',
            'p-[var(--spacing-4)] rounded-[4px] w-full',
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
          <p className="font-body font-normal text-[18px] leading-[1.5] text-white">
            {successMessage}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col w-full gap-[var(--spacing-5)]"
        >
          {/* First + Last name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-4)]">
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="firstName"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                First Name <span className="text-[#ff8383]">*</span>
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e => {
                  setFirstName(e.target.value)
                  setErrors(p => ({ ...p, firstName: undefined }))
                }}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="font-body font-normal text-[14px] text-[#ff8383]">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="lastName"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                Last Name <span className="text-[#ff8383]">*</span>
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={e => {
                  setLastName(e.target.value)
                  setErrors(p => ({ ...p, lastName: undefined }))
                }}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="font-body font-normal text-[14px] text-[#ff8383]">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label
              htmlFor="email"
              className="font-heading font-medium text-[14px] leading-[1.2] text-white"
            >
              Email <span className="text-[#ff8383]">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setErrors(p => ({ ...p, email: undefined }))
              }}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone + Company row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-4)]">
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="phone"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="companyName"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Company or studio name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
            </div>
          </div>

          {/* Specialty */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Specialty <span className="text-[#ff8383]">*</span>
            </label>
            <Select
              value={specialty}
              onValueChange={v => {
                setSpecialty(v)
                setErrors(p => ({ ...p, specialty: undefined }))
              }}
            >
              <SelectTrigger aria-invalid={!!errors.specialty}>
                <SelectValue placeholder="Select your specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialty && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.specialty}
              </p>
            )}
          </div>

          {/* Preferred Contact Method */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Preferred Contact Method <span className="text-[#ff8383]">*</span>
            </label>
            <Select
              value={contactMethod}
              onValueChange={v => {
                setContactMethod(v)
                setErrors(p => ({ ...p, contactMethod: undefined }))
              }}
            >
              <SelectTrigger aria-invalid={!!errors.contactMethod}>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contactMethod && (
              <p className="font-body font-normal text-[14px] text-[#ff8383]">
                {errors.contactMethod}
              </p>
            )}
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label
              htmlFor="socials"
              className="font-heading font-medium text-[14px] leading-[1.2] text-white"
            >
              Socials
            </label>
            <Textarea
              id="socials"
              placeholder="Instagram, TikTok, LinkedIn URLs..."
              value={socials}
              onChange={e => setSocials(e.target.value)}
            />
          </div>

          {/* Portfolio + Genre row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-4)]">
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="portfolio"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                Portfolio URL
              </label>
              <Input
                id="portfolio"
                type="text"
                placeholder="https://yourportfolio.com"
                value={portfolio}
                onChange={e => setPortfolio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-[var(--spacing-2)]">
              <label
                htmlFor="genre"
                className="font-heading font-medium text-[14px] leading-[1.2] text-white"
              >
                Preferred Genre
              </label>
              <Input
                id="genre"
                type="text"
                placeholder="e.g. Hip-hop, R&B, Rock"
                value={genre}
                onChange={e => setGenre(e.target.value)}
              />
            </div>
          </div>

          {/* General error */}
          {errors.general && (
            <p className="font-body font-normal text-[14px] text-[#ff8383] text-center">
              {errors.general}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Join the network'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
