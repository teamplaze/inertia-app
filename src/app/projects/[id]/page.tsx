// File: src/app/projects/[id]/page.tsx
// Fixed version with complete type mapping

import { createClient } from '@/lib/supabase/server';
import Link from "next/link";
import ProjectUI from "./project-client-ui";
import type { Project } from "@/types";

async function getProjectData(id: string): Promise<Project | null> {
  try {
    const supabase = await createClient();
    
    console.log('🔍 Fetching project data for ID:', id);
    
    // Direct database query
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return null;
    }

    if (!projectData) {
      console.log('📭 No project found with ID:', id);
      return null;
    }

    console.log('✅ Project data fetched successfully:', projectData.project_title);
    
    //Force fresh build to ensure types are correct
    // Transform the data to match your Project type
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
      budget_categories: projectData.budget_categories || []
    };
    
    return project;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Unexpected error fetching project:', errorMessage);
    return null;
  }
}

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const projectData = await getProjectData(resolvedParams.id);

  if (!projectData) {
    return (
      <div className="min-h-screen text-white text-center pt-32">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="mt-2 text-gray-400">Could not load the project data. Please try again later.</p>
        <Link href="/" className="text-lg text-[#CB945E] hover:underline mt-6 inline-block">
            &larr; Back to Homepage
        </Link>
      </div>
    );
  }

  return <ProjectUI projectData={projectData} />;
}