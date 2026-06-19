import { notFound } from 'next/navigation';
import ProjectUI from '@/app/projects/[id]/project-client-ui';
import { fetchProject } from '@/lib/fetchProject';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await fetchProject(slug);

  if (!result) return notFound();

  const { project, canManage } = result;

  return <ProjectUI projectData={project} isProjectMember={canManage} />;
}
