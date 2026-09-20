// File Location: src/app/api/projects/featured/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { ProjectStatus } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_ORDER: Record<ProjectStatus, number> = {
  'Fundraising': 0,
  'Coming Soon': 1,
  'Completed': 2,
}

export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')

  if (error) return NextResponse.json(
    { error: error.message }, { status: 500 })

  const sorted = (data ?? []).sort((a, b) => {
    const aOrder = STATUS_ORDER[a.status as ProjectStatus] ?? 99
    const bOrder = STATUS_ORDER[b.status as ProjectStatus] ?? 99
    return aOrder - bOrder
  })

  return NextResponse.json(sorted)
}
