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
import { useEffect, useState, FormEvent } from "react"; // 2. Import React hooks
import { Project } from "@/types"; // 3. Import the Project type we just defined

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
          throw new Error('Failed to fetch projects');
        }
        const data: Project[] = await response.json();
        // Update our state with the data from the API
        setProjects(data);
      } catch (error) {
        console.error(error);
        // In a real app, you might set an error state here to show a message
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
      setNewsletterMessage(error.message);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-white text-[#2D3534]">
      {/* The Header section remains the same */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center bg-white/95 backdrop-blur-md border-b">
        <Link href="/" className="flex items-center justify-center font-bold text-lg">
          <Image
            src="/Inertia-Logo-w-tagline.svg"
            alt="Inertia Logo"
            width={120}
            height={60}
          />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">

<Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
  Projects
</Link>
<Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
  How It Works
</Link>
<Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
  FAQ
</Link>
<Button variant="outline" size="sm">
  Login
</Button>
<Button size="sm" className="bg-[#64918E] hover:bg-[#64918E]/90">
  Sign Up
</Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero section remains the same */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#E5E1DC]">
  <div className="container px-4 md:px-6">
    <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
      <div className="flex flex-col items-start space-y-4">
        <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] text-[#2D3534]">
          Invest in the Future of Independent Music
        </h1>
        <p className="mx-auto max-w-[700px] text-[#2D3534]/70 md:text-xl">
          Support artists directly, earn exclusive perks, and become part of the creative journey.
        </p>
        <div className="space-x-4">
          <Button className="bg-[#64918E] hover:bg-[#64918E]/90">🔘 Explore Projects</Button>
          <Button
            variant="outline"
            className="border-[#64918E] text-[#64918E] hover:bg-[#64918E] hover:text-white"
          >
            🔘 How It Works
          </Button>
        </div>
      </div>
      <Image
        src="/hero-image.jpg" // This is just a placeholder, you can replace it later
        width="1536"
        height="1024"
        alt="Hero"
        className="mx-auto aspect-[3/1]rounded-2x1 object-cover shadow-lg"
      />
    </div>
  </div>
</section>

        {/* --- MODIFIED FEATURED PROJECTS SECTION --- */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-[#2D3534] mb-12">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 7. We replace the old static array with our dynamic projects state */}
              {projects.map((project) => {
                // Calculate funding percentage for the progress bar
                const fundedPercent = Math.round((project.current_funding / project.funding_goal) * 100);
                return (
                  <Card key={project.id} className="overflow-hidden">
                    <Image
                      src={project.project_image_url || "/placeholder.svg?height=200&width=350"}
                      width={350}
                      height={200}
                      alt={project.project_title}
                      className="aspect-video object-contain"
                    />
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-semibold tracking-tight text-[#2D3534]">
                        🎤 {project.artist_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#2D3534]/70">🎶 {project.project_title}</CardDescription>
                      <div className="mt-2 text-sm font-medium text-[#64918E]">💰 {fundedPercent}% Funded</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-[#64918E] h-2 rounded-full" style={{ width: `${fundedPercent}%` }}></div>
                      </div>
                      <div className="text-xs text-[#2D3534]/60 mb-2">🕒 {project.status}</div>
                      <div className="text-xs text-[#2D3534]/60 mb-3">⭐ {project.perks_description}</div>
                      <Button size="sm" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90">
                        🔘 View Project <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* PASTE THIS ENTIRE BLOCK after the "Featured Projects" section */}

<section className="w-full py-12 md:py-24 lg:py-32 bg-[#E5E1DC]">
  <div className="container px-4 md:px-6">
    <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-[#2D3534] mb-12">
      How It Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center">
        <BookOpen className="mx-auto h-12 w-12 text-[#64918E] mb-4" />
        <h3 className="text-lg font-semibold text-[#2D3534] mb-2">Browse Projects</h3>
        <p className="text-[#2D3534]/70">Discover active music campaigns.</p>
      </div>
      <div className="text-center">
        <PieChart className="mx-auto h-12 w-12 text-[#64918E] mb-4" />
        <h3 className="text-lg font-semibold text-[#2D3534] mb-2">Reserve Your Seat</h3>
        <p className="text-[#2D3534]/70">Choose your contribution tier.</p>
      </div>
      <div className="text-center">
        <Send className="mx-auto h-12 w-12 text-[#64918E] mb-4" />
        <h3 className="text-lg font-semibold text-[#2D3534] mb-2">Enjoy the Journey</h3>
        <p className="text-[#2D3534]/70">Track progress, unlock perks, earn returns.</p>
      </div>
    </div>
  </div>
</section>

<section className="w-full py-12 md:py-24 lg:py-32">
  <div className="container px-4 md:px-6">
    <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl text-[#2D3534] mb-12">
      Why Inertia?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#2D3534] mb-2">🚫 No Labels, No Debt</h3>
          <p className="text-[#2D3534]/70">Artists stay independent.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#2D3534] mb-2">🎁 Experiential Perks</h3>
          <p className="text-[#2D3534]/70">Real-life fan rewards.</p>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#2D3534] mb-2">💸 Royalties + Memories</h3>
          <p className="text-[#2D3534]/70">Emotional and financial return.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#2D3534] mb-2">🔒 Transparent, Secure Platform</h3>
          <p className="text-[#2D3534]/70">Built with trust and transparency in mind.</p>
        </div>
      </div>
    </div>
    <div className="text-center mt-8">
      <Button variant="outline" className="border-[#64918E] text-[#64918E] hover:bg-[#64918E] hover:text-white">
        About Us
      </Button>
    </div>
  </div>
</section>
      </main>

      {/* --- MODIFIED FOOTER SECTION --- */}
      <footer className="bg-[#2D3534] text-white py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm">&copy; {new Date().getFullYear()} Inertia. All rights reserved.</p>
              <div className="flex gap-4 mt-2">
                <Link href="#" className="text-xs hover:underline underline-offset-4">Terms & Conditions</Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4">Legal Disclosures</Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4">Social Media</Link>
              </div>
            </div>
            {/* 8. Connect the form and input to our state and handler function */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white text-[#2D3534]"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <Button type="submit" className="bg-[#CB945E] hover:bg-[#CB945E]/90">Sign Up</Button>
            </form>
          </div>
          {/* 9. Conditionally display the feedback message */}
          {newsletterMessage && <p className="text-center text-sm mt-4">{newsletterMessage}</p>}
        </div>
      </footer>
    </div>
  )
}