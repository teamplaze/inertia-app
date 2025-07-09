// File: src/app/api/projects/[id]/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server'; // Import NextRequest

export async function GET(
  request: NextRequest, // Use NextRequest for the first argument
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

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      tiers (*),
      testimonials (*)
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: `Project with ID ${projectId} not found.` }, { status: 404 });
  }

  return NextResponse.json(project);
}