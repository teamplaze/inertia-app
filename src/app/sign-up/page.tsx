// File: src/app/sign-up/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Sparkles } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  // Debug: Log on render to verify the hook is working
  console.log('Rendering SignUpForm. URL Token:', inviteToken);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    console.log('Submitting Form. Invite Token:', inviteToken);

    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        // Explicitly handle null/undefined to ensure we know what we are sending
        inviteToken: inviteToken || null, 
      }),
    });

    if (response.ok) {
      setMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        const data = response.clone().json().then(d => {
           window.location.href = d.redirectTo || '/';
        }).catch(() => {
           window.location.href = '/';
        });
      }, 1500);
    } else {
      const errorData = await response.json();
      setMessage(`Sign-up failed: ${errorData.details || errorData.error || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setTermsScrolled(true);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          {inviteToken ? (
            <>
              <Sparkles className="w-6 h-6 text-[#CB945E]" />
              Artist Access
            </>
          ) : (
            "Create an Account"
          )}
        </CardTitle>
        <CardDescription className="text-white">
          {inviteToken 
            ? "You have been invited to join Inertia as an Artist." 
            : "Enter your information to get started"}
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
              <label htmlFor="terms" className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the 
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="underline ml-1 text-white/80 hover:text-white">
                      Terms and Conditions
                    </button>
                  </DialogTrigger>
                  <DialogContent onScroll={handleTermsScroll} className="sm:max-w-[425px] h-[80vh] flex flex-col bg-[#2D3534] text-white border-[#64918E]">
                    <DialogHeader>
                      <DialogTitle>Terms & Conditions</DialogTitle>
                      <DialogDescription>Please scroll to the bottom to agree.</DialogDescription>
                    </DialogHeader>
                    <div onScroll={handleTermsScroll} className="overflow-y-auto p-4 flex-1">
                      <p className="mb-4">
                        <strong>1. Introduction & Acceptance of Terms</strong><br />
                        Welcome to Inertia! These Terms and Conditions ("Terms") govern your use of the Inertia website and the services we offer (the "Service"). By creating an account or using our platform to back or create a music project, you agree to be bound by these Terms, our Privacy Policy, and all applicable laws.
                      </p>
                      
                      <p className="mb-4">
                        <strong>2. The Inertia Platform</strong><br />
                        Inertia provides a platform for music artists ("Creators") to raise funds from other users ("Backers") for their creative projects. We act as a venue for these connections. Inertia is not a party to any agreement between Creators and Backers and does not guarantee the completion or quality of any project.
                      </p>

                      <p className="mb-4">
                        <strong>3. For Backers</strong><br />
                        As a Backer, you are making a pledge to a Creator's project. This is a commitment to provide the amount you pledge. You understand and agree that backing a project is not a purchase of a product, but a donation towards a creative goal. While Creators are expected to fulfill the perks offered, Inertia does not guarantee that perks will be delivered.
                      </p>

                      <p className="mb-4">
                        <strong>4. For Creators</strong><br />
                        As a Creator, you are responsible for providing accurate and honest information about your project. You must fulfill all promised perks to your Backers if your project is successfully funded. You are also responsible for any tax obligations on the funds you receive.
                      </p>

                      <p className="mb-4">
                        <strong>5. Intellectual Property</strong><br />
                        Creators retain full ownership of the intellectual property for their projects. By creating a campaign on Inertia, you grant us a worldwide, non-exclusive, royalty-free license to use and display the content you upload for the purposes of promoting your project and our platform.
                      </p>
                      
                      <p className="mb-4">
                        <strong>6. Limitation of Liability</strong><br />
                        To the fullest extent permitted by law, in no event will Inertia be liable for any indirect, incidental, punitive, consequential, special, or exemplary damages of any kind, including without limitation lost revenues or profits, or loss of data.
                      </p>

                      <p className="mb-4">
                        <strong>For Artists (Invited Users):</strong><br />
                        If you are signing up via an artist invitation, you agree to the Creator Guidelines which will be presented in your dashboard.
                      </p>
                      <p>
                        <strong>This is the final paragraph.</strong> By scrolling to this point, you enable the checkbox to agree to these terms.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" className="bg-[#CB945E] hover:bg-[#CB945E]/90">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading || !termsAgreed}>
            {isLoading ? 'Creating Account...' : inviteToken ? 'Claim Artist Account' : 'Create Fan Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-white">
          Already have an account?{" "}
          <Link href="/login" className="underline text-gray-300 hover:text-white">
            Login
          </Link>
        </div>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}