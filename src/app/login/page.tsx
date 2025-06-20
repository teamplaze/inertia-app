// File: src/app/login/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

// In a larger app, Header and Footer would be in a shared layout.tsx file.
// For now, we are including them directly for consistency.
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


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    console.log("Submitting for login:", { email, password });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessage("Login functionality not yet connected.");
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#2D3534" }}>
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
          <CardHeader>
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-white">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium text-gray-200">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-medium text-gray-200">Password</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline text-white/80 hover:text-white">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" 
                />
              </div>
              
              <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-2xl text-white">
              Don't have an account?{" "}
              <Link href="/sign-up" className="underline text-gray-300 hover:text-white">
                Sign up
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