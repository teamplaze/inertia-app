// File: src/components/Header.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
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
const paymentsEnabled = (() => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') return true;
  return process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
})();

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Only set up auth if payments are enabled
    if (!paymentsEnabled) return;

    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header
      className={cn(
        "relative",
        "flex items-center justify-between",
        "px-[var(--spacing-5)] py-[var(--spacing-4)]",
        "rounded-[12px]",
      )}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.7) 0%, #ffffff 20%, rgba(255,255,255,0.9) 80%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0px 0px 20px 0px #313131',
      }}
    >
      {/* Logo + tagline */}
      <div className="flex items-center gap-[var(--spacing-4)]">
        <Link href="/">
          <Logo variant="default" color="black" width={144} />
        </Link>
        <span
          className={cn(
            "font-heading font-medium",
            "text-[14px] leading-[1.2]",
            "tracking-normal",
            "text-black",
            "whitespace-nowrap",
          )}
        >
          STAY. INDIE.
        </span>
      </div>

      {/* Right side: auth + mobile hamburger */}
      <div className="flex items-center gap-[var(--spacing-3)]">
        {paymentsEnabled ? (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-black rounded-[100px]">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback className="bg-black text-white">
                    {getInitials(user.user_metadata.full_name || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-black border-[--color-border-default]">
                <DropdownMenuLabel className="text-black">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer text-black">My Projects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="cursor-pointer text-black">User Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-black">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <button
                className={cn(
                  "flex items-center justify-center",
                  "bg-black text-white",
                  "font-heading font-medium",
                  "text-[length:--font-size-btn-base]",
                  "leading-[1.2] tracking-normal",
                  "px-[var(--spacing-5)] py-[var(--spacing-3)]",
                  "rounded-none",
                  "w-[144px]",
                  "transition-colors duration-150",
                  "hover:bg-[var(--color-bg-teal)] hover:text-white",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[--color-border-focus]",
                )}
              >
                Log in
              </button>
            </Link>
          )
        ) : (
          <Link href="/login">
            <div
              className={cn(
                "w-[32px] h-[32px] rounded-[100px]",
                "flex items-center justify-center",
                "border-2 border-black",
                "cursor-pointer",
                "hover:opacity-70 transition-opacity",
              )}
            >
              <span
                className="material-symbols-rounded text-[24px] leading-none text-black"
                aria-hidden="true"
              >
                person
              </span>
            </div>
          </Link>
        )}

      </div>
    </header>
  );
}
