"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/types";
import { BG } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { ArtistCard } from "@/components/ui/cards/artist-card";

const HERO_IMAGE = '/images/hero-recording-studio.png';
const STUDIO_IMAGE = '/images/front-row-seat-studio.png';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsIndex, setProjectsIndex] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/featured');
        if (!response.ok) throw new Error("API not available");
        const data: Project[] = await response.json();
        setProjects(data);
      } catch {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: '700px' }}
      >
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: BG.imageBackground }} />
        <div className="relative z-10 flex flex-col items-center gap-[32px] max-w-[1034px] mx-auto px-[var(--spacing-5)] md:px-0 text-center pt-[80px] pb-[48px] md:pt-[120px] md:pb-[120px]">
          <h1 className="font-heading font-medium leading-[1.2] text-[48px] md:text-[80px] text-white">
            Fuel the music. Join the inner circle.
          </h1>
          <p className="font-body font-normal leading-[1.5] text-[18px] md:text-[20px] text-white">
            Back independent artists to fund their next release. Claim exclusive VIP perks, build direct relationships with the band, and earn a bonus share of their streaming royalties as the project grows.
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section
        id="featured-projects"
        className="w-full px-[var(--spacing-5)] md:px-[96px] py-[var(--spacing-12)] md:py-[120px] flex flex-col gap-[64px] items-center"
        style={{ background: BG.tealSpotlightTop }}
      >
        <h2 className="font-heading font-medium leading-[1.2] text-[32px] md:text-[48px] text-white text-center">
          Live campaigns. Limited seats.
        </h2>
        {projects.length > 0 && (
          <div className="flex flex-col gap-[var(--spacing-8)] w-full">

            {/* MOBILE — single card, full width, percentage-based slide */}
            <div className="block md:hidden w-full overflow-hidden">
              <div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${projectsIndex * 100}%)` }}
              >
                {projects.map((project) => (
                  <div key={project.id} style={{ minWidth: '100%' }}>
                    <Link href={`/${project.slug}`}>
                      <ArtistCard
                        artistName={project.artist_name}
                        imageSrc={project.project_image_url ?? ''}
                        imageAlt={project.artist_name}
                        tag={project.status?.toUpperCase() ?? ''}
                        className="w-full min-h-[395px]"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOP — 3 states based on count */}
            <div className="hidden md:block w-full">
              {projects.length >= 4 ? (
                /* Carousel — 4+ projects */
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300"
                    style={{
                      gap: '32px',
                      transform: `translateX(calc(-${projectsIndex * 400}px - ${projectsIndex * 32}px))`,
                    }}
                  >
                    {projects.map((project) => (
                      <div key={project.id} className="shrink-0">
                        <Link href={`/${project.slug}`}>
                          <ArtistCard
                            artistName={project.artist_name}
                            imageSrc={project.project_image_url ?? ''}
                            imageAlt={project.artist_name}
                            tag={project.status?.toUpperCase() ?? ''}
                            className="w-[400px] min-h-[395px]"
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Static grid — 1–3 projects */
                <div
                  className="flex flex-row items-stretch"
                  style={{ gap: '32px' }}
                >
                  {projects.map((project) => (
                    <Link key={project.id} href={`/${project.slug}`} className="flex-1 min-w-0">
                      <ArtistCard
                        artistName={project.artist_name}
                        imageSrc={project.project_image_url ?? ''}
                        imageAlt={project.artist_name}
                        tag={project.status?.toUpperCase() ?? ''}
                        className="w-full min-h-[395px]"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Carousel controls — mobile always, desktop only when 4+ projects */}
            <div className={cn(projects.length < 4 ? "md:hidden" : "")}>
              <CarouselControls
                count={projects.length}
                activeIndex={projectsIndex}
                onDotClick={(i) => setProjectsIndex(i)}
                onPrev={() => setProjectsIndex(Math.max(0, projectsIndex - 1))}
                onNext={() => setProjectsIndex(Math.min(projects.length - 1, projectsIndex + 1))}
              />
            </div>

          </div>
        )}
      </section>

      {/* Text + Image */}
      <section className="w-full bg-black px-[var(--spacing-5)] md:px-[96px] py-[var(--spacing-12)] md:py-[120px]">
        <div className="flex flex-col md:flex-row gap-[48px] items-center w-full">
          <div className="flex flex-1 flex-col gap-[32px] min-w-0">
            <h2 className="font-heading font-medium leading-[1.2] text-[32px] md:text-[48px] text-white">
              Sit front row with your favorite artist
            </h2>
            <div className="flex flex-col">
              {[
                { icon: 'rocket', title: 'Launch', desc: 'Fans join the inner circle' },
                { icon: 'music_note', title: 'Create', desc: 'Fans join the creative process' },
                { icon: 'star', title: 'Release', desc: 'Long term bonds are formed & royalties accrue' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-[20px] items-center py-[20px]">
                  <div className="flex items-center justify-center rounded-full p-[12px] shrink-0 bg-brand-teal">
                    <span className="material-symbols-rounded text-[24px] text-black leading-none">{icon}</span>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-heading font-medium leading-[1.2] text-[18px] text-white">{title}</p>
                    <p className="font-body font-normal leading-[1.5] text-[18px] text-white/90">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 h-[400px] md:h-[600px] relative rounded-xl overflow-hidden w-full min-w-0">
            <img
              src={STUDIO_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover object-bottom"
            />
            <div className="absolute inset-0" style={{ background: BG.imageBackground }} />
          </div>
        </div>
      </section>

      {/* Fandom hits different with Inertia */}
      <section className="w-full bg-black px-[var(--spacing-5)] md:px-[203px] py-[var(--spacing-12)] md:py-[120px] flex flex-col gap-[48px] items-center overflow-hidden">
        <h2 className="font-heading font-medium leading-[1.2] text-[32px] md:text-[48px] text-white text-center max-w-[822px]">
          Fandom hits different with Inertia
        </h2>
        <div className="flex flex-col md:flex-row gap-[32px] items-start w-full max-w-[1034px]">
          <div
            className="flex-1 flex flex-col gap-[32px] rounded-xl px-[20px] py-[32px]"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border-accent)' }}
          >
            <h3 className="font-heading font-medium leading-[1.2] text-[32px] text-white">
              The Inertia fan experience
            </h3>
            <div className="flex flex-col gap-[16px]">
              <p className="font-body font-semibold leading-[1.5] text-[18px]" style={{ color: 'var(--card-text-secondary)' }}>
                WHAT YOU GET
              </p>
              {[
                'You build exclusive communities directly with your favorite artists.',
                'You fund the album, and the artist retains their intellectual property.',
                "You earn streaming royalties and a share in the project's financial success.",
              ].map((item) => (
                <div key={item} className="flex gap-[8px] items-start">
                  <span className="material-symbols-rounded text-[24px] leading-[1.2] shrink-0 text-brand-teal">star</span>
                  <p className="font-body font-normal leading-[1.5] text-[20px] text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="flex-1 flex flex-col gap-[32px] rounded-xl px-[20px] py-[32px] self-stretch"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border-default)' }}
          >
            <h3 className="font-heading font-medium leading-[1.2] text-[32px] text-white">
              The traditional fan experience
            </h3>
            <div className="flex flex-col gap-[16px]">
              <p className="font-body font-semibold leading-[1.5] text-[18px]" style={{ color: 'var(--card-text-secondary)' }}>
                WHAT YOU GET
              </p>
              {[
                'You buy the album, but the record label keeps the majority of the profits.',
                'You hope for a backstage pass or a brief meet-and-greet.',
                'Your support ends at the merch table.',
              ].map((item) => (
                <div key={item} className="flex gap-[8px] items-start">
                  <span className="material-symbols-rounded text-[24px] leading-[1.2] shrink-0 text-white/50">check</span>
                  <p className="font-body font-normal leading-[1.5] text-[20px]" style={{ color: 'var(--card-text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
