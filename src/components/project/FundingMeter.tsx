"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import type { ProjectMilestone } from "@/types";

type FundingMeterProps = {
  currentFunds: number;
  totalGoal: number;
  milestones?: ProjectMilestone[];
};

export default function FundingMeter({ currentFunds, totalGoal, milestones = [] }: FundingMeterProps) {
  // Prevent division by zero
  const safeTotalGoal = totalGoal > 0 ? totalGoal : 1;
  const progressPercentage = Math.min((currentFunds / safeTotalGoal) * 100, 100);

  // Calculate cumulative targets for milestones
  const processedMilestones = useMemo(() => {
    if (!milestones || milestones.length === 0) return [];

    // 1. Sort by priority
    const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order);
    
    let runningTotal = 0;

    // 2. Map to cumulative values
    const processed = sorted.map((milestone) => {
      const milestoneCost = milestone.budget_line_items?.reduce((sum, item) => sum + item.cost, 0) || 0;
      runningTotal += milestoneCost;
      const percentage = Math.min((runningTotal / safeTotalGoal) * 100, 100);

      return {
        ...milestone,
        cumulativeTarget: runningTotal,
        cumulativePercentage: percentage,
      };
    });

    return processed;
  }, [milestones, safeTotalGoal]);

  // ==========================================
  // FALLBACK: Standard Bar (No Milestones)
  // ==========================================
  if (processedMilestones.length === 0) {
    return (
      <div className="w-full">
        <div className="w-full h-4 bg-brand-darker rounded-full overflow-hidden border border-gray-700">
          <div 
            className="h-full bg-brand-copper transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // NEW: Gamified Milestone Bar
  // ==========================================
  return (
    <div className="w-full py-4">
      {/* The Track */}
      <div className="relative w-full h-6 bg-brand-darker rounded-full border border-gray-700">
        
        {/* The Fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-brand-copper rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        />

        {/* The Markers */}
        {processedMilestones.map((milestone) => {
          const isMet = currentFunds >= milestone.cumulativeTarget;
          
          return (
            <div 
              key={milestone.id}
              className="group absolute top-1/2 -translate-y-1/2 flex items-center justify-center -ml-3 cursor-pointer z-10"
              style={{ left: `${milestone.cumulativePercentage}%` }}
            >
              {/* Star Icon Container */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-500
                ${isMet ? 'bg-brand-copper border-white' : 'bg-brand-dark border-gray-500'}`}
              >
                <Star className={`w-3 h-3 ${isMet ? 'text-white fill-white' : 'text-gray-500'}`} />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center pointer-events-none w-max max-w-[200px]">
                <div className="bg-brand-dark border border-brand-copper text-white text-xs p-2 rounded shadow-lg text-center">
                  <span className="block font-bold mb-1">{milestone.title}</span>
                  <span className={`block font-medium ${isMet ? 'text-green-400' : 'text-gray-400'}`}>
                    ${milestone.cumulativeTarget.toLocaleString()} {isMet ? ' (Unlocked!)' : ' (Locked)'}
                  </span>
                </div>
                {/* Tooltip Caret */}
                <div className="w-2 h-2 bg-brand-dark border-r border-b border-brand-copper rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}