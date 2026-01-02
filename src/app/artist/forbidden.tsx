// File: src/app/artist/forbidden.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2D3534] p-4">
      <Card className="w-full max-w-md bg-[#1E2322] border-[#CB945E]">
        <CardHeader className="text-center">
          <div className="mx-auto bg-[#CB945E]/10 p-3 rounded-full w-fit mb-4">
            <ShieldAlert className="w-8 h-8 text-[#CB945E]" />
          </div>
          <CardTitle className="text-2xl text-white">Access Denied</CardTitle>
          <CardDescription className="text-gray-400">
            This area is restricted to Artist accounts only.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            You are currently logged in with a Fan account. To access the Artist Dashboard, you must be invited and sign up as an Artist.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/account">
            <Button variant="secondary" className="bg-[#64918E] text-white hover:bg-[#64918E]/90">
              Go to My Account
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-[#CB945E] text-[#CB945E] hover:bg-[#CB945E]/10">
              Back Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}