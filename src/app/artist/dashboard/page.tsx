// File: src/app/artist/dashboard/page.tsx
import { createClient } from '../../../../src/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Star } from "lucide-react";

export default async function ArtistDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch generic profile info for the welcome message
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id!)
        .single();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Artist'}</h1>
                <p className="text-gray-400 mt-2">Here is what is happening with your projects.</p>
            </div>

            {/* Placeholder Stats Widgets */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Funds Raised</CardTitle>
                        <DollarSign className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-gray-200">+0% from last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Total Fans</CardTitle>
                        <Users className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                         <p className="text-xs text-gray-200">Just getting started</p>
                    </CardContent>
                </Card>
                 <Card className="bg-[#64918E] border-none text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-100">Active Campaigns</CardTitle>
                        <Star className="h-4 w-4 text-[#CB945E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-200">No active projects</p>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State Call to Action */}
            <div className="rounded-lg border border-dashed border-gray-600 p-12 text-center bg-black/20">
                <h3 className="text-lg font-semibold text-white">Your dashboard is ready</h3>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                    This is your command center. In the next sprint, we will unlock the tools to create your first campaign and customize your artist profile.
                </p>
            </div>
        </div>
    );
}