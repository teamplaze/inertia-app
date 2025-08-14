// File: src/components/Header.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

// Check if payments are enabled via environment variable
const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Only set up auth if payments are enabled
    if (!paymentsEnabled) return;

    // This function runs when the component first loads.
    // It gets the current logged-in user.
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getInitialUser();

    // This listener runs every time the user's auth state changes (e.g., login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // This cleans up the listener when the component is removed from the page.
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Refresh the page to ensure the user state is fully cleared and reflected
    router.refresh();
  };
  
  const getInitials = (name: string) => {
    // Creates initials from a full name, e.g., "Ian DiBruno" -> "ID"
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header
      className="sticky top-0 z-50 px-4 lg:px-6 h-14 flex items-center backdrop-blur-md border-b border-gray-700"
      style={{ backgroundColor: "rgba(45, 53, 52, 0.95)" }}
    >
      <Link href="/" className="flex items-center justify-center font-bold text-lg">
        <Image src="/Inertia-Logo-w-tagline.svg" alt="Inertia Logo" width={120} height={60} />
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link href="/#how-it-works" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          How It Works
        </Link>
        <Link href="/#featured-projects" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          Projects
        </Link>
        <Link href="/network" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          Network
        </Link>
        {/* <Link href="#" className="text-sm font-medium hover:underline underline-offset-4 text-gray-300 hover:text-white">
          FAQ
        </Link> */}

        {/* Conditional rendering based on environment variable */}
        {paymentsEnabled ? (
          // Show login/user functionality when payments are enabled (development/testing)
          user ? (
            // If a user is logged in, show the Avatar and Dropdown Menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback className="bg-[#CB945E] text-white">{getInitials(user.user_metadata.full_name || user.email || 'U')}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2D3534] text-white border-gray-700">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#CB945E] hover:!text-[#CB945E]">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // If no user is logged in, show the Login button
            <Link href="/login">
              <Button size="sm" className="bg-[#CB945E] text-white hover:bg-white hover:text-[#CB945E]">
                Login
              </Button>
            </Link>
          )
        ) : (
          // When payments are disabled (production), show nothing
          null
        )}
      </nav>
    </header>
  );
}