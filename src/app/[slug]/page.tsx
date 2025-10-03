import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectUI from '@/app/projects/[id]/project-client-ui'; // Re-using your existing UI component!
import type { Project } from '@/types';

// This function tells Next.js how to handle the slug from the URL
export default async function ProjectPage({ params }: { params: { slug: string } }) {
  // The createClient function now handles cookies internally and must be awaited
  const supabase = await createClient();

  // Fetch the project from the database where the 'slug' column matches the URL
  const { data: project, error } = await supabase
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
    .eq('slug', params.slug)
    .single();

  // If no project is found for that slug, show a 404 "Not Found" page
  if (error || !project) {
    notFound();
  }

  // If the project is found, render your existing ProjectUI component with the data
  return <ProjectUI projectData={project as Project} />;
}