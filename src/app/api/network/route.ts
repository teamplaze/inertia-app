import { createClient } from '@supabase/supabase-js'; // <-- CHANGED this import
import { NextResponse } from 'next/server';
import type { BudgetCategory } from '@/types';

export async function POST(request: Request) {
  const formData = await request.json();

  // --- 1. Create a Supabase Admin Client ---
  // This client uses the Service Role Key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- 2. Insert the form data into Supabase (as before) ---
  const { data: submissionData, error: insertError } = await supabase
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
        // Ensure all required columns in Supabase are included
      }
    ])
    .select() // Optionally select the inserted data if needed later
    .single(); // Assuming you insert one record

  if (insertError) {
    console.error('Error inserting network submission:', insertError);
    return NextResponse.json(
      { error: 'Failed to submit form to database.', details: insertError.message },
      { status: 500 }
    );
  }

  console.log('✅ Network submission saved to Supabase for:', formData.email);

  // --- 3. Add the contact to Loops.so (Removed redundant email check) ---
  try {
    const loopsApiKey = process.env.LOOPS_API_KEY;
    if (!loopsApiKey) {
      // It's often better to throw an error here if the key is missing,
      // as it indicates a configuration problem.
      console.error("LOOPS_API_KEY environment variable is not set.");
      throw new Error("LOOPS_API_KEY environment variable is not set.");
    }

    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loopsApiKey}`,
      },
      body: JSON.stringify({
        email: formData.email,
        firstName: formData.firstName, // Pass first name if available
        lastName: formData.lastName,   // Pass last name if available
        source: "Network Signup Form", // Optional: Track where the contact came from
        userGroup: "Network Submissions" // *** This line is now uncommented and updated ***
      }),
    });

    // It's good practice to handle potential non-JSON responses
    const responseText = await loopsResponse.text();
    let loopsData;
    try {
        loopsData = JSON.parse(responseText);
    } catch (e) {
        // If parsing fails, use the raw text
        loopsData = { message: responseText };
    }


    if (!loopsResponse.ok) {
      // Log the error but don't fail the entire request,
      // as the data is already saved in Supabase.
      console.error(`Error adding contact to Loops.so (Status: ${loopsResponse.status}):`, loopsData);
    } else {
      console.log('✅ Contact added/updated in Loops.so:', formData.email);
    }
  } catch (loopsError) {
    console.error('Failed to call Loops.so API:', loopsError);
    // Log this error but still return success since DB insert worked
  }

  // --- 4. Return Success Response (as before) ---
  return NextResponse.json(
    { message: 'Submission successful!' },
    { status: 200 }
  );
}

