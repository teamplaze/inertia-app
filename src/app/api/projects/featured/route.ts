// File Location: src/app/api/projects/featured/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This creates a Supabase client.
// It securely reads the environment variables you set up in Part 1.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This is the function that runs when a GET request is made to this endpoint.
export async function GET() {
  try {
    // This is the query to your Supabase database.
    // It says: "From the 'projects' table, select all columns (*),
    // order them by the 'created_at' date, and only give me the first 3."
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    // If Supabase returns an error, we'll send it back.
    if (error) {
      throw error;
    }

    // If successful, send the 'projects' data back to the client as JSON.
    return NextResponse.json(projects);
  } catch (error: any) {
    // If anything goes wrong in the 'try' block, this catch block runs.
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch projects', details: error.message }),
      { status: 500 }
    );
  }
}