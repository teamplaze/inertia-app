"use client"; // Needs to be a client component to check the active route

import { User, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from "@/lib/colors";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="md:col-span-1">
          <div className="p-4 rounded-xl border-2 border-brand-copper" style={{ backgroundColor: BRAND.dark }}>
            <h2 className="text-xl font-medium text-white mb-6 pl-2">My Account</h2>
            <nav className="space-y-2">
              <Link
                href="/account"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  pathname === '/account' 
                    ? 'bg-brand-teal text-white font-medium' 
                    : 'text-gray-300 hover:bg-brand-teal/50 hover:text-white'
                }`}
              >
                <Library className="w-5 h-5" />
                <span>My Projects</span>
              </Link>
              <Link
                href="/account/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  pathname === '/account/profile' 
                    ? 'bg-brand-teal text-white font-medium' 
                    : 'text-gray-300 hover:bg-brand-teal/50 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                <span>User Profile</span>
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