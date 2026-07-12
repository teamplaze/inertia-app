import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  getArtistForProject,
  safeLoopsContact,
  safeKitUpsert,
  safeKitApplyTag,
  safeKitUpdateCustomField,
} from '@/lib/emailSync';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/profile/sync-complete
// Called by ProfileForm right after a successful save, only when the form
// determines the profile is "complete" (phone + full address + a social).
// No project context exists on the profile page itself, so KIT is routed
// using the artist from the user's most recent contribution, if any —
// same "skip KIT, still sync Loops" fallback used at sign-up.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.email;
  const userId = user.id;

  const { data: recentContribution } = await supabaseAdmin
    .from('contributions')
    .select('project_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const artist = getArtistForProject(recentContribution?.project_id ?? null);

  const syncPromises: Promise<unknown>[] = [
    safeLoopsContact(email, { profileStatus: 'complete' }, userId),
  ];

  if (artist) {
    syncPromises.push(
      (async () => {
        const subscriberId = await safeKitUpsert(artist, email, undefined, userId);
        if (subscriberId != null) {
          await Promise.all([
            safeKitApplyTag(artist, subscriberId, 'profile_completed'),
            safeKitUpdateCustomField(artist, subscriberId, 'profile_status', 'complete'),
            safeKitUpdateCustomField(artist, subscriberId, 'inertia_user_id', userId),
          ]);
        }
      })()
    );
  }

  await Promise.all(syncPromises);

  return NextResponse.json({ status: 'ok' });
}
