"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchProjects, fetchPortfolio } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const RiskMapComponent = dynamic(() => import("./RiskMap"), {
  ssr: false,
  loading: () => <LoadingSpinner text="Initializing interactive Leaflet map..." />,
});

export function MapView() {
  const router = useRouter();

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => fetchPortfolio(),
  });

  if (loadingProjects || loadingPortfolio || !projects || !portfolio) {
    return <LoadingSpinner text="Loading spatial project map..." />;
  }

  return (
    <div>
      <PageHeader
        title="Project Risk Map (Interactive Leaflet)"
        subtitle="Point projects rendered as district centroid markers; linear corridor projects rendered as polylines, color-coded by delay risk"
      />

      <div className="space-y-4">
        <RiskMapComponent projects={projects} portfolio={portfolio} />

        {/* Fallback Project Picker */}
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs flex items-center justify-between gap-4 transition-colors">
          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Or pick a project to open details
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/projects?id=${encodeURIComponent(e.target.value)}`);
                }
              }}
              defaultValue=""
              className="w-full text-xs font-bold text-[var(--navy)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
            >
              <option value="" disabled>
                Select a project...
              </option>
              {projects.map((p: any) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_id} ({p.project_type} · {p.district})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Leaflet OpenStreetMap server integration.
          </span>
        </div>
      </div>
    </div>
  );
}
