// File Location: src/app/api/newsletter/subscribe/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This function handles POST requests, which are used to send data to a server.
export async function POST(request: Request) {
  try {
    // We get the data sent from the frontend (the email address).
    const { email } = await request.json();

    // Basic validation.
    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 } // Bad Request
      );
    }

    // This is the command to insert data into your Supabase table.
    // It says: "Into the 'newsletter_subscribers' table, insert a new row
    // with the 'email' we received."
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select();

    // This is special error handling for when someone tries to subscribe
    // with an email that is already in the database.
    if (error) {
      if (error.code === '23505') { // This code means "unique violation"
        return new NextResponse(
          JSON.stringify({ error: 'This email is already subscribed.' }),
          { status: 409 } // Conflict
        );
      }
      throw error; // Throw any other errors.
    }

    // If successful, send a success message back.
    return NextResponse.json({ message: 'Successfully subscribed!', data });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to subscribe', details: error.message }),
      { status: 500 }
    );
  }
}