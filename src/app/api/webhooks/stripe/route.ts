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
      // --- 1. Fetch all necessary data for the email ---
      const { data: contributionData, error: dataError } = await supabaseAdmin
        .from('projects')
        .select(`
          project_title,
          artist_name,
          tiers (name),
          profiles (full_name)
        `)
        .eq('id', projectId)
        .eq('tiers.id', tierId)
        .eq('profiles.id', userId)
        .single();

      if (dataError) throw dataError;

      // --- 2. Record the successful contribution ---
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
      
      // --- 3. Update the tier's claimed_slots count ---
      await supabaseAdmin.rpc('increment_claimed_slots', { tier_id_to_update: tierId });

      // --- 4. Update the project's funding and backer count ---
      await supabaseAdmin.rpc('update_project_funding', { 
        project_id_to_update: projectId, 
        amount_to_add: (session.amount_total || 0) / 100 
      });

      // --- 5. Send the confirmation email via Loops.so ---
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
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
              customerName: contributionData.profiles[0]?.full_name || 'Valued Supporter',
              projectName: contributionData.project_title,
              artistName: contributionData.artist_name,
              tierName: contributionData.tiers[0]?.name || 'Selected Tier',
              amount: ((session.amount_total || 0) / 100).toFixed(2),
              transactionId: session.payment_intent as string,
              paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              projectId: projectId,
            },
          }),
        });
      }
      
    } catch (dbError) {
      console.error('Error handling webhook database operations:', dbError);
      return NextResponse.json({ error: 'Database error in webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}