import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { tierId, projectId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe Secret Key');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User must be logged in' }, { status: 401 });
    }

    // Fetch Tier Details (Safe query)
    const { data: tier, error: tierError } = await supabase
      .from('tiers')
      .select('name, price, project_id')
      .eq('id', tierId)
      .maybeSingle();

    if (tierError || !tier) {
      console.error(`Checkout Failed: Tier not found for ID ${tierId}`, tierError);
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Fetch Project Details (for Slug/Title)
    // Use projectId passed in request, or fallback to tier's project_id
    const targetProjectId = projectId || tier.project_id;
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('project_title, artist_name, slug')
      .eq('id', targetProjectId)
      .maybeSingle();

    if (projectError || !project) {
      console.error(`Checkout Failed: Project not found for ID ${targetProjectId}`, projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    // Construct Cancel URL: Use slug if available
    const returnPath = project.slug ? `/${project.slug}` : `/projects/${targetProjectId}`;

    // --- FEE CALCULATION ---
    const tierPriceCents = Math.round(Number(tier.price) * 100);
    
    // Formula to calculate the fee needed so that (Total - StripeFee) = TierPrice
    // Gross = (Net + Fixed) / (1 - Rate)
    // Fee = Gross - Net
    const taxRate = 0.029; // 2.9%
    const fixedFee = 30;   // 30 cents
    
    const grossTotal = Math.round((tierPriceCents + fixedFee) / (1 - taxRate));
    const processingFee = grossTotal - tierPriceCents;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        // 1. The actual Tier Item
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${project.project_title} - ${tier.name}`,
              description: `Contribution to ${project.artist_name}`,
            },
            unit_amount: tierPriceCents,
          },
          quantity: 1,
        },
        // 2. The Processing Fee Item
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Processing Fee',
              description: 'Covers credit card processing costs',
            },
            unit_amount: processingFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
      metadata: {
        userId: user.id,
        tierId: tierId.toString(),
        projectId: targetProjectId.toString(),
        // Store fee info if needed for reporting later
        processingFee: processingFee.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}