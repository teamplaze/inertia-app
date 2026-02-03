// File: src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8" style={{ backgroundColor: "#2D3534", borderTop: "1px solid #64918E" }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
            <p className="text-sm text-white">&copy; {new Date().getFullYear()} Inertia. All rights reserved.</p>
            <div className="flex gap-4 mt-2 justify-center">
                <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-300 hover:text-white">Terms & Conditions</Link>
                {/* <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-300 hover:text-white">Legal Disclosures</Link> */}
            </div>
        </div>
      </div>
    </footer>
  );
}