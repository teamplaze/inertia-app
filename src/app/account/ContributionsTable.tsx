"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

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

type SortableKey = 'project' | 'amount' | 'date';

export default function ContributionsTable({ contributions }: { contributions: Contribution[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });

  const sortedContributions = useMemo(() => {
    if (!Array.isArray(contributions)) return [];

    return [...contributions].sort((a, b) => {
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
  }, [contributions, sortConfig]);

  const requestSort = (key: SortableKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (!contributions || contributions.length === 0) {
    return (
      <div
        className="flex flex-col items-center text-center gap-[var(--spacing-6)] p-[var(--spacing-12)] rounded-[12px]"
        style={{ background: '#0f1111', border: '1px solid #3f4948' }}
      >
        <span
          className="material-symbols-rounded text-[48px] leading-none"
          style={{ color: 'var(--color-bg-teal)' }}
          aria-hidden="true"
        >
          music_note
        </span>
        <div className="flex flex-col gap-[var(--spacing-3)]">
          <h2 className="font-heading font-medium text-[24px] text-white">
            You haven't backed any projects yet
          </h2>
          <p className="font-body text-[18px] text-[var(--color-text-200)] max-w-[480px]">
            Support the artists you believe in and help bring their music to life.
            Your contributions unlock perks, royalty shares, and a direct line to the artists you love.
          </p>
        </div>
        <Link href="/#featured-projects">
          <Button variant="primary" size="lg">
            Discover projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-5)]">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-[var(--spacing-3)] items-center">
        <span className="font-body text-[14px] text-[var(--color-text-200)]">Sort by:</span>
        <div className="flex gap-[var(--spacing-2)]">
          {(['date', 'amount', 'project'] as SortableKey[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={sortConfig.key === key ? 'primary' : 'border'}
              onClick={() => requestSort(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {sortConfig.key === key && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Contribution Cards */}
      <div className="flex flex-col gap-[var(--spacing-4)]">
        {sortedContributions.map((contribution) => (
          <div
            key={contribution.id}
            className="p-[var(--spacing-5)] md:p-[var(--spacing-6)] rounded-[12px]"
            style={{ background: '#0f1111', border: '1px solid #3f4948' }}
          >
            <div className="flex justify-between items-start mb-[var(--spacing-4)]">
              <div className="flex-1 min-w-0 pr-[var(--spacing-3)]">
                <span className="font-heading font-medium text-[20px] text-white block">
                  {contribution.projects?.project_title || 'Unknown Project'}
                </span>
                <p className="font-body text-[16px] text-[var(--color-text-200)] mt-[var(--spacing-1)]">
                  {contribution.projects.artist_name}
                </p>
              </div>
              <Badge variant={contribution.projects.status === 'Completed' ? 'secondary' : 'default'}>
                {contribution.projects.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-3)]">
              <div className="flex justify-between md:flex-col md:justify-start gap-[var(--spacing-1)]">
                <span className="font-body text-[14px] text-[var(--color-text-200)]">Amount</span>
                <span className="font-body font-medium text-[16px] text-white">
                  ${contribution.amount_paid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between md:flex-col md:justify-start gap-[var(--spacing-1)]">
                <span className="font-body text-[14px] text-[var(--color-text-200)]">Date</span>
                <span className="font-body text-[16px] text-white">
                  {new Date(contribution.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between md:flex-col md:justify-start gap-[var(--spacing-1)]">
                <span className="font-body text-[14px] text-[var(--color-text-200)]">Tier</span>
                <span className="font-body text-[16px] text-white">
                  {contribution.tiers?.name || 'Donation'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
