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
    
    // Get the metadata we passed in from the checkout session
    const userId = session.metadata?.userId;
    const tierId = session.metadata?.tierId;
    const projectId = session.metadata?.projectId;

    if (!userId || !tierId || !projectId) {
      return NextResponse.json({ error: 'Webhook Error: Missing required metadata' }, { status: 400 });
    }

    try {
      // 1. Record the successful contribution in your 'contributions' table
      const { error: contributionError } = await supabaseAdmin
        .from('contributions')
        .insert({
          user_id: userId,
          project_id: projectId,
          tier_id: tierId,
          amount_paid: (session.amount_total || 0) / 100,
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (contributionError) {
        console.error('Error creating contribution:', contributionError);
        throw contributionError;
      }
      
      console.log(`✅ Contribution created for user ${userId}`);

      // 2. Update the tier's claimed_slots count
      // This is a Supabase Edge Function call to safely increment the value
      const { error: tierUpdateError } = await supabaseAdmin.rpc('increment_claimed_slots', { tier_id_to_update: tierId });
      if (tierUpdateError) {
          console.error('Error updating tier slots:', tierUpdateError);
          // Decide if you want to throw an error or just log it
      }

      // 3. Update the project's current_funding and backer_count
      const { error: projectUpdateError } = await supabaseAdmin.rpc('update_project_funding', { 
        project_id_to_update: projectId, 
        amount_to_add: (session.amount_total || 0) / 100 
      });
      if (projectUpdateError) {
        console.error('Error updating project funding:', projectUpdateError);
        // Decide if you want to throw an error or just log it
      }

      // 4. Send a confirmation email (your Loops.so or Resend logic would go here)
      
    } catch (dbError) {
      console.error('Error handling webhook database operations:', dbError);
      return NextResponse.json({ error: 'Database error in webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}