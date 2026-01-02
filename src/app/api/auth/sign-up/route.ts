// File: src/app/api/auth/sign-up/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; 
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Admin client for checking invites and updating profiles (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const formData = await request.json();
  
  // Debugging: Log full raw body to inspect structure
  console.log('📦 Raw Signup Body:', JSON.stringify(formData, null, 2));

  const { email, password, name, inviteToken } = formData;
  
  // Debugging Logs: Check your terminal to see these values when you test
  console.log('📝 Signup Attempt:', { email, name, hasInviteToken: !!inviteToken });

  // Normalize email for comparison
  const normalizedEmail = email.toLowerCase().trim();

  const cookieStore = await cookies();

  // 1. Verify Invitation if provided
  let userType = 'fan';
  let invitationId = null;

  if (inviteToken) {
    console.log('🔍 Validating Invite Token:', inviteToken);
    
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('artist_invitations')
      .select('*')
      .eq('token', inviteToken)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      console.error('❌ Invite Invalid/Expired:', inviteError);
      return NextResponse.json({ error: 'Invalid or expired invitation token.' }, { status: 400 });
    }

    console.log('✅ Invite Found for:', invite.email);

    // SECURITY CHECK: Email Mismatch
    // Ensure the signup email matches the invited email
    const inviteEmail = invite.email.toLowerCase().trim();
     if (inviteEmail !== normalizedEmail) {
      // Keep detailed logs for server admin
      console.error(`❌ Email Mismatch: Invitation is for ${inviteEmail}, but signup is for ${normalizedEmail}`);
      
      // Return generic message to client to prevent email enumeration
      return NextResponse.json({ 
        error: 'Email mismatch', 
        details: 'Email provided does not match invite' 
      }, { status: 400 });
    }
    
    userType = 'artist';
    invitationId = invite.id;
  } else {
    console.log('ℹ️ No invite token provided. Creating standard Fan account.');
  }

  // 2. Standard Auth Client for user creation
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

  // 3. Sign Up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (signUpError || !signUpData.user) {
    return NextResponse.json({ error: 'Could not create user.', details: signUpError?.message }, { status: 400 });
  }

  const userId = signUpData.user.id;

  // 4. Post-Signup Operations (Stripe + Profile Update)
  try {
    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: normalizedEmail,
      name: name,
      metadata: { supabase_user_id: userId, user_type: userType },
    });

    // Update Profile with Role and Stripe ID
    // We use upsert to handle potential race conditions with database triggers
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId,
        full_name: name,
        avatar_url: null, // Default
        stripe_customer_id: customer.id,
        user_type: userType // This ensures they get the Artist role
      })
      .select();

    if (updateError) {
      console.error('❌ Database profile update error:', updateError);
    }

    // Mark invitation as used
    if (invitationId) {
      await supabaseAdmin
        .from('artist_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitationId);
    }

  } catch (err) {
    console.error('❌ Post-signup error:', err);
    // We don't fail the request here because the user account was technically created
  }

  // 5. Sign In automatically to complete flow
  await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

  // 6. Return success with redirect hint
  return NextResponse.json(
    { 
      message: 'Sign up successful!', 
      user: signUpData.user,
      redirectTo: userType === 'artist' ? '/artist/dashboard' : '/'
    },
    { status: 200 }
  );
}