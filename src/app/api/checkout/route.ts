import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { tierId } = await request.json();
  const supabase = await createClient();

  // 1. Get the current logged-in user from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to contribute.' }, { status: 401 });
  }

  // 2. Get the tier details, including the project_id
  const { data: tier, error: tierError } = await supabase
    .from('tiers')
    .select('name, stripe_price_id, project_id') // <-- Fetched project_id
    .eq('id', tierId)
    .single();

  if (tierError || !tier || !tier.stripe_price_id) {
    console.error('Tier error:', tierError);
    return NextResponse.json({ error: 'Tier not found or missing Stripe Price ID' }, { status: 404 });
  }

  const origin = request.headers.get('origin') || 'http://localhost:3000';

  try {
    // 3. Create a Stripe Checkout Session with metadata
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email, // <-- Added customer email
      payment_method_types: ['card'],
      line_items: [
        {
          price: tier.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: { // <-- Added metadata
        userId: user.id,
        tierId: tierId,
        projectId: tier.project_id,
      },
    });

    // 4. Return the session ID to the frontend
    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}