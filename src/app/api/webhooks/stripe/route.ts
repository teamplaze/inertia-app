import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create a Supabase admin client to safely update the database
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${(err as Error).message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const { userId, tierId, projectId } = session.metadata || {};
    
    // 1. Calculate Amounts
    const amountTotalCents = session.amount_total || 0;
    
    // Retrieve the processing fee we added during checkout (if any)
    const feeCents = session.metadata?.processingFee ? parseInt(session.metadata.processingFee) : 0;
    
    // Net Amount is what goes to the project (Total - Fee)
    const netAmountCents = amountTotalCents - feeCents;
    
    // Convert to dollars for DB
    const netAmount = netAmountCents / 100;
    const grossAmount = amountTotalCents / 100;

    if (!userId || !tierId || !projectId) {
      return NextResponse.json({ error: 'Webhook Error: Missing required metadata' }, { status: 400 });
    }

    try {
      // --- 1. Fetch Project Data ---
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('project_title, artist_name, video_thumbnail_url, video_url')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw projectError;
      }
      
      // --- 2. Fetch Tier Data ---
      const { data: tierData, error: tierError } = await supabaseAdmin
        .from('tiers')
        .select('name')
        .eq('id', tierId)
        .single();
      
      if (tierError) {
        console.error('Tier fetch error:', tierError);
        throw tierError;
      }
      
      // --- 3. Fetch User Profile Data ---
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      // --- 4. Record the successful contribution (NET AMOUNT) ---
      // We store the net amount so dashboard totals reflect actual project funds
      const { error: contributionError } = await supabaseAdmin
        .from('contributions')
        .insert({
          user_id: userId,
          project_id: Number(projectId),
          tier_id: Number(tierId),
          amount_paid: netAmount, // <--- CHANGED to Net Amount
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (contributionError) throw contributionError;
      
      // --- 5. Update counts using RPC functions ---
      const { error: tierStatsError } = await supabaseAdmin.rpc('increment_tier_stats', { 
          t_id: Number(tierId) 
      });
      if (tierStatsError) throw tierStatsError;

      const { error: projectStatsError } = await supabaseAdmin.rpc('increment_project_stats', { 
          p_id: Number(projectId), 
          amount: netAmount // <--- CHANGED to Net Amount
      });
      if (projectStatsError) throw projectStatsError;

      // --- 6. Send the confirmation email via Loops.so ---
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        console.log('📬 Attempting to send confirmation email...');
        
        // Prepare fallbacks for required fields
        const videoThumb = projectData.video_thumbnail_url || "https://www.theinertiaproject.com/placeholder-video-thumb.jpg";
        const videoLink = projectData.video_url || "https://www.theinertiaproject.com/";

        const loopsResponse = await fetch('https://app.loops.so/api/v1/transactional', {
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
              tierName: tierData.name || 'Selected Tier',
              amount: grossAmount.toFixed(2), // <--- KEPT as Gross Amount for Receipt accuracy
              transactionId: session.payment_intent as string,
              paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              projectId: projectId,
              videoThumbnailUrl: videoThumb,
              videoUrl: videoLink
            },
          }),
        });

        const loopsData = await loopsResponse.json();
        if (!loopsResponse.ok) {
          console.error('❌ Failed to send email via Loops.so.', loopsData);
        } else {
          console.log(`✅ Confirmation email sent successfully to ${customerEmail}`);
        }
      }
      
    } catch (dbError) {
      console.error('Error handling webhook database operations:', dbError);
      return NextResponse.json({ error: 'Database error in webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}