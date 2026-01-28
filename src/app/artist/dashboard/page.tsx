import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Import for admin
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Star, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TransactionFeed from '@/components/dashboard/TransactionFeed';

export default async function ArtistDashboardPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    
    // Initialize Admin Client to bypass RLS for stats fetching
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return <div>Please log in.</div>;
    }

    // Check if current user is admin to allow "viewAs" functionality
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

    let targetUserId = user.id;
    const viewAs = searchParams.viewAs;

    // If admin, allow overriding the user ID to view another artist's dashboard
    if (currentUserProfile?.user_type === 'admin' && typeof viewAs === 'string') {
        targetUserId = viewAs;
    }

    const { data: profile } = await supabaseAdmin // Use admin to ensure we get profile even if RLS is strict
        .from('profiles')
        .select('full_name')
        .eq('id', targetUserId)
        .single();

    // 1. Fetch ALL projects for the artist via project_members
    const { data: memberships } = await supabaseAdmin // Use admin to ensure we get membership data
        .from('project_members')
        .select(`
            project:projects (*)
        `)
        .eq('user_id', targetUserId);

    const projects = memberships?.map((m: any) => m.project) || [];
    
    // 2. Select Spotlight Project (Most recent active)
    const activeProject = projects.sort((a: any, b: any) => b.id - a.id)[0];

    // If no project, show empty state
    if (!activeProject) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Artist'}</h1>
                <div className="rounded-lg border border-dashed border-gray-600 p-12 text-center bg-black/20">
                    <h3 className="text-lg font-semibold text-white">Your dashboard is ready</h3>
                    <p className="mt-2 text-gray-400 max-w-md mx-auto">
                        This is your command center. You haven't joined any project teams yet. Contact an admin to get started.
                    </p>
                </div>
            </div>
        );
    }

    // 3. Fetch Tier Stats for Spotlight Project (Using Admin to bypass RLS)
    const { data: tierStats } = await supabaseAdmin
        .from('contributions')
        .select('tier_id, amount_paid')
        .eq('project_id', activeProject.id);

    // Fetch Tiers details
    const { data: tiers } = await supabaseAdmin
        .from('tiers')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('price', { ascending: true });

    // Aggregate Tier Data
    const tierPerformance = tiers?.map(tier => {
        const sales = tierStats?.filter((c: any) => c.tier_id === tier.id) || [];
        const count = sales.length;
        const total = sales.reduce((sum: number, c: any) => sum + Number(c.amount_paid), 0);
        return { ...tier, count, total };
    }) || [];

    // 4. Calculate Real-Time Totals
    const totalRaised = tierStats?.reduce((sum: number, c: any) => sum + Number(c.amount_paid), 0) || 0;
    const totalBackers = activeProject.backer_count || 0;
    
    // Find last contribution time
    const { data: lastContrib } = await supabaseAdmin
        .from('contributions')
        .select('created_at')
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Helper for relative time
    const timeAgoStr = lastContrib ? timeAgo(new Date(lastContrib.created_at)) : '—';

    // Calculate Funding Progress
    const fundingProgress = activeProject.funding_goal > 0 
        ? Math.min(Math.round((totalRaised / activeProject.funding_goal) * 100), 100)
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Artist'}</h1>
                    <p className="text-gray-400 mt-1">Here is the latest on <span className="text-[#CB945E] font-semibold">{activeProject.project_title}</span>.</p>
                </div>
            </div>

            {/* --- SECTION 1: Spotlight & High Level Stats --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* 1.1 Project Spotlight Card */}
                <Card className="bg-[#2D3534] border-[#CB945E] text-white col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-lg">
                            Project Spotlight
                            <Badge status={activeProject.status} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">Progress</span>
                                <span className="text-[#CB945E] font-bold">{fundingProgress}%</span>
                            </div>
                            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-gray-700">
                                <div className="h-full bg-[#CB945E]" style={{ width: `${fundingProgress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-gray-400">
                                <span>${totalRaised.toLocaleString()}</span>
                                <span>Goal: ${activeProject.funding_goal.toLocaleString()}</span>
                            </div>
                        </div>
                        <Link href={`/${activeProject.slug || `projects/${activeProject.id}`}`} target="_blank">
                            <Button className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white mt-2">
                                View Public Page <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* 2.1 & 2.2 Funds & Momentum */}
                <Card className="bg-[#1E2322] border-none text-white shadow-lg lg:col-span-2">
                    <CardContent className="p-6 h-full flex flex-col md:flex-row gap-8 items-center justify-around">
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Funds Raised</p>
                            <div className="text-5xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                <span className="text-[#CB945E] text-3xl">$</span>
                                {totalRaised.toLocaleString()}
                            </div>
                        </div>
                        <div className="h-px w-full md:w-px md:h-16 bg-gray-700"></div>
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Backers</p>
                            <div className="text-5xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                <Users className="w-8 h-8 text-[#CB945E]" />
                                {totalBackers.toLocaleString()}
                            </div>
                        </div>
                        <div className="h-px w-full md:w-px md:h-16 bg-gray-700"></div>
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Last Contribution</p>
                            <div className="text-2xl font-semibold text-white">
                                {timeAgoStr}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Keep the momentum going!</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- SECTION 3: Tier Performance --- */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="bg-[#2D3534] border-[#CB945E] text-white lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tier Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-700 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-[#1E2322]">
                                    <TableRow className="border-gray-700 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Tier Name</TableHead>
                                        <TableHead className="text-gray-400">Price</TableHead>
                                        <TableHead className="text-gray-400">Seats Sold</TableHead>
                                        <TableHead className="text-gray-400">Total Raised</TableHead>
                                        {/* Show Remaining if any tier has a limit */}
                                        <TableHead className="text-gray-400 text-right">Availability</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tierPerformance.map((tier) => (
                                        <TableRow key={tier.id} className="border-gray-700 hover:bg-white/5">
                                            <TableCell className="font-medium text-white">{tier.name}</TableCell>
                                            <TableCell className="text-gray-300">${tier.price}</TableCell>
                                            <TableCell className="text-white">{tier.count}</TableCell>
                                            <TableCell className="text-[#CB945E] font-bold">${tier.total.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-gray-300">
                                                {tier.total_slots 
                                                    ? `${Math.max(0, tier.total_slots - tier.claimed_slots)} / ${tier.total_slots} left`
                                                    : 'Unlimited'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- SECTION 4: Transaction Feed (Client Component) --- */}
            <TransactionFeed projectId={activeProject.id} />
        </div>
    );
}

// Simple Badge Helper
function Badge({ status }: { status: string }) {
    const isLive = status === 'active' || status === 'Live' || status === 'Fundraising';
    return (
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            isLive ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-gray-700 text-gray-300'
        }`}>
            {status}
        </span>
    );
}

// Helper to calculate "Time Ago" without external deps
// FIX: Added Math.abs() to handle slight clock skew resulting in negative seconds
function timeAgo(date: Date) {
    let seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    // Handle future dates or clock skew by treating as "Just now"
    if (seconds < 0) {
        if (seconds > -60) return "Just now"; // Tolerance for 1 min skew
        seconds = 0; // Otherwise clamp to 0
    }
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
}