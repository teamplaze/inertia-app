// File: src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import { Albert_Sans } from 'next/font/google';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { PHProvider } from "./providers";
const madeOuterSans = localFont({
  src: [
    {
      path: '../../public/fonts/MADE Outer Sans Regular PERSONAL USE.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MADE Outer Sans Medium PERSONAL USE.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MADE Outer Sans Bold PERSONAL USE.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/MADE Outer Sans Black PERSONAL USE.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-made-outer-sans',
});

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-albert-sans',
});

export const metadata: Metadata = {
  title: "Inertia",
  description: "Crowdfunding for independent music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${madeOuterSans.variable} ${albertSans.variable}`}
    >
      <PHProvider>
        <body className="bg-black text-white">
          <div className="fixed top-[var(--spacing-4)] left-1/2 -translate-x-1/2 z-50 w-[600px]">
            <Navigation />
          </div>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </PHProvider>
    </html>
  );
}