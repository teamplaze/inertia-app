import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, projectId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Insert the invitation with project_id
    const { data, error } = await supabaseAdmin
      .from('artist_invitations')
      .insert([{ 
          email,
          project_id: projectId || null 
      }])
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw error;
    }

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