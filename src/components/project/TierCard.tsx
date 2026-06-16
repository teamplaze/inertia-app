"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Check, Zap, Lock, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/colors";
import { regularCardStyle, gradientCardStyle } from "@/lib/cardStyles";
import type { Tier, Project } from "@/types";
import { CountdownTimer } from "@/components/project/CountdownTimer";

function getTierSubtitle(name: string): string | null {
  const n = name.toUpperCase();
  if (n.includes("GA")) return "For fans who want to be part of the journey and the fun";
  if (n.includes("PIT") || n.includes("BACKSTAGE")) return "For fans who want deeper access and real conversations";
  if (n.includes("VIP")) return "For fans who want to leave their mark on the project";
  return null;
}

export type TierCardProps = {
  tier: Tier;
  project: Project;
  selectedTier: number | null;
  user: { id: string } | null;
  paymentsEnabled: boolean;
  showCheckout: boolean;
  onSelectTier: (tierId: number) => void;
  onCheckout: () => void;
  onCancelCheckout: () => void;
};

export function TierCard({
  tier,
  project,
  selectedTier,
  user,
  paymentsEnabled,
  showCheckout,
  onSelectTier,
  onCheckout,
  onCancelCheckout,
}: TierCardProps) {
  const saleEndDate = tier.sale_end_at ? new Date(tier.sale_end_at) : null;

  const [isExpired, setIsExpired] = useState(() => {
    if (tier.status === "closed") return true;
    return saleEndDate ? saleEndDate <= new Date() : false;
  });

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    setIsJoining(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, tierId: tier.id }),
      });
      if (res.ok) {
        setHasJoined(true);
      }
    } catch {
      // Silently fail — button returns to default state on next interaction
    } finally {
      setIsJoining(false);
    }
  };

  const isSoldOut = tier.total_slots - tier.claimed_slots <= 0;
  const isSelected = selectedTier === tier.id;

  const sortedPerks = [...tier.perks].sort((a, b) => a.sort_order - b.sort_order);
  const hasExclusivePerks = sortedPerks.some((p) => p.is_exclusive);

  const subtitle = tier.description || getTierSubtitle(tier.name);

  return (
    <div className="flex flex-col gap-4">
      <Card
        className={`flex flex-col relative transition-all duration-200 rounded-xl h-full ${
          isExpired ? "opacity-75" : ""
        } ${
          isSelected && !isExpired
            ? "ring-2 ring-offset-2 ring-offset-brand-teal ring-brand-copper shadow-lg"
            : "hover:shadow-md hover:shadow-gray-700/50"
        }`}
        style={regularCardStyle}
      >
        <CardHeader className="pb-3">
          {/* Status badge */}
          <div className="mb-3">
            {isExpired ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(156,163,175,0.9)",
                  backgroundColor: "rgba(0,0,0,0.40)",
                }}
              >
                <Lock className="w-3 h-3" />
                {tier.name} &bull; Closed
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border"
                style={{
                  borderColor: `rgba(203,148,94,0.6)`,
                  color: BRAND.copper,
                  backgroundColor: "rgba(0,0,0,0.40)",
                }}
              >
                <Zap className="w-3 h-3" />
                {tier.name} &bull; Live
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-white">${tier.price}</div>

          {/* Subtitle */}
          {subtitle && <p className="text-sm text-white/70 mt-0.5">{subtitle}</p>}
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Countdown or closed bar */}
            {isExpired ? (
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span className="text-gray-400">This Wave has closed</span>
              </div>
            ) : saleEndDate ? (
              <CountdownTimer
                endDate={saleEndDate}
                onExpire={() => setIsExpired(true)}
              />
            ) : null}

            {/* Perks */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                {isExpired ? "Fans Received" : "What You Get"}
              </p>
              <ul className="space-y-2">
                {sortedPerks.map((perk) => (
                  <li key={perk.id} className="flex items-start gap-2">
                    {perk.is_exclusive ? (
                      <Star
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: BRAND.copper }}
                      />
                    ) : (
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/60" />
                    )}
                    <span className="text-sm text-white">
                      {perk.label}
                      {perk.is_exclusive && (
                        <span style={{ color: BRAND.copper }}>*</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {hasExclusivePerks && (
                <p className="text-xs text-white/40 italic mt-3">
                  * Exclusive perks — limited availability, only offered with this tier.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/20 space-y-3">
            {!isExpired && (
              <div className="text-sm text-center text-white/70">
                {tier.total_slots - tier.claimed_slots} of {tier.total_slots} left
              </div>
            )}

            {isExpired ? (
              user ? (
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={isJoining || hasJoined}
                  className="w-full bg-white text-gray-900 hover:bg-white/90 font-bold disabled:opacity-70"
                >
                  {isJoining ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Joining...</>
                  ) : hasJoined ? (
                    "You're on the list ✓"
                  ) : (
                    "Join the Waitlist"
                  )}
                </Button>
              ) : (
                <Link
                  href={`/sign-up?action=waitlist&projectId=${project.id}&tierId=${tier.id}${project.slug ? `&redirect=${encodeURIComponent(`/${project.slug}`)}` : ''}`}
                >
                  <Button className="w-full bg-white text-gray-900 hover:bg-white/90 font-bold">
                    Join the Waitlist
                  </Button>
                </Link>
              )
            ) : paymentsEnabled ? (
              isSoldOut ? (
                <Button
                  className="w-full text-white bg-gray-500 cursor-not-allowed hover:bg-gray-500"
                  disabled
                >
                  Sold Out
                </Button>
              ) : user ? (
                <Button
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full text-white ${
                    isSelected
                      ? "bg-brand-teal-selected hover:bg-brand-teal-selected/90"
                      : "bg-brand-copper hover:bg-brand-copper/90"
                  }`}
                >
                  {isSelected ? "Selected" : "Claim your spot"}
                </Button>
              ) : (
                <Link
                  href={`/sign-up?action=checkout&projectId=${project.id}&tierId=${tier.id}`}
                >
                  <Button className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white h-auto whitespace-normal">
                    Login / Sign up to contribute
                  </Button>
                </Link>
              )
            ) : (
              <div className="w-full bg-brand-copper text-white text-center cursor-not-allowed opacity-60 rounded-md px-4 py-2 font-medium text-sm">
                Coming Soon
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile inline checkout — only when this tier is selected and active */}
      {paymentsEnabled && showCheckout && isSelected && !isSoldOut && !isExpired && (
        <div className="md:hidden">
          <Card
            className="rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 border-brand-copper shadow-xl"
            style={gradientCardStyle}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Ready to support?</h3>
                  <p className="text-sm text-gray-200 leading-snug">
                    You&apos;ve selected the{" "}
                    <strong className="text-white">{tier.name}</strong> tier for{" "}
                    <strong style={{ color: BRAND.copper }}>${tier.price}</strong>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={onCheckout}
                    className="w-full bg-brand-copper hover:bg-brand-copper/90 text-white font-semibold"
                  >
                    Continue to Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white hover:bg-white/10 h-8 text-xs"
                    onClick={onCancelCheckout}
                  >
                    Change Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
