import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { tierId, projectId, donationAmount, coverFee } = await request.json();

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

    // Enforce auth only for standard tier purchases. 
    // Donations gracefully allow guest checkout.
    if (tierId && !user) {
      return NextResponse.json({ error: 'User must be logged in' }, { status: 401 });
    }

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let sessionMetadata: Record<string, string> = {};
    let targetProjectId = projectId;
    let returnPath = '/';

    const taxRate = 0.029; // 2.9%
    const fixedFee = 30;   // 30 cents

    // ==========================================
    // PATH A: CUSTOM DONATION LOGIC
    // ==========================================
    if (donationAmount) {
      if (!targetProjectId) {
        return NextResponse.json({ error: 'Project ID required for donations' }, { status: 400 });
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('project_title, artist_name, slug')
        .eq('id', targetProjectId)
        .maybeSingle();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      returnPath = `/${project.slug}`;

      const baseAmountCents = Math.round(donationAmount * 100);

      // 1. Add the base donation item
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${project.project_title} - Donation`,
            description: `Direct support for ${project.artist_name}`,
          },
          unit_amount: baseAmountCents,
          tax_behavior: 'exclusive',
        },
        quantity: 1,
      });

      // 2. Add the optional fee coverage item
      if (coverFee) {
        const grossTotal = Math.round((baseAmountCents + fixedFee) / (1 - taxRate));
        const processingFee = grossTotal - baseAmountCents;

        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Processing Fee',
              description: 'Covers credit card processing costs so the artist gets 100% of your donation',
            },
            unit_amount: processingFee,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        });
        
        sessionMetadata.processingFee = processingFee.toString();
      }

      sessionMetadata = {
        ...sessionMetadata,
        projectId: targetProjectId.toString(), // Standardized for your webhook payload
        is_donation: 'true',
        base_amount: donationAmount.toString(),
        userId: user?.id || 'guest',
      };
    } 
    // ==========================================
    // PATH B: STANDARD TIER PURCHASE LOGIC
    // ==========================================
    else if (tierId) {
      const { data: tier, error: tierError } = await supabase
        .from('tiers')
        .select('name, price, project_id')
        .eq('id', tierId)
        .maybeSingle();

      if (tierError || !tier) {
        console.error(`Checkout Failed: Tier not found for ID ${tierId}`, tierError);
        return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
      }

      targetProjectId = projectId || tier.project_id;
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('project_title, artist_name, slug')
        .eq('id', targetProjectId)
        .maybeSingle();

      if (projectError || !project) {
        console.error(`Checkout Failed: Project not found for ID ${targetProjectId}`, projectError);
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      returnPath = `/${project.slug}`;

      const tierPriceCents = Math.round(Number(tier.price) * 100);
      const grossTotal = Math.round((tierPriceCents + fixedFee) / (1 - taxRate));
      const processingFee = grossTotal - tierPriceCents;

      line_items.push(
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${project.project_title} - ${tier.name}`,
              description: `Contribution to ${project.artist_name}`,
            },
            unit_amount: tierPriceCents,
            tax_behavior: 'exclusive', 
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Processing Fee',
              description: 'Covers credit card processing costs',
            },
            unit_amount: processingFee,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        }
      );

      sessionMetadata = {
        userId: user!.id,
        tierId: tierId.toString(),
        projectId: targetProjectId.toString(),
        processingFee: processingFee.toString(),
      };
    } else {
      return NextResponse.json({ error: 'Missing tierId or donationAmount' }, { status: 400 });
    }

    // ==========================================
    // CREATE THE STRIPE SESSION
    // ==========================================
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      automatic_tax: {
        enabled: true,
      },
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
      metadata: sessionMetadata,
    };

    // Attach email if the user is logged in (bypassed for guests)
    if (user?.email) {
        sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}