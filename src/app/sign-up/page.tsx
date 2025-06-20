// File: src/app/sign-up/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

// In a larger app, Header and Footer would be in a shared layout.tsx file.
function Header() {
  return (
    <header
      className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center backdrop-blur-md border-b border-gray-700"
      style={{ backgroundColor: "rgba(45, 53, 52, 0.95)" }}
    >
      <Link href="/" className="flex items-center justify-center font-bold text-lg">
        <Image src="/Inertia-Logo-w-tagline.svg" alt="Inertia Logo" width={120} height={60} />
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link href="/#featured-projects" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          Projects
        </Link>
        <Link href="/#how-it-works" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          How It Works
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          FAQ
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-8" style={{ backgroundColor: "#2D3534", borderTop: "1px solid #64918E" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
            <p className="text-sm text-white">&copy; {new Date().getFullYear()} Inertia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    console.log("Submitting for sign-up:", { name, email, password });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessage("Sign-up functionality is not yet connected.");
    
    setIsLoading(false);
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setTermsScrolled(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#2D3534" }}>
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create an Account</CardTitle>
            <CardDescription className="text-white">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUpSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium text-gray-200">Name</Label>
                <Input id="name" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium text-gray-200">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-medium text-gray-200">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  onCheckedChange={(checked) => setTermsAgreed(Boolean(checked))}
                  disabled={!termsScrolled}
                />
                <div className="grid gap-1.5 leading-none">
                  {/* Added text-white to make "I agree to the" white */}
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to the 
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="underline ml-1 text-white/80 hover:text-white">
                          Terms and Conditions
                        </button>
                      </DialogTrigger>
                      {/* Add the DialogContent back in: */}
                      <DialogContent onScroll={handleTermsScroll} className="sm:max-w-[425px] h-[80vh] flex flex-col bg-[#2D3534] text-white border-[#64918E]">
                        <DialogHeader>
                          <DialogTitle>Terms & Conditions</DialogTitle>
                          <DialogDescription>
                            Please scroll to the bottom to agree.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto p-4 flex-1">
                          <p className="mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
                          </p>
                          <p className="mb-4">
                            Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.
                          </p>
                          {/* Add more paragraphs as needed to ensure scrolling */}
                          <p>
                            This is the final paragraph. By scrolling to this point, you enable the checkbox to agree to these terms.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading || !termsAgreed}>
                {isLoading ? 'Creating Account...' : 'Create an account'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-2xl text-white">
              Already have an account?{" "}
              <Link href="/login" className="underline text-gray-300 hover:text-white">
                Login
              </Link>
            </div>
            {message && <p className="mt-4 text-center text-sm">{message}</p>}
          </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
}