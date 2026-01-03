import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Star } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ArtistDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return <div>Please log in.</div>;
    }

    // Fetch generic profile info for the welcome message
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    // Fetch project stats for the logged-in artist
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, current_funding, backer_count, status')
        .eq('user_id', user.id);

    if (projectsError) {
        console.error("Error fetching projects:", projectsError);
    }

    // Calculate Stats
    // Active Campaigns: Fundraising, Funded, or legacy 'Live'
    const activeCampaignsCount = projects?.filter(p => 
        p.status === 'Fundraising' || 
        p.status === 'Funded' || 
        p.status === 'Live' || 
        p.status === 'active'
    ).length || 0;
    
    // Total Funds: Sum of current_funding
    const totalFundsRaised = projects?.reduce((sum, p) => sum + (Number(p.current_funding) || 0), 0) || 0;
    
    // Total Fans: Sum of backer_count
    const totalBackers = projects?.reduce((sum, p) => sum + (p.backer_count || 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Artist'}</h1>
                    <p className="text-gray-400 mt-2">Here is what is happening with your projects.</p>
                </div>
            </div>

            {/* Stats Widgets */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Funds Raised</CardTitle>
                        <DollarSign className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalFundsRaised.toLocaleString()}</div>
                        <p className="text-xs text-gray-200">Across all projects</p>
                    </CardContent>
                </Card>
                 <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Total Fans</CardTitle>
                        <Users className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBackers.toLocaleString()}</div>
                         <p className="text-xs text-gray-200">Lifetime backers</p>
                    </CardContent>
                </Card>
                 <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Active Campaigns</CardTitle>
                        <Star className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCampaignsCount}</div>
                        <p className="text-xs text-gray-200">Currently live</p>
                    </CardContent>
                </Card>
            </div>

            {/* Conditional Empty State */}
            {(!projects || projects.length === 0) && (
                <div className="rounded-lg border border-dashed border-gray-600 p-12 text-center bg-black/20">
                    <h3 className="text-lg font-semibold text-white">Your dashboard is ready</h3>
                    <p className="mt-2 text-gray-400 max-w-md mx-auto">
                        This is your command center. You haven't launched any projects yet.
                    </p>
                </div>
            )}
        </div>
    );
}