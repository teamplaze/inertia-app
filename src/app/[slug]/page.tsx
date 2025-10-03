import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectUI from '@/app/projects/[id]/project-client-ui';
import type { Project } from '@/types';

// Define a more complete type for the page props, which includes searchParams
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// This function tells Next.js how to handle the slug from the URL
export default async function ProjectPage({ params }: Props) {
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

