// src/app/page.tsx

"use client"; // 1. IMPORTANT: Add this at the very top.
              // This tells Next.js to treat this as a Client Component,
              // which allows us to use hooks like useState and useEffect for interactivity.

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, PieChart, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react"; // 2. Import React hooks
import type { Project } from "@/types"; // 3. Import the Project type we just defined

export default function Component() {
  // 4. Create "state variables" to hold our data
  // projects will hold the list of featured projects from our API
  const [projects, setProjects] = useState<Project[]>([]);
  // newsletterEmail will hold the text typed into the footer input
  const [newsletterEmail, setNewsletterEmail] = useState("");
  // newsletterMessage will hold feedback for the user (e.g., "Success!" or "Error!")
  const [newsletterMessage, setNewsletterMessage] = useState("");


  // 5. Use the useEffect hook to fetch data when the component loads
  useEffect(() => {
    // Define an async function to get the project data
    const fetchProjects = async () => {
      try {
        // Call the API route we created in Part 2
        const response = await fetch('/api/projects/featured');
        if (!response.ok) {
          // If API fails, go directly to fallback data instead of throwing
          console.log('API not available, using mock data');
          throw new Error("API not available");
        }
        const data: Project[] = await response.json();
        // Update our state with the data from the API
        setProjects(data);
      } catch (error) {
        console.log("Using fallback mock data:", error);
        // Provide fallback mock data when API fails
        const mockProjects: Project[] = [
          {
            id: 1,
            artist_name: "Luna Rodriguez",
            project_title: "Midnight Echoes",
            project_image_url: "/album-art-1.jpg",
            current_funding: 18500,
            funding_goal: 25000,
            status: "Live",
            perks_description: "Vinyl, digital download, concert tickets",
          },
          {
            id: 2,
            artist_name: "The Velvet Storms",
            project_title: "Electric Dreams",
            project_image_url: "/album-art-2.jpg",
            current_funding: 12300,
            funding_goal: 20000,
            status: "Live",
            perks_description: "Signed merchandise, backstage access",
          },
          {
            id: 3,
            artist_name: "Maya Chen",
            project_title: "Acoustic Journeys",
            project_image_url: "/album-art-3.jpg",
            current_funding: 8750,
            funding_goal: 15000,
            status: "Live",
            perks_description: "Private acoustic session, handwritten lyrics",
          },
        ];
        setProjects(mockProjects);
      }
    };

    fetchProjects(); // Run the function
  }, []); // The empty array [] means this effect runs only once when the component mounts

  // 6. Create a function to handle the newsletter form submission
  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    setNewsletterMessage("Subscribing...");

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from our API if it exists
        throw new Error(result.error || 'Something went wrong');
      }

      setNewsletterMessage("Thank you for subscribing!");
      setNewsletterEmail(""); // Clear the input field on success
    } catch (error: any) {
      setNewsletterMessage((error as Error).message);
    }
  };

  // Scroll function matching the projects page
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Card styling to match projects page
  const regularCardStyle = {
    backgroundColor: '#64918E',
    border: '2px solid #CB945E',
  };

  const gradientCardStyle = {
    background: 'linear-gradient(180deg, #64918E 0%, #000000 100%)',
    border: '2px solid #CB945E',
  };

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: '#2D3534' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center backdrop-blur-md border-b border-gray-700"
        style={{ backgroundColor: 'rgba(45, 53, 52, 0.95)' }}
      >
        <Link href="/" className="flex items-center justify-center font-bold text-lg">
          <Image src="/Inertia-Logo-w-tagline.svg" alt="Inertia Logo" width={120} height={60} />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="/projects/1"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white"
          >
            Projects
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white"
          >
            FAQ
          </Link>
          <Button variant="outline" size="sm" className="border-gray-400 text-gray-200 hover:bg-gray-600">
            Login
          </Button>
          <Button size="sm" className="bg-[#64918E] hover:bg-[#64918E]/90">
            Sign Up
          </Button>
        </nav>
      </header>

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
                  <Button
                    onClick={() => scrollToSection('featured-projects')}
                    className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white"
                  >
                    🔘 Explore Projects
                  </Button>
                  <Button
                    onClick={() => scrollToSection('how-it-works')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#64918E]"
                  >
                    🔘 How It Works
                  </Button>
                </div>
              </div>
              <Image
                src="/hero-image.jpg"
                width="1536"
                height="1024"
                alt="Hero"
                className="mx-auto aspect-[3/1] rounded-2xl object-cover shadow-lg border border-gray-600" // Fixed the missing space here
              />
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
                      className="aspect-video object-contain"
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
                      <div className="text-xs text-white/70 mb-3">⭐ {project.perks_description}</div>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                          🔘 View Project <ArrowRight className="ml-2 h-4 w-4" />
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
      </main>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#2D3534', borderTop: '1px solid #64918E' }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm text-white">&copy; {new Date().getFullYear()} Inertia. All rights reserved.</p>
              <div className="flex gap-4 mt-2">
                <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-300 hover:text-white">
                  Terms & Conditions
                </Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-300 hover:text-white">
                  Legal Disclosures
                </Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-300 hover:text-white">
                  Social Media
                </Link>
              </div>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-gray-600 text-white placeholder:text-gray-400"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <Button type="submit" className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                Sign Up
              </Button>
            </form>
          </div>
          {newsletterMessage && <p className="text-center text-sm mt-4 text-white">{newsletterMessage}</p>}
        </div>
      </footer>
    </div>
  )
}