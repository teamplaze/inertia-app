// File: src/app/api/projects/[id]/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  const { id: projectId } = await params; // Await params before accessing id
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
      testimonials (*),
      budget_categories (*, budget_line_items(*))
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: `Project with ID ${projectId} not found.` }, { status: 404 });
  }

  return NextResponse.json(project);
}