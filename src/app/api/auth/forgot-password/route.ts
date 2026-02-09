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

    // DEBUG: Robustly determine the origin for production
    // Vercel doesn't always provide 'origin' header in server actions/API routes called internally
    // We prioritize the request origin, then the configured site URL, then localhost
    const requestOrigin = request.headers.get('origin');
    const configSiteUrl = process.env.NEXT_PUBLIC_SITE_URL; // Should be set in Vercel to https://theinertiaproject.com
    
    // Clean up the URL to ensure no trailing slash
    const origin = (requestOrigin || configSiteUrl || 'http://localhost:3000').replace(/\/$/, '');
    
    // Construct the callback URL
    const callbackUrl = `${origin}/api/auth/callback?next=/reset-password`;

    console.log('[Forgot Password] --------------------------------------------------');
    console.log(`[Forgot Password] Processing request for email: ${email}`);
    console.log(`[Forgot Password] Detected Origin: ${origin}`);
    console.log(`[Forgot Password] Constructed Redirect URL: ${callbackUrl}`);
    console.log('[Forgot Password] --------------------------------------------------');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (error) {
      console.error('[Forgot Password] Supabase Error:', error.message);
      // Return success anyway to prevent email enumeration, but log the error
      return NextResponse.json({ message: 'Password reset email sent' });
    }

    console.log('[Forgot Password] Success: Supabase accepted the request.');
    return NextResponse.json({ message: 'Password reset email sent' });

  } catch (err: any) {
    console.error('[Forgot Password] Unexpected Critical Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}