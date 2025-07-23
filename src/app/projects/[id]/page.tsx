// File: src/app/projects/[id]/page.tsx

import Link from "next/link";
import ProjectUI from "./project-client-ui"; // Import our new client component
import type { Project } from "@/types"; // Assuming your types are in src/types.ts

async function getProjectData(id: string): Promise<Project | null> {
  // Determine the base URL based on the environment
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/projects/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    return null;
  }
  return res.json();
}

// This is the main page component (a Server Component)
export default async function ProjectPage({ params }: { params: Promise<{ id: string }>} ) {
  const resolvedParams = await params; // This line is correct
  const projectData = await getProjectData(resolvedParams.id); // <-- CORRECTED: Use resolvedParams here

  if (!projectData) {
    return (
      <div className="min-h-screen text-white text-center pt-32">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="mt-2 text-gray-400">Could not load the project data. Please try again later.</p>
        <Link href="/" className="text-lg text-[#CB945E] hover:underline mt-6 inline-block">
            &larr; Back to Homepage
        </Link>
      </div>
    );
  }

  // The Server Component renders the Client Component, passing the data as a prop.
  return <ProjectUI projectData={projectData} />;
}