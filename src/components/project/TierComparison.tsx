"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus } from "lucide-react";
import type { Tier } from "@/types";

// ---------- Icon Helpers for Matrix ----------
function IncludedIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500/20" role="img" aria-label="Included">
      <Check className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" strokeWidth={3} />
    </span>
  )
}

function NotIncludedIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/5" role="img" aria-label="Not included">
      <Minus className="w-3 h-3 md:w-4 md:h-4 text-gray-500" strokeWidth={2} />
    </span>
  )
}

function TierIcon({ included }: { included: boolean }) {
  if (!included) return <NotIncludedIcon />
  return <IncludedIcon />
}

// ---------- Dynamic Tier Comparison Matrix ----------
export default function TierComparisonMatrix({ tiers }: { tiers: Tier[] }) {
  // Safely fallback to an empty array if tiers is null or undefined
  const safeTiers = Array.isArray(tiers) ? tiers : [];

  // Sort by price to ensure logical progression (cheapest to most expensive)
  const sortedTiers = useMemo(() => [...safeTiers].sort((a, b) => a.price - b.price), [safeTiers]);

  // Extract all unique perks dynamically and group them
  const { categorizedPerks, groups } = useMemo(() => {
    // Get all unique strings first
    const uniquePerks = Array.from(new Set(sortedTiers.flatMap((t) => t.perks || [])));
    
    // Parse strings into categories based on the "Category: Perk" convention
    const parsed = uniquePerks.map(perk => {
      const hasCategory = perk.includes(':');
      const category = hasCategory ? perk.split(':')[0].trim() : 'General';
      const feature = hasCategory ? perk.substring(perk.indexOf(':') + 1).trim() : perk.trim();
      
      return { category, feature, original: perk };
    });

    // Get unique categories and sort them (putting "General" at the end)
    const uniqueGroups = Array.from(new Set(parsed.map(p => p.category))).sort((a, b) => {
      if (a === 'General') return 1;
      if (b === 'General') return -1;
      return a.localeCompare(b);
    });

    return { categorizedPerks: parsed, groups: uniqueGroups };
  }, [sortedTiers]);

  if (sortedTiers.length === 0) return null;

  return (
    <section id="tier-comparison" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: "#64918E" }}>
        Compare Perks
      </h2>
      <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto px-4">
        See exactly what you get at each level.
      </p>

      {/* ==================== UNIVERSAL TABLE ==================== */}
      <Card className="rounded-xl overflow-hidden w-full" style={{ backgroundColor: "#2D3534", border: "2px solid #CB945E" }}>
        {/* overflow-x-auto allows horizontal scrolling on very small phones if needed */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="border-b-2 border-[#CB945E]/30">
                <th className="w-[40%] md:w-[45%] py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-xs md:text-sm sticky top-0 bg-[#2D3534] z-10 align-bottom">
                  Perk / Experience
                </th>
                {sortedTiers.map((tier, idx) => {
                  const isPopular = idx === Math.floor(sortedTiers.length / 2); // Dynamically mark middle tier as popular
                  return (
                    <th key={tier.id} className="w-[20%] md:w-[18%] py-3 md:py-4 px-1 md:px-2 sticky top-0 bg-[#2D3534] z-10 text-center font-bold text-[10px] md:text-sm uppercase tracking-wider align-bottom">
                      {isPopular && (
                        <div className="flex justify-center mb-1">
                          <Badge className="bg-[#CB945E] text-white text-[8px] md:text-[10px] px-1.5 py-0 leading-tight">
                            Popular
                          </Badge>
                        </div>
                      )}
                      <span className="text-white block break-words">{tier.name}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groups.map((group) => {
                const groupPerks = categorizedPerks.filter(p => p.category === group);
                if (groupPerks.length === 0) return null;

                return (
                  <React.Fragment key={group}>
                    {/* Category Header Row */}
                    <tr className="bg-white/[0.02] border-y border-white/10">
                      <td colSpan={sortedTiers.length + 1} className="py-2.5 px-3 md:px-4">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#CB945E]">
                          {group}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Perk Rows */}
                    {groupPerks.map((perkObj, i) => (
                      <tr key={`${group}-${i}`} className="hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0">
                        <td className="py-3 md:py-3.5 px-3 md:px-4 text-[12px] md:text-sm text-gray-200 leading-snug pl-4 md:pl-6">
                          {perkObj.feature}
                        </td>
                        {sortedTiers.map((tier, currentTierIndex) => {
                          // Match against the exact original string in the database
                          // CUMULATIVE LOGIC: Check if this tier OR ANY LOWER TIER includes the perk
                          const isIncluded = sortedTiers
                            .slice(0, currentTierIndex + 1)
                            .some(t => Array.isArray(t.perks) && t.perks.includes(perkObj.original));
                          
                          return (
                            <td key={tier.id} className="py-3 px-1 md:px-2 text-center align-middle">
                              <div className="flex justify-center">
                                <TierIcon included={isIncluded} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 py-3 md:py-4 px-4 border-t border-white/10 bg-[#2D3534]">
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
            <IncludedIcon /> Included
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
            <NotIncludedIcon /> Not included
          </div>
        </div>
      </Card>
    </section>
  );
}