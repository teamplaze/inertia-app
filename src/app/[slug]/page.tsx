import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import ProjectUI from '@/app/projects/[id]/project-client-ui';
import { fetchProject } from '@/lib/fetchProject';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.theinertiaproject.com';

const getCachedProject = cache(fetchProject);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCachedProject(slug);

  if (!result) {
    return { title: 'Project Not Found' };
  }

  const { project } = result;
  const title = `${project.artist_name} — ${project.project_title}`;
  const description = project.artist_bio
    ? project.artist_bio.slice(0, 155) + (project.artist_bio.length > 155 ? '…' : '')
    : `Support ${project.artist_name} on The Inertia Project`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${project.slug}`,
      images: project.project_image_url
        ? [{ url: project.project_image_url, width: 1200, height: 630, alt: `${project.artist_name} project image` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.project_image_url ? [project.project_image_url] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await getCachedProject(slug);

  if (!result) return notFound();

  const { project, canManage } = result;

  return <ProjectUI projectData={project} isProjectMember={canManage} />;
}
