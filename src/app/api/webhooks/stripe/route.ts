import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // Ensure consistent API version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) return new Response('Webhook secret or signature missing', { status: 400 });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata
    const { userId, tierId, projectId, processingFee } = session.metadata || {};
    
    // Calculate Net Amount
    const amountTotalCents = session.amount_total || 0;
    const feeCents = processingFee ? parseInt(processingFee) : 0;
    const netAmountCents = amountTotalCents - feeCents;
    const netAmount = netAmountCents / 100;
    const grossAmount = amountTotalCents / 100;

    if (userId && projectId) { // Tier ID is optional (donations)
        try {
            // --- 1. Fetch Project Data ---
            const { data: projectData, error: projectError } = await supabaseAdmin
                .from('projects')
                .select('project_title, artist_name, video_thumbnail_url, video_url')
                .eq('id', projectId)
                .single();
            
            if (projectError) throw projectError;
            
            // --- 2. Fetch Tier Data ---
            let tierData = { name: 'Donation' };
            if (tierId) {
                const { data: t, error: tError } = await supabaseAdmin
                    .from('tiers')
                    .select('name')
                    .eq('id', tierId)
                    .single();
                if (t) tierData = t;
                if (tError) console.error('Tier fetch warning:', tError);
            }
            
            // --- 3. Fetch Supporter Profile Data ---
            // REMOVED 'email' from select as it likely doesn't exist on profiles table
            const { data: profileData, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('full_name') 
                .eq('id', userId)
                .maybeSingle();

            if (profileError) throw profileError;

            // --- 4. Record Contribution ---
            const { error: contributionError } = await supabaseAdmin
                .from('contributions')
                .insert({
                    user_id: userId,
                    project_id: Number(projectId),
                    tier_id: tierId ? Number(tierId) : null,
                    amount_paid: netAmount,
                    stripe_payment_intent_id: session.payment_intent as string,
                });

            if (contributionError) {
                 if (contributionError.code === '23505') {
                    console.log('Duplicate webhook event, ignoring.');
                    return NextResponse.json({ received: true });
                 }
                 throw contributionError;
            }

            // --- 5. Update Stats ---
            if (tierId) {
                await supabaseAdmin.rpc('increment_tier_stats', { t_id: Number(tierId) });
            }
            await supabaseAdmin.rpc('increment_project_stats', { 
                p_id: Number(projectId), 
                amount: netAmount 
            });

            // --- 6. Send Fan Confirmation Email ---
            const customerEmail = session.customer_details?.email;
            if (customerEmail) {
                const videoThumb = projectData.video_thumbnail_url || "https://www.theinertiaproject.com/placeholder-video-thumb.jpg";
                const videoLink = projectData.video_url || "https://www.theinertiaproject.com/";

                await fetch('https://app.loops.so/api/v1/transactional', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
                    },
                    body: JSON.stringify({
                        transactionalId: process.env.LOOPS_TRANSACTIONAL_ID_CONFIRMATION,
                        email: customerEmail,
                        dataVariables: {
                            customerName: profileData?.full_name || 'Valued Supporter',
                            projectName: projectData.project_title,
                            artistName: projectData.artist_name,
                            tierName: tierData.name,
                            amount: grossAmount.toFixed(2),
                            transactionId: session.payment_intent as string,
                            paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            projectId: projectId,
                            videoThumbnailUrl: videoThumb,
                            videoUrl: videoLink
                        },
                    }),
                });
            }

            // --- 7. NEW: Send Admin/Member Notifications ---
            // Requires a new env var: LOOPS_CONTRIBUTION_ALERT_ID
            if (process.env.LOOPS_CONTRIBUTION_ALERT_ID) {
                console.log('🔔 Sending team notifications...');
                
                // A. Fetch Project Members (User IDs)
                const { data: members } = await supabaseAdmin
                    .from('project_members')
                    .select('user_id')
                    .eq('project_id', projectId);
                
                // B. Fetch Admins (User IDs)
                const { data: admins } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('user_type', 'admin');

                // Combine unique User IDs
                const recipientUserIds = new Set([
                    ...(members?.map(m => m.user_id) || []),
                    ...(admins?.map(a => a.id) || [])
                ]);

                if (recipientUserIds.size > 0) {
                    // C. Fetch Emails for these users via Admin API
                    // Note: Supabase Admin listUsers doesn't support "IN" filter easily.
                    const { data: { users: allUsers }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
                    
                    if (!usersError && allUsers) {
                        const recipientEmails = allUsers
                            .filter(u => recipientUserIds.has(u.id) && u.email)
                            .map(u => u.email as string);

                        // Send Email to each recipient
                        const notificationPromises = recipientEmails.map(email => 
                            fetch('https://app.loops.so/api/v1/transactional', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
                                },
                                body: JSON.stringify({
                                    transactionalId: process.env.LOOPS_CONTRIBUTION_ALERT_ID,
                                    email: email,
                                    dataVariables: {
                                        customerName: profileData?.full_name || 'A Supporter',
                                        projectName: projectData.project_title,
                                        artistName: projectData.artist_name,
                                        tierName: tierData.name,
                                        amount: grossAmount.toFixed(2),
                                        transactionId: session.payment_intent as string,
                                        paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                    },
                                }),
                            })
                        );
                        
                        await Promise.allSettled(notificationPromises);
                        console.log(`✅ Sent ${notificationPromises.length} team notifications.`);
                    } else {
                        console.error('Failed to fetch user emails for notifications', usersError);
                    }
                }
            } else {
                console.log('⚠️ Skipping team notifications: LOOPS_CONTRIBUTION_ALERT_ID not set.');
            }

        } catch (err: any) {
            console.error('❌ Failed to process webhook data:', err.message);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
  }

  return NextResponse.json({ received: true });
}