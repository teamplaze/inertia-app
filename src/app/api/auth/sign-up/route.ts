import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; 
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const formData = await request.json();
  const { email, password, name, inviteToken } = formData;
  
  const normalizedEmail = email.toLowerCase().trim();
  const cookieStore = await cookies();

  // 1. Verify Invitation if provided
  let userType = 'fan';
  let invitationId = null;
  let linkedProjectId = null;

  if (inviteToken) {
    
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('artist_invitations')
      .select('*')
      .eq('token', inviteToken)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation token.' }, { status: 400 });
    }

    // Security Check: Email match
    const inviteEmail = invite.email.toLowerCase().trim();
    if (inviteEmail !== normalizedEmail) {
      return NextResponse.json({ 
        error: 'Email mismatch', 
        details: 'Email does not match invite' 
      }, { status: 400 });
    }
    
    userType = 'artist';
    invitationId = invite.id;
    linkedProjectId = invite.project_id; // Capture the linked project ID
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

  // 4. Post-Signup Operations
  try {
    const customer = await stripe.customers.create({
      email: normalizedEmail,
      name: name,
      metadata: { supabase_user_id: userId, user_type: userType },
    });

    // Update Profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId,
        full_name: name,
        avatar_url: null, 
        stripe_customer_id: customer.id,
        user_type: userType 
      })
      .select();

    if (updateError) console.error('DB Profile Error:', updateError);

    // Mark invitation as used
    if (invitationId) {
      await supabaseAdmin
        .from('artist_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitationId);
        
      // NEW: Link Project to User via project_members table
      if (linkedProjectId) {
          const { error: linkError } = await supabaseAdmin
            .from('project_members')
            .insert([{
                project_id: linkedProjectId,
                user_id: userId,
                role: 'owner' // Default to owner, can be expanded later
            }]);
            
          if (linkError) {
              console.error('❌ Failed to add user to project team:', linkError);
          } else {
              console.log(`✅ Successfully added Artist ${userId} to Project ${linkedProjectId}`);
          }
      }
    }

  } catch (err) {
    console.error('❌ Post-signup error:', err);
  }

  // 5. Sign In
  await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

  return NextResponse.json(
    { 
      message: 'Sign up successful!', 
      user: signUpData.user,
      redirectTo: userType === 'artist' ? '/artist/dashboard' : '/'
    },
    { status: 200 }
  );
}