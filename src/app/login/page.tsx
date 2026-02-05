"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Capture all potential intent params
  const redirectUrl = searchParams.get('redirect');
  const action = searchParams.get('action');
  const projectId = searchParams.get('projectId');
  const tierId = searchParams.get('tierId');
  
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

    const data = await response.json();

    if (response.ok) {
      setMessage('Login successful! Redirecting...');
      
      // If we have checkout intent, we should ideally trigger it here too.
      // For now, let's just respect the redirectUrl if it exists.
      // Since the user asked for SIGN UP flow primarily, I won't overcomplicate this yet,
      // but I will ensure we don't break the flow.
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (action === 'checkout' && projectId) {
         // Fallback logic if they logged in but wanted to checkout: send them back to project page
         // Ideally we would trigger checkout here too, but let's send them to the project
         window.location.href = `/projects/${projectId}`;
      } else {
        window.location.href = data.redirectTo || '/';
      }
    }
    else {
      setMessage(`Login failed: ${data.details || 'Invalid credentials.'}`);
      setIsLoading(false);
    }
  };
  
  // Construct Sign Up URL passing all context
  const getSignUpUrl = () => {
      const params = new URLSearchParams();
      if (action) params.set('action', action);
      if (projectId) params.set('projectId', projectId);
      if (tierId) params.set('tierId', tierId);
      if (redirectUrl) params.set('redirect', redirectUrl);
      
      const queryString = params.toString();
      return queryString ? `/sign-up?${queryString}` : '/sign-up';
  };

  return (
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
          <Link 
            href={getSignUpUrl()}
            className="underline text-gray-300 hover:text-white"
          >
            Sign up
          </Link>
        </div>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}