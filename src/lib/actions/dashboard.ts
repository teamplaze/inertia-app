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
  const { data: contributions, count, error } = await supabaseAdmin
    .from('contributions')
    .select(`
      id,
      amount_paid,
      created_at,
      user_id,
      tiers ( name )
    `, { count: 'exact' })
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  // 3. Fetch Profiles (Names) and Emails
  // We collect User IDs to fetch details in bulk
  const userIds = Array.from(new Set(contributions.map(c => c.user_id)));
  
  // Fetch Profiles for Names (Public info, but getting via Admin is safe/easy here)
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map<string, string>();
  if (profiles) {
    profiles.forEach(p => profileMap.set(p.id, p.full_name || 'Anonymous'));
  }

  // Fetch Emails via Admin API
  // Note: List users might not scale infinitely but works for MVP. 
  // Ideally use `admin.getUserById` in loop or mapping if Supabase supports bulk get.
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  
  const userMap = new Map<string, string>();
  if (users?.users) {
      users.users.forEach(u => userMap.set(u.id, u.email || ''));
  }

  // 4. Format Data
  const formatted: TransactionData[] = contributions.map(c => {
    const fullName = profileMap.get(c.user_id) || 'Anonymous';
    
    // Format Name: First Name + Last Initial
    let displayName = 'Anonymous';
    if (fullName !== 'Anonymous') {
        const nameParts = fullName.trim().split(/\s+/);
        displayName = nameParts.length > 1 
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
    }

    return {
      id: c.id,
      amount: c.amount_paid,
      date: c.created_at,
      tier_name: (c.tiers as any)?.name || 'Unknown',
      backer_name: displayName,
      backer_email: userMap.get(c.user_id) || 'N/A' 
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
        tiers ( name )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
  
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set(contributions.map(c => c.user_id)));

    // Fetch Profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    const profileMap = new Map<string, string>();
    if (profiles) {
      profiles.forEach(p => profileMap.set(p.id, p.full_name || 'Anonymous'));
    }

    // Fetch emails
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const userMap = new Map<string, string>();
    if (users?.users) {
        users.users.forEach(u => userMap.set(u.id, u.email || ''));
    }

    return contributions.map(c => ({
        Date: new Date(c.created_at).toLocaleDateString(),
        Amount: c.amount_paid,
        Tier: (c.tiers as any)?.name || 'Unknown',
        Backer: profileMap.get(c.user_id) || 'Anonymous',
        Email: userMap.get(c.user_id) || 'N/A'
    }));
}