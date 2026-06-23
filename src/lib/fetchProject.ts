import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

const PROJECT_SELECT = `
  *,
  tiers (*, perks:tier_perks(id, tier_id, label, category, is_exclusive, sort_order)),
  testimonials (*),
  budget_categories (
    *,
    budget_line_items (*)
  ),
  project_milestones (
    id,
    title,
    sort_order,
    description,
    budget_line_items!milestone_id (
      id,
      name,
      cost,
      notes
    )
  )
`;

function transformProject(projectData: Record<string, any>): Project {
  return {
    id: projectData.id,
    created_at: projectData.created_at,
    artist_name: projectData.artist_name,
    project_title: projectData.project_title,
    project_image_url: projectData.project_image_url,
    funding_goal: Number(projectData.funding_goal),
    current_funding: Number(projectData.current_funding),
    status: projectData.status,
    artist_profile_image_url: projectData.artist_profile_image_url,
    artist_bio: projectData.artist_bio,
    audio_preview_url: projectData.audio_preview_url,
    backer_count: projectData.backer_count || 0,
    artist_message_video_url: projectData.artist_message_video_url,
    from_the_artist_message: projectData.from_the_artist_message,
    tiers: projectData.tiers || [],
    testimonials: projectData.testimonials || [],
    budget_categories: projectData.budget_categories || [],
    project_milestones: projectData.project_milestones || [],
    slug: projectData.slug,
    donation_link: projectData.donation_link ?? null,
    spotify_artist_id: projectData.spotify_artist_id,
    project_colors: projectData.project_colors ?? null,
  };
}

async function checkPermissions(
  projectId: number,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profile?.user_type === 'admin') return true;

  const { data: member } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();

  return !!member;
}

export async function fetchProject(
  slug: string
): Promise<{ project: Project; canManage: boolean } | null> {
  try {
    const supabase = await createClient();

    const { data: projectData, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('slug', slug)
      .single();

    if (error || !projectData) {
      console.error('❌ fetchProject error:', error);
      return null;
    }

    const project = transformProject(projectData);
    const canManage = await checkPermissions(project.id, supabase);

    return { project, canManage };
  } catch (err) {
    console.error('💥 fetchProject unexpected error:', err);
    return null;
  }
}

export async function fetchProjectById(
  id: number
): Promise<{ id: number; slug: string | null } | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('❌ fetchProjectById error:', error);
      return null;
    }

    return { id: data.id, slug: data.slug ?? null };
  } catch (err) {
    console.error('💥 fetchProjectById unexpected error:', err);
    return null;
  }
}
