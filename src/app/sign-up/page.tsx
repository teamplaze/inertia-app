import { Suspense } from "react";
import { fetchWaitlistContext, type WaitlistContext } from "@/lib/fetchProject";
import { SignUpForm } from "./SignUpForm";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; projectId?: string }>;
}) {
  const { action, projectId } = await searchParams;

  const numericProjectId = projectId ? Number(projectId) : NaN;
  const waitlistContext: WaitlistContext | null =
    action === 'waitlist' && Number.isInteger(numericProjectId)
      ? await fetchWaitlistContext(numericProjectId)
      : null;

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignUpForm waitlistContext={waitlistContext} />
    </Suspense>
  );
}
