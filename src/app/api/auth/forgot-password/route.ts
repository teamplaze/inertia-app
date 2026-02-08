import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // DEBUG: Check what the origin is
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const callbackUrl = `${origin}/api/auth/callback?next=/reset-password`;

    console.log('[Forgot Password] Sending reset email to:', email);
    console.log('[Forgot Password] Using origin:', origin);
    console.log('[Forgot Password] Redirect URL:', callbackUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (error) {
      console.error('[Forgot Password] Error:', error);
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ message: 'Password reset email sent' });
    }

    return NextResponse.json({ message: 'Password reset email sent' });

  } catch (err: any) {
    console.error('[Forgot Password] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}