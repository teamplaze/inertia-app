// File: src/app/projects/[id]/project-client-ui.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Quote, Heart, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Project, Tier } from "@/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import FAQSection from '@/components/project/FAQSection';
import { TierCard } from "@/components/project/TierCard";
import { MilestonesList } from '@/components/project/MilestonesList'
import { PerksSection } from '@/components/project/PerksSection'
import { ProgressBar } from '@/components/project/ProgressBar'
import { ProjectHero } from '@/components/project/ProjectHero'
import { BRAND } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { regularCardStyle, gradientCardStyle } from "@/lib/cardStyles";

// Set to true to restore the Previews section (audio/video previews)
const PREVIEWS_ENABLED = false;

// Check if payments are enabled via environment variable
const paymentsEnabled = (() => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return true;
  return process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
})();

interface ProjectUIProps {
  projectData: Project;
  isProjectMember: boolean;
}


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

  const activeTier = tiers.find(t => t.status === 'active');

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
    <>
      <ProjectHero
        artistName={project.artist_name}
        projectTitle={project.status}
        description={project.project_title}
        artistImageUrl={project.project_image_url ?? ''}
        currentFunding={project.current_funding}
        fundingGoal={project.funding_goal}
        fundingPercentage={fundingPercentage}
        percentFunded={fundingPercentage}
        backerCount={project.backer_count ?? 0}
        showProjectResults={isProjectMember}
        projectResultsHref={`/artist/dashboard?projectId=${project.id}`}
        onSupportClick={() => scrollToSection('support-levels')}
        style={{
          '--color-project-accent': project.project_colors?.[0] ?? '#e18d46',
        } as React.CSSProperties}
      />
      <main
        className="container mx-auto px-4 py-8 max-w-6xl"
        style={{
          '--color-project-accent': project.project_colors?.[0] ?? '#e18d46',
        } as React.CSSProperties}
      >
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

      {project.project_milestones && project.project_milestones.length > 0 && (
        <section id="milestones" className="mb-12">
          <div className="flex flex-col gap-[var(--spacing-4)] mb-[var(--spacing-8)] md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className={cn(
                "font-heading font-medium",
                "text-[length:--font-size-h2]",
                "leading-[1.2] text-white"
              )}>
                Fundraising milestones
              </h2>
              <p className={cn(
                "font-body font-normal mt-2",
                "text-[length:--font-size-body-base]",
                "leading-[1.5] text-[--color-text-300]"
              )}>
                Unlock our budget milestones by contributing to the project!
              </p>
            </div>
            <button
              onClick={() => scrollToSection('support-levels')}
              className={cn(
                "flex items-center justify-center",
                "bg-transparent text-white",
                "font-heading font-medium",
                "text-[length:--font-size-btn-small]",
                "leading-[1.2] tracking-normal",
                "px-[var(--spacing-5)] py-[var(--spacing-3)]",
                "rounded-none",
                "border-2 border-white",
                "w-full md:w-auto",
                "transition-colors duration-150",
                "hover:border-[var(--color-project-accent,var(--color-bg-teal))]",
                "hover:text-[var(--color-project-accent,var(--color-bg-teal))]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[--color-border-focus]",
              )}
            >
              Support {project.artist_name}
            </button>
          </div>

          <ProgressBar
            value={fundingPercentage}
            amountRaised={`$${project.current_funding.toLocaleString()}`}
            goal={`of $${project.funding_goal.toLocaleString()}`}
            percentFunded={fundingPercentage}
            backerCount={project.backer_count ?? 0}
            showDetails={true}
            className="mb-[var(--spacing-8)]"
          />
          <MilestonesList
            milestones={project.project_milestones}
            currentFunding={project.current_funding}
          />
        </section>
      )}

      {/* === PREVIEWS SECTION === */}
      {PREVIEWS_ENABLED && (
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
      )}

      <section id="support-levels" className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND.teal }}>Choose Your Support Level</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">Every tier helps bring this project to life — higher levels unlock deeper access, rarer moments, and more personal connection with the band.</p>
        </div>
        {/* Single active tier + donate card — always 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
          {activeTier && (
            <TierCard
              tier={activeTier}
              project={project}
              selectedTier={selectedTier}
              user={user}
              paymentsEnabled={paymentsEnabled}
              showCheckout={showCheckout}
              onSelectTier={handleTierSelect}
              onCheckout={handleCheckout}
              onCancelCheckout={() => { setSelectedTier(null); setShowCheckout(false); }}
            />
          )}

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

      {project.testimonials && project.testimonials.length > 0 && (
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
      )}

      {tiers && tiers.length > 0 && (
        <section id="perks" className="mb-12">
          <PerksSection
            tiers={tiers}
            artistName={project.artist_name}
            onSupportClick={() => scrollToSection('support-levels')}
            hasRoyalties={project.has_royalties}
          />
        </section>
      )}

      <FAQSection />

      

    </main>
    </>
  );
}