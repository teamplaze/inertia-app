// File: src/app/projects/[id]/project-client-ui.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import type { Project, Tier } from "@/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import FAQSection from '@/components/project/FAQSection';
import { WaveCard } from '@/components/project/WaveCard'
import { DonateCard } from '@/components/project/DonateCard';
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
  
  // New state for expandable fan stories
  const [showAllStories, setShowAllStories] = useState(false);

  const [artistNoteOpen, setArtistNoteOpen] = useState(false);

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

  const handleDonate = async (amount: number, coverFee: boolean) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          donationAmount: amount,
          coverFee,
        }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (err) {
      console.error('Donation error:', err)
    }
  };

  const handlePurchase = async (tierId: number) => {
    if (!stripePromise) return
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId,
          projectId: project.id,
        }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (err) {
      console.error('Checkout error:', err)
    }
  };

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
      <section
        id="about"
        className={cn(
          "w-full flex flex-col items-center",
          "px-[var(--spacing-5)] py-[var(--spacing-12)]",
          "gap-[var(--spacing-6)]",
          "md:px-[96px] md:py-[120px]",
          "md:gap-[var(--spacing-8)]",
        )}
        style={{ background: '#000000' }}
      >
        {/* Content block — heading + bio */}
        <div
          className={cn(
            "flex flex-col items-start",
            "w-full md:w-[822px]",
            "gap-[var(--spacing-3)] md:gap-[var(--spacing-4)]",
          )}
        >
          <h2
            className={cn(
              "font-heading font-medium leading-[1.2]",
              "tracking-normal",
              "text-white w-full",
              "text-[20px] md:text-[length:--font-size-h4]",
            )}
          >
            About
          </h2>

          {project.artist_bio && (
            <p
              className={cn(
                "font-body font-normal",
                "text-[20px] leading-[1.5]",
                "tracking-normal",
                "text-[--color-text-200]",
                "w-full",
              )}
            >
              {project.artist_bio}
            </p>
          )}
        </div>

        {/* "A note from {Artist}" accordion */}
        {project.from_the_artist_message && (
          <div
            className={cn(
              "w-full md:w-[822px]",
              "flex flex-col items-start",
              "rounded-[12px]",
              "border border-[--color-border-soft]",
              "overflow-hidden",
            )}
            style={{ background: 'var(--color-bg-200, #0f1111)' }}
          >
            <button
              onClick={() => setArtistNoteOpen(!artistNoteOpen)}
              className={cn(
                "flex items-center w-full",
                "gap-[var(--spacing-3)] md:gap-[var(--spacing-4)]",
                "p-[var(--spacing-4)] md:p-[var(--spacing-5)]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[--color-border-focus]",
                "focus-visible:ring-inset",
              )}
              aria-expanded={artistNoteOpen}
            >
              <span
                className={cn(
                  "font-heading font-medium leading-[1.2]",
                  "tracking-normal text-white",
                  "flex-[1_0_0] min-w-px text-left",
                  "text-[16px] md:text-[length:--font-size-h6]",
                )}
              >
                A note from {project.artist_name}
              </span>
              <span
                className="material-symbols-rounded text-[24px] leading-none text-white shrink-0"
                aria-hidden="true"
              >
                {artistNoteOpen ? 'close' : 'add'}
              </span>
            </button>

            {artistNoteOpen && (
              <div
                className={cn(
                  "w-full",
                  "px-[var(--spacing-4)] pb-[var(--spacing-4)]",
                  "md:px-[var(--spacing-5)] md:pb-[var(--spacing-5)]",
                )}
              >
                <div
                  className="w-full border-t mb-[var(--spacing-4)]"
                  style={{ borderColor: 'var(--color-border-soft)' }}
                />
                <p
                  className={cn(
                    "font-body font-normal",
                    "text-[length:--font-size-body-base]",
                    "leading-[1.5] tracking-normal",
                    "text-[--color-text-200]",
                  )}
                >
                  {project.from_the_artist_message}
                </p>
              </div>
            )}
          </div>
        )}
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

      {(() => {
        const waveCard = tiers.find(
          t => t.status === 'active' || t.status === 'closed'
        )
        if (!waveCard) return null

        return (
          <section
            id="support-levels"
            className="flex flex-col items-center px-[20px] py-[96px] md:px-[96px] md:py-[96px] gap-[var(--spacing-10)]"
            style={{ background: '#000000' }}
          >
            {/* Section header */}
            <div className="flex flex-col items-center gap-[var(--spacing-3)] text-center">
              <h4
                className="font-heading font-medium leading-[1.2] text-white"
                style={{ fontSize: 'var(--font-size-h4)' }}
              >
                Support {project.artist_name}
              </h4>
              <p className="font-body font-normal text-[20px] leading-[1.5] text-[--wave-text-muted]">
                100% of your contributions go to the artist&apos;s project.
              </p>
            </div>

            {/* Cards */}
            <div
              className={cn(
                'grid grid-cols-1 md:grid-cols-2',
                'gap-[var(--spacing-6)]',
                'items-stretch',
                'w-full max-w-[1034px]',
              )}
            >
              <WaveCard
                tier={waveCard}
                project={project}
                user={user}
                paymentsEnabled={paymentsEnabled}
                onPurchase={handlePurchase}
              />
              <DonateCard project={project} onDonate={handleDonate} />
            </div>
          </section>
        )
      })()}

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