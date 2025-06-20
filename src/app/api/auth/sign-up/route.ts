// File: src/app/api/auth/sign-up/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.json();
  const email = formData.email;
  const password = formData.password;
  const name = formData.name;
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

  // --- First, attempt to sign up the new user ---
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  // If sign-up fails (e.g., user already exists), return an error immediately
  if (signUpError) {
    console.error('Supabase sign up error:', signUpError);
    return NextResponse.json(
      { error: 'Could not create user.', details: signUpError.message },
      { status: 400 }
    );
  }

  // --- If sign-up is successful, immediately sign them in ---
  // This step creates the user's session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If the immediate sign-in fails for some reason, return an error
  if (signInError) {
    console.error('Supabase sign in after sign up error:', signInError);
    return NextResponse.json(
      { error: 'Could not sign in user after sign up', details: signInError.message },
      { status: 400 }
    );
  }

  // If both are successful, return a success message
  return NextResponse.json(
    { message: 'Sign up and login successful!', user: signInData.user },
    { status: 200 }
  );
}