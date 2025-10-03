// This layout defines the structure for all pages under the /account route
import { User, Library } from 'lucide-react';
import Link from 'next/link';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="md:col-span-1">
          <div className="p-4 rounded-lg" style={{ backgroundColor: "#2D3534" }}>
            <h2 className="text-xl font-bold text-white mb-4">My Account</h2>
            <nav className="space-y-2">
              {/*<Link
                href="/account/profile"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-[#64918E] hover:text-white rounded-md transition-colors"
              >
                <User className="w-5 h-5" />
                <span>User Profile</span>
              </Link>*/}
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2 text-white bg-[#64918E] rounded-md" // Active state
              >
                <Library className="w-5 h-5" />
                <span>My Projects</span>
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
