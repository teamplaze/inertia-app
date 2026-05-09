'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export default function ProfileForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", zipCode: "", country: "" });
  const [socials, setSocials] = useState({ tiktok: "", instagram: "", youtube: "", x: "", facebook: "" });

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

  const handleSaveContactInfo = async () => {
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
      // Could use a toast notification here in the future
      alert("Profile updated successfully!"); 
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#CB945E]" /></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Contact Information Card */}
      <Card className="rounded-xl border-gray-700 bg-[#2D3534]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Contact Information</CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            This information is used to fulfill specific perks within the community for projects you support, such as shipping physical merchandise or contacting you about exclusive experiences.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              type="tel"
              className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-gray-300">Home Address</Label>
            <div className="space-y-3">
              <Input
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Street Address"
                className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
                />
                <Input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State / Province"
                  className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  placeholder="ZIP / Postal Code"
                  className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
                />
                <Input
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  placeholder="Country"
                  className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Handles Card */}
      <Card className="rounded-xl border-gray-700 bg-[#2D3534]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Social Handles</CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Connect your social profiles to receive shoutouts, be featured in artist content, and participate in exclusive community activities.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">TikTok</Label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.tiktok}
                onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                placeholder="username"
                className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Instagram</Label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="username"
                className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">YouTube</Label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.youtube}
                onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                placeholder="channel"
                className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">X (Twitter)</Label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2 font-bold">@</span>
              <Input
                value={socials.x}
                onChange={(e) => setSocials({ ...socials, x: e.target.value })}
                placeholder="username"
                className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Facebook</Label>
            <Input
              value={socials.facebook}
              onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
              placeholder="facebook.com/yourprofile"
              className="bg-black/20 text-white border-gray-600 focus-visible:ring-[#CB945E] focus-visible:border-[#CB945E]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button - Floating or at the bottom */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSaveContactInfo}
          disabled={saving}
          className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white font-bold min-w-[200px]"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}