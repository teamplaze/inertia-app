import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectUI from '@/app/projects/[id]/project-client-ui';
import type { Project } from '@/types';

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProjectPage({ params }: Props) {
  // Await the params Promise
  const { slug } = await params;
  
  const supabase = await createClient();

  // Use the awaited slug value
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
    .eq('slug', slug)
    .single();

  if (error || !project) {
    notFound();
  }

  return <ProjectUI projectData={project as Project} />;
}