// File: src/app/projects/[id]/project-client-ui.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, Quote, CheckCircle, Eye, MessageSquare, DollarSign, User, LayoutDashboard, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import type { Project, Tier } from "@/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import FAQSection from '@/components/project/FAQSection'; // Import the FAQ Component

// Check if payments are enabled via environment variable
const paymentsEnabled = (() => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return true;
  return process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
})();

const DONATION_LINK = "https://donate.stripe.com/test_fZu3cx9gD5ji6zve5g28800";

interface ProjectUIProps {
  projectData: Project;
  isProjectMember: boolean;
}

// Helper to get tier subtitle
const getTierSubtitle = (name: string) => {
  const n = name.toUpperCase();
  if (n.includes("GA")) return "For fans who want to be part of the journey and the fun";
  if (n.includes("PIT")) return "For fans who want deeper access and real conversations";
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

  const getDonationUrl = () => {
    // Priority: Project-specific link (DB field) only. No env var fallback.
    const link = project.donation_link;
    
    if (!link) return null;

    if (user && user.email) {
        return `${link}?prefilled_email=${encodeURIComponent(user.email)}`;
    }
    return link;
  };

  const donationUrl = getDonationUrl();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const gradientCardStyle = {
    background: "linear-gradient(180deg, #64918E 0%, #000000 100%)",
    border: "2px solid #CB945E",
  };

  const regularCardStyle = {
    backgroundColor: "#64918E",
    border: "2px solid #CB945E",
  };

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
                    <Button className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Project Results
                    </Button>
                </Link>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-2" style={{ color: "#64918E" }}>
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
              <span className="text-2xl font-bold" style={{ color: "#22C55E" }}>
                ${project.current_funding.toLocaleString()}
              </span>
              <span className="text-gray-400">of ${project.funding_goal.toLocaleString()} goal</span>
            </div>
            <Progress value={fundingPercentage} className="h-3 bg-gray-700" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{fundingPercentage}% funded</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.backer_count} backers
              </span>
            </div>

            <Button
              onClick={() => scrollToSection("support-levels")}
              className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white text-lg font-bold py-6 animate-pulse"
            >
              Buy Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
              <Button onClick={() => scrollToSection("from-artist")} size="sm" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                <User className="w-4 h-4 mr-2" /> From Artist
              </Button>
              <Button onClick={() => scrollToSection("previews")} size="sm" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                <Eye className="w-4 h-4 mr-2" /> Previews
              </Button>
              <Button onClick={() => scrollToSection("fan-stories")} size="sm" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                <MessageSquare className="w-4 h-4 mr-2" /> Fan Stories
              </Button>
              <Button onClick={() => scrollToSection("budget-breakdown")} size="sm" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                <DollarSign className="w-4 h-4 mr-2" /> Budget
              </Button>
              <Button onClick={() => scrollToSection("support-levels")} size="sm" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                <Star className="w-4 h-4 mr-2" /> Perks
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === FROM THE ARTIST SECTION === */}
      <section id="from-artist" className="mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#64918E" }}>From the Artist</h2>
        <Card className="rounded-xl" style={gradientCardStyle}>
          <CardContent className="p-6">
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
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#64918E" }}>Previews</h2>
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
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "#64918E" }}>Fan Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative rounded-xl" style={regularCardStyle}>
              <CardContent className="p-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 opacity-20" style={{ color: "#CB945E" }} />
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
                <div className="text-right text-gray-300 italic mt-4">
                  — {testimonial.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <BudgetBreakdown categories={project.budget_categories} />

      <section id="support-levels" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#64918E" }}>Choose Your Support Level</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">Every tier helps bring this project to life — higher levels unlock deeper access, rarer moments, and more personal connection with the band.</p>
        </div>
        {/* Adjusted grid logic: 3 columns by default, 4 columns ONLY if donationUrl exists */}
        <div className={`grid grid-cols-1 md:grid-cols-3 ${donationUrl ? 'xl:grid-cols-4' : ''} gap-6 items-stretch`}>
          {tiers.sort((a, b) => a.price - b.price).map((tier) => (
            <div key={tier.id} className="flex flex-col gap-4">
              <Card
                className={`flex flex-col relative transition-all duration-200 rounded-xl h-full ${
                  selectedTier === tier.id 
                    ? "ring-2 ring-offset-2 ring-offset-[#64918E] ring-[#CB945E] shadow-lg"
                    : "hover:shadow-md hover:shadow-gray-700/50"
                }`}
                style={regularCardStyle}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold" style={{ color: "#CB945E" }}>{tier.name}</CardTitle>
                      <p className="text-xs text-white/90 font-medium italic">{getTierSubtitle(tier.name)}</p>
                    </div>
                    {selectedTier === tier.id && <CheckCircle className="w-6 h-6" style={{ color: "#CB945E" }} />}
                  </div>
                  <div className="text-3xl font-bold text-white mt-2">${tier.price}</div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2">
                    {tier.perks.map((perk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "#CB945E" }} />
                        <span className="text-sm text-white">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-sm text-center text-white/80 mb-2">{tier.total_slots - tier.claimed_slots} of {tier.total_slots} left</div>
                    
                    {paymentsEnabled ? (
                      user ? (
                        <Button 
                          onClick={() => handleTierSelect(tier.id)} 
                          className={`w-full text-white ${ (tier.total_slots - tier.claimed_slots) === 0 ? "bg-gray-500" : selectedTier === tier.id ? "bg-[#4A6B68] hover:bg-[#4A6B68]/90" : "bg-[#CB945E] hover:bg-[#CB945E]/90"}`} 
                          disabled={(tier.total_slots - tier.claimed_slots) === 0}
                        >
                          {(tier.total_slots - tier.claimed_slots) === 0 ? "Sold Out" : selectedTier === tier.id ? "Selected" : "Select Tier"}
                        </Button>
                      ) : (
                        <Link href={`/sign-up?action=checkout&projectId=${project.id}&tierId=${tier.id}`}>
                        <Button className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                          Sign up/Login to contribute
                        </Button>
                      </Link>
                      )
                    ) : (
                      <div className="w-full bg-[#CB945E] text-white text-center cursor-not-allowed opacity-60 hover:bg-[#CB945E] rounded-md px-4 py-2 font-medium text-sm">
                        Coming Soon
                      </div>
                    )}
                    
                  </div>
                </CardContent>
              </Card>

              {/* INLINE CHECKOUT BOX: Visible only on MOBILE (< md) */}
              {paymentsEnabled && showCheckout && selectedTier === tier.id && (
                <div className="md:hidden"> {/* Only show this block on mobile */}
                    <Card className="rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-[#CB945E] shadow-xl" style={gradientCardStyle}>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Ready to support?</h3>
                            <p className="text-sm text-gray-200 leading-snug">
                            You've selected the <strong className="text-white">{tier.name}</strong> tier for <strong style={{ color: "#CB945E" }}>${tier.price}</strong>
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={handleCheckout} className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white font-semibold">
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
          ))}

          {/* === DONATION CARD === */}
          {donationUrl && (
            <div className="flex flex-col gap-4">
               <Card
                  className="flex flex-col relative transition-all duration-200 rounded-xl h-full hover:shadow-md hover:shadow-gray-700/50"
                  style={regularCardStyle}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold" style={{ color: "#CB945E" }}>Donate</CardTitle>
                        <p className="text-xs text-white/90 font-medium italic">Support the project directly without the perks</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">Any Amount</div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2">
                       <li className="flex items-start gap-2">
                         <Heart className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "#CB945E" }} />
                         <span className="text-sm text-white">Help us reach our goal faster</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <Heart className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: "#CB945E" }} />
                         <span className="text-sm text-white">Every bit counts</span>
                       </li>
                    </ul>
                    <div className="pt-4 border-t border-white/20">
                    <div className="text-sm text-center text-white/80 mb-2"> Unlimited Love</div>
                       {paymentsEnabled ? (
                           <a 
                             href={donationUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="block w-full"
                           >
                             <Button className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                                Donate Now
                             </Button>
                           </a>
                       ) : (
                         <div className="w-full bg-[#CB945E] text-white text-center cursor-not-allowed opacity-60 hover:bg-[#CB945E] rounded-md px-4 py-2 font-medium text-sm">
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
                  <p className="text-gray-200">You've selected the <strong className="text-white">{selectedTierData.name}</strong> tier for <strong style={{ color: "#CB945E" }}>${selectedTierData.price}</strong></p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-gray-400 text-gray-200 bg-transparent hover:bg-black/30 hover:text-gray-200" onClick={() => { setSelectedTier(null); setShowCheckout(false); }}>Change Selection</Button>
                  <Button onClick={handleCheckout} className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">Continue to Checkout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <FAQSection />

    </main>
  );
}