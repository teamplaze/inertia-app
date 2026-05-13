'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProfileForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Data States
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ 
    street: "", 
    city: "", 
    state: "", 
    zipCode: "", 
    country: "" 
  });
  const [socials, setSocials] = useState({ 
    tiktok: "", 
    instagram: "", 
    youtube: "", 
    x: "", 
    facebook: "" 
  });

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, address, socials')
        .eq('id', userId)
        .single();

      if (data) {
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress({ ...address, ...data.address });
        if (data.socials) setSocials({ ...socials, ...data.socials });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, supabase]);

  // Validation Logic
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Phone Validation: Basic regex for standard formats (7-20 chars)
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    // Address Validation
    if (address.street && address.street.trim().length > 0 && address.street.trim().length < 3) {
      newErrors.street = "Street address is too short.";
    }
    if (address.city && address.city.trim().length > 0 && address.city.trim().length < 2) {
      newErrors.city = "Invalid city name.";
    }
    
    // ZIP Code Validation: Supports 3-10 alphanumeric characters (Universal support)
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
        phone: phone,
        address: address,
        socials: socials,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setSaving(false);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CB945E]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Contact Information Card */}
      <Card className="rounded-xl" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardHeader>
          <CardTitle className="text-xl text-white">Contact Information</CardTitle>
          <p className="text-sm text-gray-200 mt-2">
            This information is used to fulfill specific perks within the community, 
            such as shipping physical merchandise or exclusive experiences.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label className={`text-gray-200 ${errors.phone ? "text-red-400" : ""}`}>
              Phone Number
            </Label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              placeholder="+1 (555) 123-4567"
              type="tel"
              className={`text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E] ${
                errors.phone ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:border-[#CB945E]"
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Home Address */}
          <div className="space-y-4">
            <Label className="font-medium text-gray-200">Home Address</Label>
            <div className="space-y-3">
              <div>
                <Input
                  value={address.street}
                  onChange={(e) => {
                    setAddress({ ...address, street: e.target.value });
                    if (errors.street) setErrors({ ...errors, street: "" });
                  }}
                  placeholder="Street Address"
                  className={`text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E] ${
                    errors.street ? "border-red-400" : ""
                  }`}
                />
                {errors.street && <p className="text-[10px] text-red-300 mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    value={address.city}
                    onChange={(e) => {
                      setAddress({ ...address, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: "" });
                    }}
                    placeholder="City"
                    className={`text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E] ${
                      errors.city ? "border-red-400" : ""
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-red-300 mt-1">{errors.city}</p>}
                </div>
                <Input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State / Province"
                  className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    value={address.zipCode}
                    onChange={(e) => {
                      setAddress({ ...address, zipCode: e.target.value });
                      if (errors.zipCode) setErrors({ ...errors, zipCode: "" });
                    }}
                    placeholder="ZIP / Postal Code"
                    className={`text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E] ${
                      errors.zipCode ? "border-red-400" : ""
                    }`}
                  />
                  {errors.zipCode && <p className="text-[10px] text-red-300 mt-1">{errors.zipCode}</p>}
                </div>
                <Input
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  placeholder="Country"
                  className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Handles Card */}
      <Card className="rounded-xl" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardHeader>
          <CardTitle className="text-xl text-white">Social Handles</CardTitle>
          <p className="text-sm text-gray-200 mt-2">
            Connect your profiles to receive shoutouts and participate in exclusive activities.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TikTok */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-200">TikTok</Label>
            <div className="flex items-center">
              <span className="text-white/70 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.tiktok}
                onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                placeholder="username"
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-200">Instagram</Label>
            <div className="flex items-center">
              <span className="text-white/70 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="username"
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-200">YouTube</Label>
            <div className="flex items-center">
              <span className="text-white/70 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.youtube}
                onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                placeholder="channel"
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          {/* X (Twitter) */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-200">X (Twitter)</Label>
            <div className="flex items-center">
              <span className="text-white/70 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.x}
                onChange={(e) => setSocials({ ...socials, x: e.target.value })}
                placeholder="username"
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-200">Facebook</Label>
            <Input
              value={socials.facebook}
              onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
              placeholder="facebook.com/yourprofile"
              className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 pt-2">
        {success && (
          <span className="text-green-400 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 size={16} /> Saved!
          </span>
        )}
        <Button
          onClick={handleSaveContactInfo}
          disabled={saving}
          className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white font-bold min-w-[200px]"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}