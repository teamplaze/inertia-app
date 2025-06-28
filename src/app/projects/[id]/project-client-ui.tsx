// File: src/app/projects/[id]/project-client-ui.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, Quote, CheckCircle, Eye, MessageSquare, DollarSign, User, Heart, Play } from "lucide-react";
import Image from "next/image";

// We'll create this component in a future step. For now, it's a placeholder.
function BudgetBreakdown() {
  return (
    <section id="budget-breakdown" className="mb-12">
      <h2 className="text-3xl font-bold mb-6" style={{ color: "#64918E" }}>
        Budget Breakdown
      </h2>
      <Card className="rounded-xl" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardContent className="p-6">
          <p className="text-white text-center">Budget breakdown chart component will go here.</p>
        </CardContent>
      </Card>
    </section>
  );
}

// Define the data types to match your API response
type Tier = {
  id: number; name: string; price: number; description: string; perks: string[]; total_slots: number; claimed_slots: number;
};
type Testimonial = {
  id: number; name: string; location: string; profile_image_url: string; moment: string; date: string; story: string; verified: boolean;
};
type Project = {
  id: number; project_title: string; artist_name: string; artist_profile_image_url: string; artist_bio: string; project_image_url: string; current_funding: number; funding_goal: number; backer_count: number; status: string; project_description: string; audio_preview_url: string; artist_message_video_url: string; tiers: Tier[]; testimonials: Testimonial[];
};


export default function ProjectUI({ projectData }: { projectData: Project }) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const fundingPercentage = Math.round((projectData.current_funding / projectData.funding_goal) * 100);
  const selectedTierData = projectData.tiers.find((tier) => tier.id === selectedTier);

  const handleTierSelect = (tierId: number) => {
    setSelectedTier(tierId);
    setShowCheckout(true);
  };

  const handleCheckout = () => {
    alert("Redirecting to checkout for " + selectedTierData?.name + " tier!");
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
            src={projectData.project_image_url || "/placeholder.svg"}
            alt={projectData.project_title}
            width={600}
            height={600}
            className="w-full max-w-md mx-auto aspect-square object-cover rounded-xl shadow-2xl border border-gray-700"
          />
        </div>
        <div className="space-y-6">
          <div>
            <Badge
              variant={projectData.status === "Completed" ? "secondary" : "default"}
              className="mb-4 bg-gray-600 text-white"
            >
              {projectData.status}
            </Badge>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "#64918E" }}>
              {projectData.project_title}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <Image
                src={projectData.artist_profile_image_url || "/placeholder.svg"}
                alt={projectData.artist_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
              />
              <div>
                <p className="font-semibold text-white">{projectData.artist_name}</p>
                <p className="text-sm text-gray-400">{projectData.artist_bio}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold" style={{ color: "#22C55E" }}>
                ${projectData.current_funding.toLocaleString()}
              </span>
              <span className="text-gray-400">of ${projectData.funding_goal.toLocaleString()} goal</span>
            </div>
            <Progress value={fundingPercentage} className="h-3 bg-gray-700" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{fundingPercentage}% funded</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {projectData.backer_count} backers
              </span>
            </div>
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
                <Star className="w-4 h-4 mr-2" /> Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === FROM THE ARTIST SECTION UPDATED === */}
      <section id="from-artist" className="mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#64918E" }}>From the Artist</h2>
        <Card className="rounded-xl" style={gradientCardStyle}>
          <CardContent className="p-6">
            <div className="prose prose-lg max-w-none prose-invert">
                {/* Now using the new dedicated field from the database */}
                {projectData.from_the_artist_message && projectData.from_the_artist_message.split("\n").map((paragraph: string, index: number) => (
    <p key={index} className="mb-4 text-gray-200 leading-relaxed">{paragraph}</p>
))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* === PREVIEWS SECTION UPDATED === */}
      <section id="previews" className="mb-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#64918E" }}>Previews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl" style={regularCardStyle}>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-white">{projectData.artist_name}</h3>
              <div className="aspect-video bg-black rounded-lg">
                {projectData.artist_message_video_url ? (
                  <iframe
                    src={projectData.artist_message_video_url}
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
              <h3 className="font-semibold text-white">Audio Preview</h3>
              <div className="bg-black/40 rounded-lg p-4">
                {projectData.audio_preview_url ? (
                  <audio controls className="w-full">
                    <source src={projectData.audio_preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
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
          {projectData.testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative rounded-xl" style={regularCardStyle}>
              <CardContent className="p-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 opacity-20" style={{ color: "#CB945E" }} />
                <div className="flex items-start gap-4 mb-4">
                  <Image src={testimonial.profile_image_url || "/placeholder.svg"} alt={testimonial.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-gray-400" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-300">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-white leading-relaxed pl-4 border-l-2 border-orange-400/50">{testimonial.story}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <BudgetBreakdown />

      <section id="support-levels" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "#64918E" }}>Choose Your Support Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {projectData.tiers.map((tier) => (
<Card
  key={tier.id}
  className={`flex flex-col relative transition-all duration-200 rounded-xl ${
    selectedTier === tier.id 
      ? "ring-2 ring-offset-2 ring-offset-[#64918E] ring-[#CB945E] shadow-lg" // <-- Ring styles are now classes
      : "hover:shadow-md hover:shadow-gray-700/50"
  }`}
  style={regularCardStyle} // <-- The style is now always the same
>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold" style={{ color: "#CB945E" }}>{tier.name}</CardTitle>
                  {selectedTier === tier.id && <CheckCircle className="w-6 h-6" style={{ color: "#CB945E" }} />}
                </div>
                <div className="text-3xl font-bold text-white">${tier.price}</div>
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
                  <Button onClick={() => handleTierSelect(tier.id)} className={`w-full text-white ${ (tier.total_slots - tier.claimed_slots) === 0 ? "bg-gray-500" : selectedTier === tier.id ? "bg-orange-500 hover:bg-orange-600" : "bg-[#CB945E] hover:bg-[#CB945E]/90"}`} disabled={(tier.total_slots - tier.claimed_slots) === 0}>
                    {(tier.total_slots - tier.claimed_slots) === 0 ? "Sold Out" : selectedTier === tier.id ? "Selected" : "Select Tier"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {showCheckout && selectedTierData && (
        <section className="mb-12">
          <Card className="rounded-xl" style={gradientCardStyle}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to support {projectData.artist_name}?</h3>
                  <p className="text-gray-200">You've selected the <strong className="text-white">{selectedTierData.name}</strong> tier for <strong style={{ color: "#CB945E" }}>${selectedTierData.price}</strong></p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-gray-400 text-gray-200 hover:bg-black/30" onClick={() => { setSelectedTier(null); setShowCheckout(false); }}>Change Selection</Button>
                  <Button onClick={handleCheckout} className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">Continue to Checkout</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <Card className="rounded-xl" style={gradientCardStyle}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Join the Community</h3>
            <p className="text-gray-200 mb-6 max-w-2xl mx-auto">Connect with {projectData.artist_name} and other supporters in our exclusive community. Share your thoughts, get updates, and be part of the creative journey.</p>
            <Button className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">Join the Discussion</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}