// File: src/app/api/network/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.json();
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

  // Insert the form data into the 'network_submissions' table
  const { error } = await supabase
    .from('network_submissions')
    .insert([
      { 
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.companyName,
        specialty: formData.specialty,
        preferred_contact_method: formData.contactMethod,
        socials: formData.socials,
        portfolio_url: formData.portfolio,
        preferred_genre: formData.genre,
      }
    ]);

  if (error) {
    console.error('Error inserting network submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit form.', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Submission successful!' },
    { status: 200 }
  );
}