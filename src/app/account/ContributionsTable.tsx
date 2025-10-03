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
        {/* Added custom scrollbar styles */}
      <style jsx>{`
        /* For Webkit-based browsers (Chrome, Safari, Edge) */
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px; /* A bit more space for the border effect */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* Makes the track invisible */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #64918E; /* A subtle, on-brand color */
          border-radius: 10px;
          border: 4px solid transparent; /* Creates padding around the thumb */
          background-clip: content-box; /* Ensures the border is transparent, showing the table background */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #CB945E; /* The vibrant brand color on hover */
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #64918E transparent; /* thumb color and a transparent track color */
        }
      `}</style>
      {/* --- Desktop Table (Container is now horizontally scrollable) --- */}
      <div className="hidden md:block rounded-lg overflow-x-auto custom-scrollbar" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <table className="min-w-full divide-y divide-white/20">
          <thead >
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <button onClick={() => requestSort('project')} className="flex items-center gap-2">
                  PROJECT {sortConfig.key === 'project' && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Artist</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <button onClick={() => requestSort('amount')} className="flex items-center gap-2">
                  AMOUNT {sortConfig.key === 'amount' && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                <button onClick={() => requestSort('date')} className="flex items-center gap-2">
                  DATE {sortConfig.key === 'date' && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {sortedContributions.map((contribution) => (
              <tr key={contribution.id} className="hover:bg-black/10">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  <Link href={`/projects/${contribution.projects.id}`} className="inline-flex items-center gap-2 hover:text-[#CB945E]">
                    {contribution.projects.project_title}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contribution.projects.artist_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contribution.tiers.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                  ${contribution.amount_paid.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {new Date(contribution.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge 
                    variant={contribution.projects.status === "Completed" ? "secondary" : "default"}
                    className="bg-gray-600 text-white"
                  >
                    {contribution.projects.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/projects/${contribution.projects.id}`}>
                    <Button size="sm" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card Layout (Visible only on small screens) --- */}
      <div className="md:hidden space-y-4">
        {sortedContributions.map((contribution) => (
          <div key={contribution.id} className="p-4 rounded-lg" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href={`/projects/${contribution.projects.id}`} className="text-lg font-bold text-white hover:text-[#CB945E] inline-flex items-center gap-2">
                  {contribution.projects.project_title} <ExternalLink className="w-4 h-4" />
                </Link>
                <p className="text-sm text-white">{contribution.projects.artist_name}</p>
              </div>
              <Badge 
                variant={contribution.projects.status === "Completed" ? "secondary" : "default"}
                className="bg-gray-600 text-white"
              >
                {contribution.projects.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white">Amount:</span>
                <span className="font-semibold text-green-400">${contribution.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Date:</span>
                <span className="text-white">{new Date(contribution.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Tier:</span>
                <span className="text-white">{contribution.tiers.name}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <Link href={`/projects/${contribution.projects.id}`} className="w-full">
                <Button size="sm" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white">
                  View Project
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

