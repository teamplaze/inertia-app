// File: src/app/network/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NetworkPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // State for each form field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [socials, setSocials] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [genre, setGenre] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName, lastName, email, phone, companyName,
            specialty, contactMethod, socials, portfolio, genre
        })
    });

    if (response.ok) {
        setMessage("Thank you for joining our network!");
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCompanyName('');
        setSpecialty('');
        setContactMethod('');
        setSocials('');
        setPortfolio('');
        setGenre('');
    } else {
        const errorData = await response.json();
        setError(`Submission failed: ${errorData.details || 'Please try again.'}`);
    }
    
    setIsLoading(false);
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 md:py-24">
      <Card className="mx-auto max-w-3xl w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-white">Join Our Network</CardTitle>
          <CardDescription className="text-white pt-2 px-4">
            This form will ask a few simple questions that will allow you to be listed in network with the Inertia Project. By completing these questions, you will become visible to interested artists in your area of specialty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="font-medium text-gray-200">First Name (required)</Label>
                <Input id="first-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="font-medium text-gray-200">Last Name (required)</Label>
                <Input id="last-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-gray-200">Email (required)</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-gray-200">Phone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company" className="font-medium text-gray-200">Company Name</Label>
                    <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="font-medium text-gray-200">What type of work do you specialize in? (required)</Label>
              <Select required onValueChange={setSpecialty}>
                <SelectTrigger className="justify-start text-white data-[state=open]:text-white transition-colors focus:ring-0 focus:border-[#CB945E] [&>span]:text-white/70 data-[placeholder]:text-white/70">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D3534] text-white border-gray-700">
                <SelectItem value="graphic-design">Graphic Design</SelectItem>
                  <SelectItem value="video-photo">Videography/Photography</SelectItem>
                  <SelectItem value="publicity">Publicity</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="social-branding">Social Media/Branding</SelectItem>
                  <SelectItem value="engineering-producing">Studio Engineering/Producing</SelectItem>
                  <SelectItem value="influencer">Media Influencer</SelectItem>
                  <SelectItem value="management">Artist Management</SelectItem>
                  <SelectItem value="booking">Booking Agent</SelectItem>
                  <SelectItem value="legal">Legal/Lawyer</SelectItem>
                  <SelectItem value="financial">Financial Management</SelectItem>
                  <SelectItem value="content-management">Content Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact-method" className="font-medium text-gray-200">Preferred Contact Method (required)</Label>
                <Select required onValueChange={setContactMethod}>
                    <SelectTrigger className="justify-start text-white data-[state=open]:text-white transition-colors focus:ring-0 focus:border-[#CB945E] [&>span]:text-white/70 data-[placeholder]:text-white/70">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2D3534] text-white border-gray-700">
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="socials" className="font-medium text-gray-200">Socials</Label>
                <Textarea id="socials" placeholder="e.g., Instagram: @inertia_music" value={socials} onChange={(e) => setSocials(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="portfolio" className="font-medium text-gray-200">Portfolio</Label>
                <Input id="portfolio" placeholder="https://yourportfolio.com" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="genre" className="font-medium text-gray-200">Preferred Genre</Label>
                <Input id="genre" placeholder="e.g., Indie Rock, Folk, Electronic" value={genre} onChange={(e) => setGenre(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>

            <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
          {message && <p className="mt-6 text-center text-sm text-green-300">{message}</p>}
          {error && <p className="mt-6 text-center text-sm text-red-400">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}