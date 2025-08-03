// File: src/app/api/auth/forgot-password/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.json();
  const email = formData.email;
  const cookieStore = await cookies();

  // This is the URL of the page where users will reset their password.
  // We will build this page in a later step.
  const redirectTo = `${new URL(request.url).origin}/reset-password`;

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

  // Use Supabase's built-in function to send a password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error('Error sending password reset email:', error);
    // For security, we don't want to reveal if an email exists or not.
    // So we return a generic success message even if there was an error.
    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { message: "If an account with that email exists, a password reset link has been sent." },
    { status: 200 }
  );
}