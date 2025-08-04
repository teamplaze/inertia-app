// File: src/app/page.tsx

"use client"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, PieChart, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react"; 
import type { Project } from "@/types"; 

export default function Component() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects/featured');
        if (!response.ok) {
          console.log('API not available, using mock data');
          throw new Error("API not available");
        }
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (error) {
        console.log("Using fallback mock data:", error);
        const mockProjects: Project[] = [
          // ... your mock project data is still here ...
        ];
        setProjects(mockProjects);
      }
    };
    fetchProjects();
  }, []); 

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNewsletterMessage("Subscribing...");
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
      setNewsletterMessage("Thank you for subscribing!");
      setNewsletterEmail("");
    } catch (error: any) {
      setNewsletterMessage((error as Error).message);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const regularCardStyle = {
    backgroundColor: '#64918E',
    border: '2px solid #CB945E',
  };

  const gradientCardStyle = {
    background: 'linear-gradient(180deg, #64918E 0%, #000000 100%)',
    border: '2px solid #CB945E',
  };

  return (
    // The main Header and outer div are gone, provided by layout.tsx
    <main className="flex-1">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32" style={{ backgroundColor: '#64918E' }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col items-start space-y-4">
              <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-white">
                Invest in the Future of Independent Music
              </h1>
              <p className="mx-auto max-w-[700px] text-white/80 md:text-xl">
                Support artists directly, earn exclusive perks, and become part of the creative journey.
              </p>
              <div className="space-x-4">
                <Button onClick={() => scrollToSection('featured-projects')} className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                  Explore Projects
                </Button>
                <Button onClick={() => scrollToSection('how-it-works')} className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                  How It Works
                </Button>
              </div>
            </div>
            {/*<Image
              src="/hero-image.jpg"
              width="1536"
              height="1024"
              alt="Hero"
              className="mx-auto aspect-[3/1] rounded-2xl object-cover shadow-lg border border-gray-600"
            />*/}
          </div>
        </div>
      </section>

      {/* Featured Projects section */}
      <section id="featured-projects" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-white mb-12">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const fundedPercent = Math.round((project.current_funding / project.funding_goal) * 100);
              return (
                <Card key={project.id} className="overflow-hidden rounded-xl" style={regularCardStyle}>
                  <Image
                    src={project.project_image_url || '/placeholder.svg?height=200&width=350'}
                    width={350}
                    height={200}
                    alt={project.project_title}
                    className="aspect-video object-contain w-full h-48"
                  />
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold tracking-tight text-white">
                      🎤 {project.artist_name}
                    </CardTitle>
                    <CardDescription className="text-sm text-white/80">🎶 {project.project_title}</CardDescription>
                    <div className="mt-2 text-sm font-medium text-[#CB945E]">💰 {fundedPercent}% Funded</div>
                    <div className="w-full bg-black/30 rounded-full h-2 mb-2">
                      <div className="bg-[#CB945E] h-2 rounded-full" style={{ width: `${fundedPercent}%` }}></div>
                    </div>
                    <div className="text-xs text-white/70 mb-2">🕒 {project.status}</div>
                    <div className="text-xs text-white/70 mb-3 truncate">⭐ {project.artist_bio}</div>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                        View Project <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works section */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32" style={{ backgroundColor: '#64918E' }}>
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center rounded-xl" style={gradientCardStyle}>
              <CardContent className="p-6">
                <BookOpen className="mx-auto h-12 w-12 text-[#CB945E] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Browse Projects</h3>
                <p className="text-white/80">Discover active music campaigns.</p>
              </CardContent>
            </Card>
            <Card className="text-center rounded-xl" style={gradientCardStyle}>
              <CardContent className="p-6">
                <PieChart className="mx-auto h-12 w-12 text-[#CB945E] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Reserve Your Seat</h3>
                <p className="text-white/80">Choose your contribution tier.</p>
              </CardContent>
            </Card>
            <Card className="text-center rounded-xl" style={gradientCardStyle}>
              <CardContent className="p-6">
                <Send className="mx-auto h-12 w-12 text-[#CB945E] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Enjoy the Journey</h3>
                <p className="text-white/80">Track progress, unlock perks, earn returns.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Inertia section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-white mb-12">
            Why Inertia?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🚫 No Labels, No Debt</h3>
                <p className="text-white/70">Artists stay independent.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🎁 Experiential Perks</h3>
                <p className="text-white/70">Real-life fan rewards.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">💸 Royalties + Memories</h3>
                <p className="text-white/70">Emotional and financial return.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🔒 Transparent, Secure Platform</h3>
                <p className="text-white/70">Built with trust and transparency in mind.</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-[#64918E] text-[#64918E] hover:bg-[#64918E]/20 hover:text-[#64918E] hover:border-[#64918E]"
            >
              About Us
            </Button>
          </div>
        </div>
      </section>
      {/* The form is now part of the shared footer, so we can remove it from here */}
    </main>
    // The main Footer is also gone, provided by layout.tsx
  );
}