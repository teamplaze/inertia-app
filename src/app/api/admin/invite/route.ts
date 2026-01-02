// File: src/app/api/admin/invite/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize a Supabase Admin client with the Service Role Key.
// This allows us to bypass RLS policies to create invitations securely.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Insert the invitation
    // The 'token' column has a default gen_random_uuid(), so we don't need to generate it manually here.
    const { data, error } = await supabaseAdmin
      .from('artist_invitations')
      .insert([{ email }])
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw error;
    }

    // Construct the Invite Link
    // We use the request header to determine the current domain (localhost or production)
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteLink = `${origin}/sign-up?invite=${data.token}`;

    return NextResponse.json({ 
      message: 'Invitation created successfully', 
      link: inviteLink,
      token: data.token 
    });

  } catch (error: any) {
    console.error('Invite creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}