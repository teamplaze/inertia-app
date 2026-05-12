'use server'

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Initialize Admin Client for fetching data securely (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type TransactionData = {
  id: number;
  amount: number;
  date: string;
  tier_name: string;
  backer_name: string;
  backer_email: string;
};

// Helper to verify access
async function verifyProjectAccess(projectId: number) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  // Check if Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();
  
  if (profile?.user_type === 'admin') return true;

  // Check if Project Member
  const { data: membership } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single();

  return !!membership;
}

export async function getTransactions(projectId: number, page: number = 1, pageSize: number = 20) {
  // 1. Security Check
  const hasAccess = await verifyProjectAccess(projectId);
  if (!hasAccess) {
    throw new Error('Unauthorized access to project transactions');
  }
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 2. Fetch Contributions using Admin Client (Bypasses RLS)
  // Added backer_name and backer_email to select
  const { data: contributions, count, error } = await supabaseAdmin
    .from('contributions')
    .select(`
      id,
      amount_paid,
      created_at,
      user_id,
      backer_name,
      backer_email,
      tiers ( name )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  // 3. Fetch Profiles (Names) and Emails for logged-in users
  // Filter out null userIds (guest checkouts) before querying
  const userIds = Array.from(new Set(contributions.map(c => c.user_id).filter(id => id !== null)));
  
  const profileMap = new Map<string, string>();
  const userMap = new Map<string, string>();

  if (userIds.length > 0) {
      // Fetch Profiles for Names 
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profiles) {
        profiles.forEach(p => profileMap.set(p.id, p.full_name || 'Anonymous'));
      }

      // Fetch Emails via Admin API
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      if (users?.users) {
          users.users.forEach(u => userMap.set(u.id, u.email || ''));
      }
  }

  // 4. Format Data with Fallbacks
  const formatted: TransactionData[] = contributions.map(c => {
    // Determine the raw full name (Profile > Stripe Data > Anonymous)
    let rawFullName = 'Anonymous';
    if (c.user_id && profileMap.has(c.user_id)) {
        rawFullName = profileMap.get(c.user_id)!;
    } else if (c.backer_name) {
        rawFullName = c.backer_name;
    }
    
    // Format Name: First Name + Last Initial (for privacy on the dashboard if desired)
    let displayName = 'Anonymous';
    if (rawFullName !== 'Anonymous') {
        const nameParts = rawFullName.trim().split(/\s+/);
        displayName = nameParts.length > 1 
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
    }

    // Determine Email (Auth DB > Stripe Data > N/A)
    let finalEmail = 'N/A';
    if (c.user_id && userMap.has(c.user_id)) {
        finalEmail = userMap.get(c.user_id)!;
    } else if (c.backer_email) {
        finalEmail = c.backer_email;
    }

    return {
      id: c.id,
      amount: c.amount_paid,
      date: c.created_at,
      tier_name: (c.tiers as any)?.name || 'Donation',
      backer_name: displayName,
      backer_email: finalEmail
    };
  });

  return {
    data: formatted,
    totalCount: count || 0
  };
}

export async function getAllTransactionsForExport(projectId: number) {
    // 1. Security Check
    const hasAccess = await verifyProjectAccess(projectId);
    if (!hasAccess) {
      throw new Error('Unauthorized access to export transactions');
    }
    
    // 2. Fetch ALL rows for CSV using Admin Client
    const { data: contributions, error } = await supabaseAdmin
      .from('contributions')
      .select(`
        id,
        amount_paid,
        created_at,
        user_id,
        backer_name,
        backer_email,
        tiers ( name )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
  
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set(contributions.map(c => c.user_id).filter(id => id !== null)));

    const profileMap = new Map<string, string>();
    const userMap = new Map<string, string>();

    if (userIds.length > 0) {
        // Fetch Profiles
        const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

        if (profiles) {
        profiles.forEach(p => profileMap.set(p.id, p.full_name || 'Anonymous'));
        }

        // Fetch emails
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        if (users?.users) {
            users.users.forEach(u => userMap.set(u.id, u.email || ''));
        }
    }

    return contributions.map(c => {
        // Raw Name Fallback
        let fullName = 'Anonymous';
        if (c.user_id && profileMap.has(c.user_id)) {
            fullName = profileMap.get(c.user_id)!;
        } else if (c.backer_name) {
            fullName = c.backer_name;
        }

        // Email Fallback
        let email = 'N/A';
        if (c.user_id && userMap.has(c.user_id)) {
            email = userMap.get(c.user_id)!;
        } else if (c.backer_email) {
            email = c.backer_email;
        }

        return {
            Date: new Date(c.created_at).toLocaleDateString(),
            Amount: c.amount_paid,
            Tier: (c.tiers as any)?.name || 'Donation',
            Backer: fullName,
            Email: email
        };
    });
}