import React, { Suspense } from "react";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Projects Page..." />}>
      <ProjectsView />
    </Suspense>
  );
}
