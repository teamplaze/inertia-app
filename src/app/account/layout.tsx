"use client";

import { User, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 pt-[96px] pb-12 md:pt-[120px] max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="md:col-span-1">
          <div
            className="p-[var(--spacing-4)] rounded-[12px]"
            style={{ background: '#0f1111', border: '1px solid #3f4948' }}
          >
            <h2 className="font-heading font-medium text-[20px] text-white mb-[var(--spacing-5)] pl-2">
              My Account
            </h2>
            <nav className="space-y-1">
              <Link
                href="/account"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  pathname === '/account'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[var(--color-text-200)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Library className="w-5 h-5 shrink-0" />
                <span className="font-body text-[16px]">My Projects</span>
              </Link>
              <Link
                href="/account/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  pathname === '/account/profile'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[var(--color-text-200)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-5 h-5 shrink-0" />
                <span className="font-body text-[16px]">User Profile</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
