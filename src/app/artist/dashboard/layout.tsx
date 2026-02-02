// File: src/app/artist/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect, forbidden } from 'next/navigation';
import React from 'react';

export default async function ArtistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify User Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  // Allow Artists OR Admins. Block everyone else (Fans).
  if (!profile || (profile.user_type !== 'artist' && profile.user_type !== 'admin')) {
    forbidden();
  }

  return (
    <div className="min-h-screen bg-[#2D3534]">
      <header className="border-b border-[#64918E]/30 bg-[#2D3534] sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-bold text-[#CB945E] tracking-wider uppercase">Artist Dashboard</span>
                {/* Visual indicator for Admins */}
                {profile.user_type === 'admin' && (
                   <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                     Admin View
                   </span>
                )}
            </div>
            <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}