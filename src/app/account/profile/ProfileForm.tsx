'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ProfileForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [socials, setSocials] = useState({
    tiktok: "",
    instagram: "",
    youtube: "",
    x: "",
    facebook: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('phone, address, socials')
        .eq('id', userId)
        .single();

      if (data) {
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(prev => ({ ...prev, ...data.address }));
        if (data.socials) setSocials(prev => ({ ...prev, ...data.socials }));
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (address.street && address.street.trim().length > 0 && address.street.trim().length < 3) {
      newErrors.street = "Street address is too short.";
    }
    if (address.city && address.city.trim().length > 0 && address.city.trim().length < 2) {
      newErrors.city = "Invalid city name.";
    }

    const zipRegex = /^[A-Z0-9\s-]{3,10}$/i;
    if (address.zipCode && !zipRegex.test(address.zipCode)) {
      newErrors.zipCode = "Invalid ZIP/Postal code.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveContactInfo = async () => {
    setSuccess(false);
    if (!validate()) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        phone,
        address,
        socials,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      // TODO: replace with errors.general pattern when ProfileForm is rebuilt
      alert("Error saving profile: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      const isComplete =
        phone.trim().length > 0 &&
        address.street.trim().length > 0 &&
        address.city.trim().length > 0 &&
        address.state.trim().length > 0 &&
        address.zipCode.trim().length > 0 &&
        address.country.trim().length > 0 &&
        Object.values(socials).some((handle) => handle.trim().length > 0);

      if (isComplete) {
        fetch('/api/profile/sync-complete', { method: 'POST' }).catch(() => {});
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-bg-teal)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Contact Information */}
      <div
        className="p-[var(--spacing-6)] rounded-[12px]"
        style={{ background: '#0f1111', border: '1px solid #3f4948' }}
      >
        <div className="mb-[var(--spacing-6)]">
          <h3 className="font-heading font-medium text-[20px] text-white">Contact Information</h3>
          <p className="font-body text-[16px] text-[var(--color-text-200)] mt-[var(--spacing-2)]">
            This information is used to fulfill specific perks within the community,
            such as shipping physical merchandise or exclusive experiences.
          </p>
        </div>

        <div className="flex flex-col gap-[var(--spacing-5)]">
          {/* Phone */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
              }}
              placeholder="+1 (555) 123-4567"
              type="tel"
              variant="dark"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="font-body font-normal text-[14px] text-[#ff8383] flex items-center gap-[var(--spacing-1)]">
                <span className="material-symbols-rounded text-[16px] leading-none" aria-hidden="true">error</span>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-[var(--spacing-3)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Home Address
            </label>
            <div className="flex flex-col gap-[var(--spacing-3)]">
              <div>
                <Input
                  value={address.street}
                  onChange={(e) => {
                    setAddress(prev => ({ ...prev, street: e.target.value }));
                    if (errors.street) setErrors(prev => ({ ...prev, street: "" }));
                  }}
                  placeholder="Street Address"
                  variant="dark"
                  aria-invalid={!!errors.street}
                />
                {errors.street && (
                  <p className="font-body font-normal text-[14px] text-[#ff8383] mt-[var(--spacing-1)]">
                    {errors.street}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-[var(--spacing-3)]">
                <div>
                  <Input
                    value={address.city}
                    onChange={(e) => {
                      setAddress(prev => ({ ...prev, city: e.target.value }));
                      if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                    }}
                    placeholder="City"
                    variant="dark"
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && (
                    <p className="font-body font-normal text-[14px] text-[#ff8383] mt-[var(--spacing-1)]">
                      {errors.city}
                    </p>
                  )}
                </div>
                <Input
                  value={address.state}
                  onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State / Province"
                  variant="dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-[var(--spacing-3)]">
                <div>
                  <Input
                    value={address.zipCode}
                    onChange={(e) => {
                      setAddress(prev => ({ ...prev, zipCode: e.target.value }));
                      if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: "" }));
                    }}
                    placeholder="ZIP / Postal Code"
                    variant="dark"
                    aria-invalid={!!errors.zipCode}
                  />
                  {errors.zipCode && (
                    <p className="font-body font-normal text-[14px] text-[#ff8383] mt-[var(--spacing-1)]">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
                <Input
                  value={address.country}
                  onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                  variant="dark"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Handles */}
      <div
        className="p-[var(--spacing-6)] rounded-[12px]"
        style={{ background: '#0f1111', border: '1px solid #3f4948' }}
      >
        <div className="mb-[var(--spacing-5)]">
          <h3 className="font-heading font-medium text-[20px] text-white">Social Handles</h3>
          <p className="font-body text-[16px] text-[var(--color-text-200)] mt-[var(--spacing-2)]">
            Connect your profiles to receive shoutouts and participate in exclusive activities.
          </p>
        </div>

        <div className="flex flex-col gap-[var(--spacing-4)]">
          {/* TikTok */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              TikTok
            </label>
            <div className="flex items-center gap-[var(--spacing-2)]">
              <span className="font-body text-[18px] text-[var(--color-text-200)]">@</span>
              <Input
                value={socials.tiktok}
                onChange={(e) => setSocials(prev => ({ ...prev, tiktok: e.target.value }))}
                placeholder="username"
                variant="dark"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Instagram
            </label>
            <div className="flex items-center gap-[var(--spacing-2)]">
              <span className="font-body text-[18px] text-[var(--color-text-200)]">@</span>
              <Input
                value={socials.instagram}
                onChange={(e) => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="username"
                variant="dark"
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              YouTube
            </label>
            <div className="flex items-center gap-[var(--spacing-2)]">
              <span className="font-body text-[18px] text-[var(--color-text-200)]">@</span>
              <Input
                value={socials.youtube}
                onChange={(e) => setSocials(prev => ({ ...prev, youtube: e.target.value }))}
                placeholder="channel"
                variant="dark"
              />
            </div>
          </div>

          {/* X (Twitter) */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              X (Twitter)
            </label>
            <div className="flex items-center gap-[var(--spacing-2)]">
              <span className="font-body text-[18px] text-[var(--color-text-200)]">@</span>
              <Input
                value={socials.x}
                onChange={(e) => setSocials(prev => ({ ...prev, x: e.target.value }))}
                placeholder="username"
                variant="dark"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <label className="font-heading font-medium text-[14px] leading-[1.2] text-white">
              Facebook
            </label>
            <Input
              value={socials.facebook}
              onChange={(e) => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
              placeholder="facebook.com/yourprofile"
              variant="dark"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-[var(--spacing-4)] pt-[var(--spacing-2)]">
        {success && (
          <span
            className="flex items-center gap-[var(--spacing-2)] font-body text-[16px]"
            style={{ color: 'var(--color-bg-teal)' }}
          >
            <span className="material-symbols-rounded text-[20px] leading-none" aria-hidden="true">
              check_circle
            </span>
            Saved!
          </span>
        )}
        <Button
          onClick={handleSaveContactInfo}
          disabled={saving}
          variant="primary"
          className="min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
