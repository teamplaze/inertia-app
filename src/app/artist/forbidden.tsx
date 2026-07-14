// File: src/app/artist/forbidden.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <Card className="w-full max-w-md bg-brand-darker border-brand-copper">
        <CardHeader className="text-center">
          <div className="mx-auto bg-brand-copper/10 p-3 rounded-full w-fit mb-4">
            <ShieldAlert className="w-8 h-8 text-brand-copper" />
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
            <Button variant="border">
              Go to My Account
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-brand-copper text-brand-copper hover:bg-brand-copper/10">
              Back Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}