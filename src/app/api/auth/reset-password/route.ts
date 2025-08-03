// File: src/app/api/auth/reset-password/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const cookieStore = await cookies();

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

  // updateUser is the function to update the password for the logged-in user
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Could not update password', details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: 'Password updated successfully!' },
    { status: 200 }
  );
}