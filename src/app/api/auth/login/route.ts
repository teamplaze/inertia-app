import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.json();
  const email = formData.email;
  const password = formData.password;
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Could not authenticate user', details: error.message },
      { status: 401 }
    );
  }

  // Fetch the user's profile to check their role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  let redirectTo = '/account'; // Default to fan account

  if (profile?.user_type === 'artist') {
    redirectTo = '/artist/dashboard';
  } else if (profile?.user_type === 'admin') {
    // Optional: Redirect admins to a specific admin area if you have one
    redirectTo = '/admin/invite'; 
  }

  return NextResponse.json(
    { message: 'Login successful!', redirectTo },
    { status: 200 }
  );
}