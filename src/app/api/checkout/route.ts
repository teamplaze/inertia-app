// File: src/app/api/checkout/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { tierId } = await request.json();
  const supabase = await createClient(); // Now await the createClient function

  if (!tierId) {
    return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 });
  }

  // 1. Get the tier details securely from your database
  const { data: tier, error } = await supabase
    .from('tiers')
    .select('name, stripe_price_id')
    .eq('id', tierId)
    .single();

  if (error || !tier || !tier.stripe_price_id) {
    console.error('Tier error:', error);
    return NextResponse.json({ error: 'Tier not found or missing Stripe Price ID' }, { status: 404 });
  }

  const origin = request.headers.get('origin') || 'http://localhost:3000';

  try {
    // 2. Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: tier.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      // These are the URLs Stripe will redirect to after the transaction
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    // 3. Return the session ID to the frontend
    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}