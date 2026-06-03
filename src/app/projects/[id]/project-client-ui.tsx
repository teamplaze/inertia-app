// File: src/app/projects/[id]/project-client-ui.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Star, Quote, CheckCircle, Eye, MessageSquare, DollarSign, User, LayoutDashboard, Heart, ArrowRight, ChevronDown, ChevronUp, ArrowDown, Loader2  } from "lucide-react";
import Image from "next/image";
import BudgetBreakdown from "@/components/project/BudgetBreakdown";
import type { Project, Tier } from "@/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FAQSection from '@/components/project/FAQSection'; // Import the FAQ Component
import TierComparisonMatrix from "@/components/project/TierComparison";
import FundingMeter from "@/components/project/FundingMeter";
import { BRAND } from "@/lib/colors";
import { regularCardStyle, gradientCardStyle } from "@/lib/cardStyles";

// Check if payments are enabled via environment variable
const paymentsEnabled = (() => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return true;
  return process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
})();

interface ProjectUIProps {
  projectData: Project;
  isProjectMember: boolean;
}

// Helper to get tier subtitle
const getTierSubtitle = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes("GA")) return "For fans who want to be part of the journey and the fun";
  if (n.includes("PIT") || n.includes("BACKSTAGE")) return "For fans who want deeper access and real conversations";
  if (n.includes("VIP")) return "For fans who want to leave their mark on the project";
  return null;
};

export default function ProjectUI({ projectData, isProjectMember }: ProjectUIProps) {
  const { user } = useAuth();
  const router = useRouter();
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  
  // Use state for tiers to allow for real-time updates
  const [tiers, setTiers] = useState<Tier[]>(projectData.tiers);
  const [project, setProject] = useState<Project>(projectData);
  
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // New state for expandable fan stories
  const [showAllStories, setShowAllStories] = useState(false);

    // --- NEW: Donation State ---
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [coverFee, setCoverFee] = useState<boolean>(true); // Default to helping the artist
  const [isDonating, setIsDonating] = useState<boolean>(false);

  const supabase = createClient();

  useEffect(() => {
    // Listen for changes to the 'tiers' table for this project
    const tiersChannel = supabase
      .channel(`realtime-tiers:${project.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tiers', filter: `project_id=eq.${project.id}` },
        (payload) => {
          const updatedTier = payload.new as Tier;
          setTiers(currentTiers =>
            currentTiers.map(tier => (tier.id === updatedTier.id ? updatedTier : tier))
          );
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(tiersChannel);
    };
  }, [supabase, project.id]);


  const fundingPercentage = Math.round((project.current_funding / project.funding_goal) * 100);
  const selectedTierData = tiers.find((tier) => tier.id === selectedTier);

  // --- PATH A: Custom Donation Handler ---
  const handleDonationCheckout = async () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsDonating(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project.id, 
          donationAmount: amount,
          coverFee 
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session.');

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsDonating(false);
    }
  };

  // --- PATH B: Standard Tier Handler ---
  const handleTierSelect = (tierId: number) => {
    setSelectedTier(tierId);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!selectedTierData) {
      alert("Please select a tier first.");
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tierId: selectedTierData.id, projectId: project.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session.');
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  // We use the presence of the donation_link as a flag to enable the donate card
  const hasDonationEnabled = true;

  const visibleTiers = tiers.filter(tier => tier.name.toUpperCase() !== "GA");

  // Fall back to budget_categories for projects that predate the milestones feature
  const budgetMilestones = (project.project_milestones?.length ?? 0) > 0
    ? project.project_milestones!
    : (project.budget_categories ?? []).map(cat => ({
        id: cat.id,
        title: cat.name,
        sort_order: 0,
        budget_line_items: cat.budget_line_items,
      }));
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };


  // Determine displayed stories based on state
  const displayedStories = showAllStories 
    ? project.testimonials 
    : project.testimonials.slice(0, 2);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Project Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
        <div className="space-y-6">
          <Image
            src={project.project_image_url || "/placeholder.svg"}
            alt={project.project_title}
            width={600}
            height={600}
            className="w-full max-w-md mx-auto aspect-square object-cover rounded-xl shadow-2xl border border-gray-700"
          />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start">
              <Badge
                variant={project.status === "Completed" ? "secondary" : "default"}
                className="mb-4 bg-gray-600 text-white"
              >
                {project.status}
              </Badge>

              {/* --- ARTIST DASHBOARD BUTTON (Conditional) --- */}
              {isProjectMember && (
                <Link href={`/artist/dashboard?projectId=${project.id}`}>
                    <Button className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Project Results
                    </Button>
                </Link>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-2" style={{ color: BRAND.teal }}>
              {project.project_title}
            </h1>
            <div className="flex items-start gap-3 mb-6">
              <Image
                src={project.artist_profile_image_url || "/placeholder.svg"}
                alt={project.artist_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-600 shrink-0"
              />
              <div>
                <p className="font-semibold text-white">{project.artist_name}</p>
                <p className="text-sm text-gray-400">{project.artist_bio}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold" style={{ color: BRAND.green }}>
                ${project.current_funding.toLocaleString()}
              </span>
              <span className="text-gray-400">of ${project.funding_goal.toLocaleString()} goal</span>
            </div>
            <FundingMeter 
              currentFunds={project.current_funding} 
              totalGoal={project.funding_goal} 
              milestones={project.project_milestones} 
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{fundingPercentage}% funded</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.backer_count} backers
              </span>
            </div>

            <Button
              onClick={() => scrollToSection("support-levels")}
              className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white text-lg font-bold py-6 animate-pulse"
            >
              Buy Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
              <Button onClick={() => scrollToSection("from-artist")} size="sm" className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                <User className="w-4 h-4 mr-2" /> From Artist
              </Button>
              <Button onClick={() => scrollToSection("previews")} size="sm" className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                <Eye className="w-4 h-4 mr-2" /> Previews
              </Button>
              <Button onClick={() => scrollToSection("fan-stories")} size="sm" className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                <MessageSquare className="w-4 h-4 mr-2" /> Fan Stories
              </Button>
              <Button onClick={() => scrollToSection("budget-breakdown")} size="sm" className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                <DollarSign className="w-4 h-4 mr-2" /> Budget
              </Button>
              <Button onClick={() => scrollToSection("support-levels")} size="sm" className="bg-brand-copper hover:bg-brand-copper/90 text-white">
                <Star className="w-4 h-4 mr-2" /> Perks
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === FROM THE ARTIST SECTION === */}
      <section id="from-artist" className="mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: BRAND.teal }}>From the Artist</h2>
        <Card className="rounded-xl" style={gradientCardStyle}>
          <CardContent className="p-4">
            <div className="prose prose-lg max-w-none prose-invert">
                {project.from_the_artist_message && project.from_the_artist_message.split("\n").map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4 text-gray-200 leading-relaxed">{paragraph}</p>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* === PREVIEWS SECTION === */}
      <section id="previews" className="mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: BRAND.teal }}>Previews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl" style={regularCardStyle}>
            <CardContent className="p-4 space-y-2">
              <div className="aspect-video bg-black rounded-lg">
                {project.artist_message_video_url ? (
                  <iframe
                    src={project.artist_message_video_url}
                    title="A Message from the Artist"
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><p className="text-gray-400">No video preview available.</p></div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl" style={regularCardStyle}>
            <CardContent className="p-4 space-y-2">
              <div className="bg-black/40 rounded-lg p-4">
                {/* CONDITIONAL RENDER: Audio vs Spotify Embed */}
                {project.audio_preview_url ? (
                  <audio controls className="w-full">
                    <source src={project.audio_preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : project.spotify_artist_id ? (
                  // Spotify Embed Fallback
                  <iframe 
                    style={{ borderRadius: '12px' }} 
                    src={`https://open.spotify.com/embed/artist/${project.spotify_artist_id}?utm_source=generator&theme=0`} 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowFullScreen 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                  ></iframe>
                ) : (
                  <p className="text-center text-gray-400">No audio preview available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="fan-stories" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: BRAND.teal }}>Fan Stories</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedStories.map((testimonial) => (
              <Card key={testimonial.id} className="relative rounded-xl" style={regularCardStyle}>
                <CardContent className="p-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 opacity-20" style={{ color: BRAND.copper }} />
                  <div className="flex items-start gap-4 mb-4">
                    {testimonial.profile_image_url && (
                      <Image
                        src={testimonial.profile_image_url}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-400"
                      />
                    )}
                    <div className="flex-1">
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-300">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-white leading-relaxed">{testimonial.story}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {project.testimonials.length > 2 && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setShowAllStories(!showAllStories)}
                className="bg-brand-copper hover:bg-brand-copper/90 text-white"
              >
                {showAllStories ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show More Stories <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      <BudgetBreakdown milestones={budgetMilestones} colors={project.project_colors ?? undefined} />

      <section id="support-levels" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.teal }}>Choose Your Support Level</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">Every tier helps bring this project to life — higher levels unlock deeper access, rarer moments, and more personal connection with the band.</p>
          {/* Scroll to Compare Perks Button */}
          {visibleTiers.length > 1 && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => scrollToSection("tier-comparison")}
                className="bg-brand-copper hover:bg-brand-copper/90 text-white"
              >
                Compare Perks <ArrowDown className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {/* Adjusted grid logic: 3 columns by default, 4 columns ONLY if donationUrl exists */}
        <div className={`grid grid-cols-1 gap-6 items-stretch ${
            (visibleTiers.length + (hasDonationEnabled ? 1 : 0)) === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
            (visibleTiers.length + (hasDonationEnabled ? 1 : 0)) === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
            (visibleTiers.length + (hasDonationEnabled ? 1 : 0)) === 3 ? 'md:grid-cols-3' :
            'md:grid-cols-2 lg:grid-cols-4'
        }`}>
            {visibleTiers.sort((a, b) => a.price - b.price).map((tier) => {
            const isSoldOut = (tier.total_slots - tier.claimed_slots) <= 0;
            
            return (
            <div key={tier.id} className="flex flex-col gap-4">
              <Card
                className={`flex flex-col relative transition-all duration-200 rounded-xl h-full ${
                  selectedTier === tier.id 
                    ? "ring-2 ring-offset-2 ring-offset-brand-teal ring-brand-copper shadow-lg"
                    : "hover:shadow-md hover:shadow-gray-700/50"
                }`}
                style={regularCardStyle}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold" style={{ color: BRAND.copper }}>{tier.name}</CardTitle>
                      <p className="text-xs text-white/90 font-medium italic">{getTierSubtitle(tier.name)}</p>
                    </div>
                    {selectedTier === tier.id && <CheckCircle className="w-6 h-6" style={{ color: BRAND.copper }} />}
                  </div>
                  <div className="text-3xl font-bold text-white mt-2">${tier.price}</div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2">
                    {tier.perks.map((perk, index) => {
                      // THIS IS THE NEW LOGIC:
                      const displayPerk = perk.includes(':') 
                          ? perk.substring(perk.indexOf(':') + 1).trim() 
                          : perk;
                          
                      return (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: BRAND.copper }} />
                          {/* Render the cleaned string here */}
                          <span className="text-sm text-white">{displayPerk}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-sm text-center text-white/80 mb-2">{tier.total_slots - tier.claimed_slots} of {tier.total_slots} left</div>
                    
                    {paymentsEnabled ? (
                      isSoldOut ? (
                        // SOLD OUT BUTTON (Shows for everyone)
                        <Button 
                          className="w-full text-white bg-gray-500 cursor-not-allowed hover:bg-gray-500" 
                          disabled
                        >
                          Sold Out
                        </Button>
                      ) : user ? (
                        <Button 
                          onClick={() => handleTierSelect(tier.id)} 
                          className={`w-full text-white ${selectedTier === tier.id ? "bg-brand-teal-selected hover:bg-brand-teal-selected/90" : "bg-brand-copper hover:bg-brand-copper/90"}`} 
                        >
                          {selectedTier === tier.id ? "Selected" : "Select Tier"}
                        </Button>
                      ) : (
                        <Link href={`/sign-up?action=checkout&projectId=${project.id}&tierId=${tier.id}`}>
                          <Button className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white h-auto whitespace-normal" >
                            Login/Sign up to contribute
                          </Button>
                        </Link>
                      )
                    ) : (
                      <div className="w-full bg-brand-copper text-white text-center cursor-not-allowed opacity-60 hover:bg-brand-copper rounded-md px-4 py-2 font-medium text-sm">
                        Coming Soon
                      </div>
                    )}
                    
                  </div>
                </CardContent>
              </Card>

              {/* INLINE CHECKOUT BOX: Visible only on MOBILE (< md) */}
              {paymentsEnabled && showCheckout && selectedTier === tier.id && !isSoldOut && (
                <div className="md:hidden"> 
                    <Card className="rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-brand-copper shadow-xl" style={gradientCardStyle}>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Ready to support?</h3>
                            <p className="text-sm text-gray-200 leading-snug">
                            You've selected the <strong className="text-white">{tier.name}</strong> tier for <strong style={{ color: BRAND.copper }}>${tier.price}</strong>
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={handleCheckout} className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white font-semibold">
                            Continue to Checkout
                            </Button>
                            <Button 
                            variant="ghost" 
                            className="w-full text-gray-300 hover:text-white hover:bg-white/10 h-8 text-xs" 
                            onClick={() => { setSelectedTier(null); setShowCheckout(false); }}
                            >
                            Change Selection
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                </div>
              )}
            </div>
          );
        })}

          {/* === DONATION CARD === */}
          {hasDonationEnabled && (
            <div className="flex flex-col gap-4">
               <Card
                  className="flex flex-col relative transition-all duration-200 rounded-xl h-full hover:shadow-md hover:shadow-gray-700/50"
                  style={regularCardStyle}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold" style={{ color: BRAND.copper }}>Donate</CardTitle>
                        <p className="text-xs text-white/90 font-medium italic">Support the project directly without the perks</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">Any Amount</div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2">
                       <li className="flex items-start gap-2">
                         <Heart className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: BRAND.copper }} />
                         <span className="text-sm text-white">Help us reach our goal faster</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <Heart className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: BRAND.copper }} />
                         <span className="text-sm text-white">Every bit counts</span>
                       </li>
                    </ul>
                    <div className="pt-4 border-t border-white/20">
                       {paymentsEnabled ? (
                         <div className="space-y-4">
                           <div className="space-y-3">
                             <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
                               <Input
                                 type="number"
                                 min="1"
                                 step="1"
                                 placeholder="50"
                                 value={donationAmount}
                                 onChange={(e) => setDonationAmount(e.target.value)}
                                 className="pl-8 bg-black/20 border-brand-copper/50 text-white placeholder:text-gray-300 focus-visible:ring-brand-copper"
                               />
                             </div>
                             <div className="flex items-start space-x-2">
                               <Checkbox 
                                 id="cover-fee" 
                                 checked={coverFee} 
                                 onCheckedChange={(checked) => setCoverFee(checked as boolean)}
                                 className="mt-0.5 border-gray-300 data-[state=checked]:bg-brand-copper data-[state=checked]:border-brand-copper"
                               />
                               <label
                                 htmlFor="cover-fee"
                                 className="text-xs text-gray-200 leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                               >
                                 Cover processing fee so the artist gets 100% of your donation
                               </label>
                             </div>
                           </div>
                           
                           <Button 
                             onClick={handleDonationCheckout} 
                             disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
                             className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white font-bold transition-all"
                           >
                             {isDonating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                             {isDonating ? "Processing..." : "Donate Now"}
                           </Button>
                         </div>
                       ) : (
                         <div className="w-full bg-brand-copper text-white text-center cursor-not-allowed opacity-60 hover:bg-brand-copper rounded-md px-4 py-2 font-medium text-sm">
                           Coming Soon
                         </div>
                       )}
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

        </div>
      </section>

      {/* DESKTOP CHECKOUT BOX: Visible only on DESKTOP (>= md) */}
      {paymentsEnabled && showCheckout && selectedTierData && (
        <section className="mb-12 hidden md:block"> {/* Only show on desktop */}
          <Card className="rounded-xl" style={gradientCardStyle}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to support {project.artist_name}?</h3>
                  <p className="text-gray-200">You've selected the <strong className="text-white">{selectedTierData.name}</strong> tier for <strong style={{ color: BRAND.copper }}>${selectedTierData.price}</strong></p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-gray-400 text-gray-200 bg-transparent hover:bg-black/30 hover:text-gray-200" onClick={() => { setSelectedTier(null); setShowCheckout(false); }}>Change Selection</Button>
                  <Button onClick={handleCheckout} className="bg-brand-copper hover:bg-brand-copper/90 text-white">Continue to Checkout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* === TIER COMPARISON MATRIX === */}
      {visibleTiers.length > 1 && (
        <TierComparisonMatrix tiers={visibleTiers} />
      )}

      <FAQSection />

      

    </main>
  );
}