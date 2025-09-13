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

    if (!userId || !tierId || !projectId) {
      return NextResponse.json({ error: 'Webhook Error: Missing required metadata' }, { status: 400 });
    }

    try {
      // --- 1. Fetch Project and Tier Data ---
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('project_title, artist_name, tiers(name)')
        .eq('id', projectId)
        .eq('tiers.id', tierId)
        .single();
      
      // --- 2. Fetch User Profile Data ---
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (projectError || profileError) {
        console.error("Database fetch error:", projectError || profileError);
        throw projectError || profileError;
      }

      // --- 3. Record the successful contribution ---
      const { error: contributionError } = await supabaseAdmin
        .from('contributions')
        .insert({
          user_id: userId,
          project_id: projectId,
          tier_id: tierId,
          amount_paid: (session.amount_total || 0) / 100,
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (contributionError) throw contributionError;
      
      // --- 4. Update counts using RPC functions ---
      await supabaseAdmin.rpc('increment_claimed_slots', { tier_id_to_update: tierId });
      await supabaseAdmin.rpc('update_project_funding', { 
        project_id_to_update: projectId, 
        amount_to_add: (session.amount_total || 0) / 100 
      });

      // --- 5. Send the confirmation email via Loops.so ---
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        console.log('📬 Attempting to send confirmation email...');
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
              customerName: profileData.full_name || 'Valued Supporter',
              projectName: projectData.project_title,
              artistName: projectData.artist_name,
              tierName: projectData.tiers[0]?.name || 'Selected Tier',
              amount: ((session.amount_total || 0) / 100).toFixed(2),
              transactionId: session.payment_intent as string,
              paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              projectId: projectId,
            },
          }),
        });

        // Log the detailed response from the Loops.so API
        console.log(`- Loops.so API response status: ${loopsResponse.status}`);
        const loopsData = await loopsResponse.json();
        console.log('- Loops.so API response body:', loopsData);

        if (!loopsResponse.ok) {
          console.error('❌ Failed to send email via Loops.so.');
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

