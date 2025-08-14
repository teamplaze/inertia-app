// File: src/app/success/page.tsx
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center py-20">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">Contribution Successful!</h1>
      <p className="text-lg text-gray-300 mb-8">
        Thank you for supporting this project. Your contribution will help bring it to life.
      </p>
      <Link href="/">
        <button className="bg-[#CB945E] text-white px-6 py-2 rounded-md hover:bg-[#CB945E]/90">
          Back to Homepage
        </button>
      </Link>
    </main>
  );
}