// File: src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PHProvider } from "./providers";
import { BRAND } from "@/lib/colors";

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
    <html lang="en" className="dark">
      <PHProvider>
        <body style={{ backgroundColor: BRAND.dark, color: "white" }}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </PHProvider>
    </html>
  );
}