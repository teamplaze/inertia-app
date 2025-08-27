// File: src/app/api/auth/sign-up/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; // Import the standard client for admin use
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create a separate Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const formData = await request.json();
  const email = formData.email;
  const password = formData.password;
  const name = formData.name;
  
  const cookieStore = await cookies();

  // This client is for user-specific auth operations like sign-up and sign-in
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // --- First, sign up the new user ---
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name, // This data is passed to the trigger
      },
    },
  });

  if (signUpError || !signUpData.user) {
    console.error('❌ Supabase sign up error:', signUpError);
    return NextResponse.json(
      { error: 'Could not create user.', details: signUpError?.message },
      { status: 400 }
    );
  }

  // --- Create Stripe customer ---
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        supabase_user_id: signUpData.user.id,
      },
    });

    // --- Update the user's profile with the Stripe ID using the ADMIN client ---
    // The database trigger has already created the profile row.
    // We just need to UPDATE it with the Stripe customer ID.
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', signUpData.user.id);

    if (updateError) {
      // Log the error, but don't block the user from signing up
      console.error('❌ Database profile update error:', updateError);
    } else {
      console.log('✅ User profile updated with Stripe ID:', customer.id);
    }

  } catch (stripeError) {
    console.error('❌ Stripe customer creation error:', stripeError);
    // Continue with the process even if Stripe fails, so user can still sign up
  }

  // --- Sign them in to complete the flow ---
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('❌ Supabase sign in after sign up error:', signInError);
    return NextResponse.json(
      { error: 'Could not sign in user after sign up', details: signInError.message },
      { status: 400 }
    );
  }

  console.log('✅ Sign up and login successful!');

  return NextResponse.json(
    { message: 'Sign up and login successful!', user: signInData.user },
    { status: 200 }
  );
}