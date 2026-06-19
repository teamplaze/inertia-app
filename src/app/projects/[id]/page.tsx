import { permanentRedirect, notFound } from 'next/navigation';
import { fetchProjectById } from '@/lib/fetchProject';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectIdPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) return notFound();

  const result = await fetchProjectById(numericId);

  if (!result) return notFound();

  if (!result.slug) return notFound();

  permanentRedirect(`/${result.slug}`);
}
