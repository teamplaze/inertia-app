import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/waitlist
// Body: { projectId: number, tierId: number | null, email?: string }
// If authenticated: email and user_id are taken from the session.
// If not authenticated: email must be provided in the body; user_id is null.
export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, tierId = null, email: bodyEmail } = body;

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let email: string;
  let userId: string | null = null;

  if (user) {
    email = user.email!;
    userId = user.id;
  } else if (bodyEmail) {
    email = bodyEmail;
  } else {
    return NextResponse.json({ error: 'email is required for unauthenticated requests' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('waitlist')
    .insert({
      project_id: projectId,
      tier_id: tierId,
      email,
      user_id: userId,
    });

  if (error) {
    // Unique violation — already on list (codes 23505 covers both partial indexes)
    if (error.code === '23505') {
      return NextResponse.json({ status: 'already_on_list' });
    }
    console.error('Waitlist insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'joined' });
}

// GET /api/waitlist?projectId=...&tierId=...
// Admin only. Returns email blast list from waitlist_email_list view.
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const tierId = searchParams.get('tierId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  let query = supabaseAdmin
    .from('waitlist_email_list')
    .select('email, display_name, created_at')
    .eq('project_id', Number(projectId))
    .order('created_at', { ascending: true });

  if (tierId) {
    query = query.eq('tier_id', Number(tierId));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
