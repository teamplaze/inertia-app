// File: src/app/login/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      setMessage('Login successful! Redirecting...');
      // Force a full page reload to ensure the Header component updates
      window.location.href = '/';
    }
    else {
      const errorData = await response.json();
      setMessage(`Login failed: ${errorData.details || 'Invalid credentials.'}`);
      setIsLoading(false);
    }
  };

  return (
    // The Header and Footer are now provided by layout.tsx
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
              <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="font-medium text-gray-200">Password</Label>
                <Link href="/forgot-password" className="ml-auto inline-block text-sm underline text-white/80 hover:text-white">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
            </div>
            <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-white">
            Don't have an account?{" "}
            <Link href="/sign-up" className="underline text-gray-300 hover:text-white">
              Sign up
            </Link>
          </div>
          {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </CardContent>
      </Card>
    </main>
  );
}