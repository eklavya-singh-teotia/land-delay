"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchProjects, fetchProjectDetail, updateProjectOverride } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiRow } from "@/components/shared/KpiCard";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { StageDelayChart } from "@/components/charts/StageDelayChart";
import { SegmentProfileChart } from "@/components/charts/SegmentProfileChart";
import { StageTimelineChart } from "@/components/charts/StageTimelineChart";
import { ShapBarChart } from "@/components/charts/ShapBarChart";
import { ParcelPanel } from "./ParcelPanel";
import { useAppStore } from "@/store/useAppStore";
import { ChevronDown, ChevronUp } from "lucide-react";

const PAGE_SIZE = 25;

export function ProjectsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = useAppStore((state) => state.role);

  const initialId = searchParams.get("id");

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialId || "");
  const [expandedParcelId, setExpandedParcelId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showOverride, setShowOverride] = useState(false);
  const [compOverride, setCompOverride] = useState("pending");
  const [rehabOverride, setRehabOverride] = useState(0);

  // Query all project IDs
  const { data: projectsList, isLoading: loadingList } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  // Auto select first project if none selected
  React.useEffect(() => {
    if (!selectedProjectId && projectsList && projectsList.length > 0) {
      const firstId = projectsList[0].project_id;
      setSelectedProjectId(firstId);
      router.replace(`/projects?id=${encodeURIComponent(firstId)}`);
    }
  }, [projectsList, selectedProjectId, router]);

  // Query selected project details
  const { data: projectData, isLoading: loadingProject, refetch } = useQuery({
    queryKey: ["projectDetail", selectedProjectId],
    queryFn: () => fetchProjectDetail(selectedProjectId),
    enabled: Boolean(selectedProjectId),
  });

  const handleProjectSelect = (pid: string) => {
    setSelectedProjectId(pid);
    setExpandedParcelId(null);
    setShowOverride(false);
    setCurrentPage(1);
    router.replace(`/projects?id=${encodeURIComponent(pid)}`);
  };

  const handleApplyOverride = async () => {
    if (!selectedProjectId) return;
    try {
      await updateProjectOverride(selectedProjectId, compOverride, rehabOverride);
      refetch();
      alert("Project state updated and re-scored successfully!");
    } catch (e) {
      alert("Failed to update project state");
    }
  };

  if (loadingList) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  const projects = projectsList || [];

  const totalParcels = projectData?.parcels.length || 0;
  const totalPages = Math.ceil(totalParcels / PAGE_SIZE);
  const paginatedParcels = projectData?.parcels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) || [];

  return (
    <div>
      <PageHeader
        title="Project Assessment & Parcel Details"
        subtitle="Search and select a project to view risk breakdown, timeline analysis, and parcel level details"
      />

      {/* Search / Selector */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Select Project ID
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectSelect(e.target.value)}
            className="w-full text-xs font-bold text-[var(--navy)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {projects.map((p: any) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_id} ({p.project_type} · {p.district})
              </option>
            ))}
          </select>
        </div>

        {projectData && role !== "Viewer" && (
          <button
            onClick={() => {
              setCompOverride(projectData.project_meta.compensation_status);
              setRehabOverride(projectData.project_meta.rehab_progress_pct);
              setShowOverride(!showOverride);
            }}
            className="text-xs font-semibold text-[var(--navy)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border)] px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 self-end sm:self-center cursor-pointer"
          >
            <span>Update Project State</span>
            {showOverride ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {loadingProject || !projectData ? (
        <LoadingSpinner text="Loading project details..." />
      ) : (
        <div className="space-y-4">
          {/* Officer Override Panel */}
          {showOverride && role !== "Viewer" && (
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--steel)] shadow-xs space-y-3 transition-colors">
              <h3 className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">
                Update Project State (Compensation & Rehab)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Compensation Status
                  </label>
                  <select
                    value={compOverride}
                    onChange={(e) => setCompOverride(e.target.value)}
                    className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Rehab Progress: {rehabOverride}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rehabOverride}
                    onChange={(e) => setRehabOverride(Number(e.target.value))}
                    className="w-full accent-[#1F4E79]"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyOverride}
                className="bg-[#1F4E79] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-[#1F4E79]/90 transition-colors cursor-pointer"
              >
                Apply Update & Re-score
              </button>
            </div>
          )}

          {/* Project KPIs */}
          <KpiRow
            cards={[
              { label: "Project", value: projectData.project_meta.project_id, color: "var(--navy)" },
              {
                label: "Type",
                value: `${projectData.project_meta.project_type} · ${projectData.project_meta.spatial_type}`,
                color: "var(--steel)",
              },
              {
                label: "State / District",
                value: `${projectData.project_meta.state} / ${projectData.project_meta.district}`,
                color: "var(--navy)",
              },
              { label: "Parcels", value: projectData.kpis.n_parcels.toLocaleString(), color: "var(--steel)" },
              { label: "Aggregate Risk", value: `${(projectData.kpis.avg_risk * 100).toFixed(0)}%`, color: "var(--navy)" },
            ]}
          />

          {/* Metadata Line */}
          <div className="bg-[var(--bg-card)] px-4 py-2.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)] flex flex-wrap items-center justify-between gap-2 shadow-2xs transition-colors">
            <div>
              Affected families: <strong className="text-[var(--text-primary)]">{projectData.project_meta.affected_families}</strong> ·
              Compensation: <strong className="text-[var(--text-primary)]">{projectData.project_meta.compensation_status}</strong> ·
              Rehab: <strong className="text-[var(--text-primary)]">{projectData.project_meta.rehab_progress_pct}%</strong> ·
              Responsiveness: <strong className="text-[var(--text-primary)]">{projectData.project_meta.stakeholder_responsiveness}</strong>
            </div>
            <div>
              Risk mix: RED {projectData.kpis.red} · YELLOW {projectData.kpis.yellow} · GREEN {projectData.kpis.green} | Avg expected overrun:{" "}
              <strong className="text-[var(--navy)]">{projectData.kpis.avg_overrun} days</strong>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StageDelayChart data={projectData.stage_bottleneck} />
            <SegmentProfileChart data={projectData.segment_profile} />
          </div>

          {/* Project SHAP Risk Drivers Analysis */}
          {projectData.project_shap && projectData.project_shap.length > 0 && (
            <ShapBarChart
              factors={projectData.project_shap}
              title="Project Risk Drivers — Aggregate SHAP Analysis"
            />
          )}

          {/* Timeline Chart */}
          <StageTimelineChart data={projectData.timeline} />

          {/* Parcels Table */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xs overflow-hidden my-4 transition-colors">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--navy)]">Parcels in Project</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-right">Risk Score</th>
                    <th className="p-3 text-right">Expected Overrun</th>
                    <th className="p-3">Current Stage</th>
                    <th className="p-3 text-right">Ongoing Overrun</th>
                    <th className="p-3 text-center">Court Stay</th>
                    <th className="p-3">Compensation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {paginatedParcels.map((parcel) => {
                    const isExpanded = expandedParcelId === parcel.parcel_id;
                    return (
                      <React.Fragment key={parcel.parcel_id}>
                        <tr
                          onClick={() => setExpandedParcelId(isExpanded ? null : parcel.parcel_id)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? "bg-[var(--bg-surface-hover)]" : "hover:bg-[var(--bg-surface)]"
                          }`}
                        >
                          <td className="p-3 font-semibold text-[var(--navy)]">{parcel.parcel_id}</td>
                          <td className="p-3">
                            <RiskBadge level={parcel.risk_level} />
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[var(--text-primary)]">{(parcel.risk_score * 100).toFixed(0)}%</td>
                          <td className="p-3 text-right font-mono text-[var(--text-primary)]">{parcel.expected_overrun_days.toFixed(0)} d</td>
                          <td className="p-3 text-[var(--text-muted)]">{parcel.current_stage || "—"}</td>
                          <td className="p-3 text-right font-mono text-[var(--color-loss)]">
                            {parcel.overrun_while_ongoing_days ? `${parcel.overrun_while_ongoing_days.toFixed(0)} d` : "—"}
                          </td>
                          <td className="p-3 text-center text-[var(--text-primary)]">{parcel.court_stay === 1 ? "Yes" : "No"}</td>
                          <td className="p-3 capitalize text-[var(--text-primary)]">{parcel.compensation_status}</td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 border-b border-[var(--border)]">
                              <ParcelPanel parcelId={parcel.parcel_id} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalParcels}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
