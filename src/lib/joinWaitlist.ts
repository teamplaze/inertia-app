// Server-only: uses the service role key. Never import from a client component.
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { fetchWaitlistContext, tierBelongsToProject } from '@/lib/fetchProject';
import {
  type CampaignStatus,
  getArtistForProject,
  safeLoopsContact,
  safeLoopsEvent,
  safeKitUpsert,
  safeKitApplyTag,
  safeKitUpdateCustomField,
} from '@/lib/emailSync';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type JoinWaitlistStatus = 'joined' | 'already_on_list' | 'invalid' | 'error';

// Inserts a waitlist row and, for a new row only, runs the Loops/KIT waitlist
// sync. Shared by POST /api/waitlist and the sign-up route. Never throws.
export async function joinWaitlist({
  email: rawEmail,
  projectId,
  tierId = null,
  userId = null,
}: {
  email: string;
  projectId: number;
  tierId?: number | null;
  userId?: string | null;
}): Promise<{ status: JoinWaitlistStatus }> {
  try {
    const email = rawEmail.toLowerCase().trim();

    const project = await fetchWaitlistContext(projectId);
    if (!project) return { status: 'invalid' };

    if (tierId != null && !(await tierBelongsToProject(tierId, projectId))) {
      console.warn(
        `[joinWaitlist] tier ${tierId} does not belong to project ${projectId} — joining with tier_id = null.`
      );
      tierId = null;
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
        return { status: 'already_on_list' };
      }
      console.error('Waitlist insert error:', error);
      return { status: 'error' };
    }

    // Email marketing sync (non-blocking). KIT only fires for projects mapped
    // to a known artist account.
    const artist = getArtistForProject(projectId);
    const campaignStatus: CampaignStatus = 'waitlist';
    const syncPromises: Promise<unknown>[] = [
      safeLoopsContact(
        email,
        { campaignStatus },
        userId ?? undefined
      ),
      safeLoopsEvent(email, 'waitlistJoined'),
    ];
    if (artist) {
      syncPromises.push(
        (async () => {
          const subscriberId = await safeKitUpsert(artist, email, undefined, userId ?? undefined);
          if (subscriberId != null) {
            await Promise.all([
              safeKitApplyTag(artist, subscriberId, 'waitlist'),
              safeKitUpdateCustomField(artist, subscriberId, email, 'campaign_status', campaignStatus),
              ...(userId ? [safeKitUpdateCustomField(artist, subscriberId, email, 'inertia_user_id', userId)] : []),
            ]);
          }
        })()
      );
    }
    await Promise.all(syncPromises);

    return { status: 'joined' };
  } catch (err) {
    console.error('[joinWaitlist] unexpected error:', err);
    return { status: 'error' };
  }
}
