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

    // DEBUGGING LOGIC
    const requestOrigin = request.headers.get('origin');
    const configSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    // Prioritize the configured site URL to ensure consistency with Supabase Allow List
    // Clean up trailing slash just in case
    const origin = (configSiteUrl || requestOrigin || 'http://localhost:3000').replace(/\/$/, '');
    
    const callbackUrl = `${origin}/api/auth/callback?next=/reset-password`;

    console.log('--- FORGOT PASSWORD DEBUG ---');
    console.log('1. NEXT_PUBLIC_SITE_URL Env Var:', configSiteUrl);
    console.log('2. Request Header Origin:', requestOrigin);
    console.log('3. Resolved Origin:', origin);
    console.log('4. Final Redirect URL sent to Supabase:', callbackUrl);
    console.log('-----------------------------');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (error) {
      console.error('Supabase Error:', error.message);
      return NextResponse.json({ message: 'Password reset email sent' });
    }

    return NextResponse.json({ message: 'Password reset email sent' });

  } catch (err: any) {
    console.error('Critical Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}