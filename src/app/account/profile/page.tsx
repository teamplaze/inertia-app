import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to view your profile.');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-medium text-[32px] text-white mb-[var(--spacing-2)]">User Profile</h1>
        <p className="font-body text-[18px] text-[var(--color-text-200)]">Manage your shipping address and social handles.</p>
      </div>
      
      <ProfileForm userId={user.id} />
    </div>
  );
}