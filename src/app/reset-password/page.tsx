// File: src/app/reset-password/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message + " You will be redirected to the login page shortly.");
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else {
      setError(data.details || "Failed to reset password. The link may have expired.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardHeader>
          <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
          <CardDescription className="text-white">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-medium text-gray-200">New Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="font-medium text-gray-200">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" 
              />
            </div>
            <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-green-300">{message}</p>}
          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
           <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline text-gray-300 hover:text-white">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}