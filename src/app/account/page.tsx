import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContributionsTable from './ContributionsTable';
import type { Project, Tier } from '@/types';

// This is a Server Component that fetches data before rendering
export default async function MyProjectsPage() {
  // The createClient function now handles cookies internally
  const supabase = await createClient();

  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, redirect them to the login page
  if (!user) {
    redirect('/login?message=You must be logged in to view your account.');
  }

  // Fetch the user's contributions and join with related project and tier tables
  const { data: rawContributions, error } = await supabase
    .from('contributions')
    .select(`
      id,
      amount_paid,
      created_at,
      projects (id, project_title, artist_name, status),
      tiers (name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contributions:', error);
    // In a real app, you might render a dedicated error component here
  }
  
  // Transform the data to match the expected Contribution type
  const contributions = rawContributions?.map(contribution => ({
    ...contribution,
    // Use a safer type assertion by casting to 'unknown' first
    projects: contribution.projects as unknown as Project,

    tiers: contribution.tiers as unknown as Tier,
  })) || [];

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">My Projects</h1>
      {/* Pass the transformed data down to the client component for rendering */}
      <ContributionsTable contributions={contributions} />
    </div>
  );
}

