// File: src/app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Check if user has 'admin' role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profile?.user_type !== 'admin') {
    // Redirect unauthorized users (fans/artists) back to home
    redirect('/');
  }

  // 3. Render the admin page if authorized
  return (
    <div className="min-h-screen bg-[#1E2322]">
      <header className="border-b border-[#CB945E]/20 bg-[#2D3534]/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-[#CB945E] font-bold tracking-wider">INERTIA ADMIN</span>
          <div className="text-xs text-gray-400">
            {user.email}
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}