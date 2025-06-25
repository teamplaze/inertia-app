// File: src/app/api/projects/[id]/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // This is the powerful part: we select the project and all related
  // data from the 'tiers' and 'testimonials' tables in a single query.
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      tiers (*),
      testimonials (*)
    `)
    .eq('id', projectId)
    .single(); // .single() ensures we get one project object, not an array.

  if (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: `Project with ID ${projectId} not found.` }, { status: 404 });
  }

  return NextResponse.json(project);
}