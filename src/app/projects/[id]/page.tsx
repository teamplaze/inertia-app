// File: src/app/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from "next/link";
import ProjectUI from '@/app/projects/[id]/project-client-ui';
import type { Project } from '@/types';

// Force dynamic rendering to ensure auth checks run on every request
export const dynamic = 'force-dynamic';

async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    
    // Query by 'slug' instead of 'id'
    const { data: projectData, error } = await supabase
      .from('projects')
      .select(`
        *,
        tiers (*),
        testimonials (*),
        budget_categories (
          *,
          budget_line_items (*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return null;
    }

    if (!projectData) {
      return null;
    }

    // Transform data
    const project: Project = {
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
      slug: projectData.slug,
      donation_link: projectData.donation_link || null,      
    };
    
    return project;
    
  } catch (error: unknown) {
    console.error('💥 Unexpected error fetching project:', error);
    return null;
  }
}

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const projectData = await getProjectBySlug(resolvedParams.slug);
  const supabase = await createClient();

  if (!projectData) {
    return (
      <div className="min-h-screen text-white text-center pt-32">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/" className="text-lg text-[#CB945E] hover:underline mt-6 inline-block">
            &larr; Back to Homepage
        </Link>
      </div>
    );
  }

  // --- CHECK MANAGEMENT PERMISSIONS ---
  let canManageProject = false;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 1. Check if Admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
    
    if (profile?.user_type === 'admin') {
        canManageProject = true;
    } else {
        // 2. Check if Project Member
        const { data: member } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectData.id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (member) {
          canManageProject = true;
        }
    }
  }

  return <ProjectUI projectData={projectData as Project} isProjectMember={canManageProject} />;
}