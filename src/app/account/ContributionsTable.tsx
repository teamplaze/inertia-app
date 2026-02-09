"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowUpDown } from 'lucide-react';

// Define the shape of the data we expect for each contribution
type Contribution = {
  id: number;
  amount_paid: number;
  created_at: string;
  projects: {
    id: number;
    project_title: string;
    artist_name: string;
    status: string;
  };
  tiers: {
    name: string;
  };
};

// Define which columns are sortable
type SortableKey = 'project' | 'amount' | 'date';

export default function ContributionsTable({ contributions }: { contributions: Contribution[] }) {
  // State to manage the current sort configuration
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  // useMemo will re-sort the contributions only when the data or sort config changes
  const sortedContributions = useMemo(() => {
    if (!Array.isArray(contributions)) {
      return [];
    }
    
    let sortableItems = [...contributions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'project':
            aValue = a.projects.project_title;
            bValue = b.projects.project_title;
            break;
          case 'amount':
            aValue = a.amount_paid;
            bValue = b.amount_paid;
            break;
          case 'date':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [contributions, sortConfig]);

  // Function to handle click on a sortable header
  const requestSort = (key: SortableKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // MP-8: Empty State (No Contributions)
  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center p-12 rounded-lg" style={{ backgroundColor: "#2D3534", border: "2px solid #CB945E" }}>
        <h2 className="text-xl font-semibold text-white mb-2">No Contributions Yet</h2>
        <p className="text-gray-400 mb-6">You haven't supported any projects yet. Find one to back!</p>
        <Link href="/#featured-projects">
          <Button className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
            Explore Featured Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-white text-sm font-medium">Sort by:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => requestSort('date')}
            className={`${
              sortConfig.key === 'date'
                ? 'bg-[#CB945E] text-white'
                : 'bg-[#2D3534] text-gray-300 hover:bg-[#64918E]'
            } transition-colors`}
          >
            Date {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
          </Button>
          <Button
            size="sm"
            onClick={() => requestSort('amount')}
            className={`${
              sortConfig.key === 'amount'
                ? 'bg-[#CB945E] text-white'
                : 'bg-[#2D3534] text-gray-300 hover:bg-[#64918E]'
            } transition-colors`}
          >
            Amount {sortConfig.key === 'amount' && <ArrowUpDown className="w-3 h-3 ml-1" />}
          </Button>
          <Button
            size="sm"
            onClick={() => requestSort('project')}
            className={`${
              sortConfig.key === 'project'
                ? 'bg-[#CB945E] text-white'
                : 'bg-[#2D3534] text-gray-300 hover:bg-[#64918E]'
            } transition-colors`}
          >
            Project {sortConfig.key === 'project' && <ArrowUpDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Card Layout for All Screen Sizes */}
      <div className="space-y-4">
        {sortedContributions.map((contribution) => (
          <div key={contribution.id} className="p-4 md:p-6 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <span className="text-lg md:text-xl font-bold text-white block">
                  {contribution.projects?.project_title || 'Unknown Project'}
                </span>
                <p className="text-sm md:text-base text-white mt-1">{contribution.projects.artist_name}</p>
              </div>
              <Badge 
                variant={contribution.projects.status === "Completed" ? "secondary" : "default"}
                className="bg-gray-600 text-white flex-shrink-0"
              >
                {contribution.projects.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm md:text-base">
              <div className="flex justify-between md:flex-col md:justify-start">
                <span className="text-white font-medium">Amount:</span>
                <span className="font-semibold text-green-400">${contribution.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between md:flex-col md:justify-start">
                <span className="text-white font-medium">Date:</span>
                <span className="text-white">{new Date(contribution.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between md:flex-col md:justify-start">
                <span className="text-white font-medium">Tier:</span>
                <span className="text-white">{contribution.tiers.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}