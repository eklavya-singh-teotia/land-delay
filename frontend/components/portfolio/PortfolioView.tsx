"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchPortfolio } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiRow } from "@/components/shared/KpiCard";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { getRiskLevel } from "@/lib/colors";

const PAGE_SIZE = 25;

export function PortfolioView() {
  const router = useRouter();

  const [stateFilter, setStateFilter] = useState<string>("All");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [riskLevels, setRiskLevels] = useState<string[]>(["RED", "YELLOW", "GREEN"]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: rawPortfolio, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => fetchPortfolio(),
  });

  if (isLoading || !rawPortfolio) {
    return <LoadingSpinner text="Loading portfolio risk table..." />;
  }

  // Cascading lists
  const states = ["All", ...Array.from(new Set(rawPortfolio.map((p) => p.state))).sort()];
  const filteredByState = stateFilter === "All" ? rawPortfolio : rawPortfolio.filter((p) => p.state === stateFilter);

  const districts = ["All", ...Array.from(new Set(filteredByState.map((p) => p.district))).sort()];
  const filteredByDistrict =
    districtFilter === "All" ? filteredByState : filteredByState.filter((p) => p.district === districtFilter);

  const types = ["All", ...Array.from(new Set(filteredByDistrict.map((p) => p.project_type))).sort()];
  const filteredByType = typeFilter === "All" ? filteredByDistrict : filteredByDistrict.filter((p) => p.project_type === typeFilter);

  const filteredData = filteredByType.filter((p) => riskLevels.includes(p.risk_level));

  // Aggregate project table data
  const projectMap: Record<
    string,
    {
      project_id: string;
      type: string;
      spatial: string;
      state: string;
      district: string;
      n_parcels: number;
      sum_risk: number;
      red: number;
      sum_overrun: number;
    }
  > = {};

  filteredData.forEach((row) => {
    const pid = row.project_id;
    if (!projectMap[pid]) {
      projectMap[pid] = {
        project_id: pid,
        type: row.project_type,
        spatial: row.spatial_type,
        state: row.state_code,
        district: row.district,
        n_parcels: 0,
        sum_risk: 0,
        red: 0,
        sum_overrun: 0,
      };
    }
    projectMap[pid].n_parcels += 1;
    projectMap[pid].sum_risk += row.risk_score;
    if (row.risk_level === "RED") projectMap[pid].red += 1;
    projectMap[pid].sum_overrun += row.expected_overrun_days || 0;
  });

  const projectTable = Object.values(projectMap)
    .map((p) => {
      const avg_risk = (p.sum_risk / p.n_parcels);
      const avg_overrun = p.sum_overrun / p.n_parcels;
      return {
        ...p,
        avg_risk,
        avg_overrun,
        level: getRiskLevel(avg_risk),
      };
    })
    .sort((a, b) => b.avg_risk - a.avg_risk);

  const totalPages = Math.ceil(projectTable.length / PAGE_SIZE);
  const paginatedProjects = projectTable.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const redCount = filteredData.filter((p) => p.risk_level === "RED").length;
  const yelCount = filteredData.filter((p) => p.risk_level === "YELLOW").length;
  const avgRisk = filteredData.length
    ? ((filteredData.reduce((acc, p) => acc + p.risk_score, 0) / filteredData.length) * 100).toFixed(0) + "%"
    : "0%";

  const kpis = [
    { label: "Projects", value: projectTable.length.toLocaleString(), color: "#1F4E79" },
    { label: "Live parcels", value: filteredData.length.toLocaleString(), color: "#4A90A4" },
    { label: "RED", value: redCount.toLocaleString(), color: "#C62828" },
    { label: "YELLOW", value: yelCount.toLocaleString(), color: "#E8A33D" },
    { label: "Avg risk", value: avgRisk, color: "#1F4E79" },
  ];

  const handleRiskLevelToggle = (lvl: string) => {
    setCurrentPage(1);
    if (riskLevels.includes(lvl)) {
      if (riskLevels.length > 1) setRiskLevels(riskLevels.filter((r) => r !== lvl));
    } else {
      setRiskLevels([...riskLevels, lvl]);
    }
  };

  return (
    <div>
      <PageHeader
        title="Portfolio Risk Table"
        subtitle="Multi-state interactive risk matrix and project table"
      />

      {/* Cascading Filter Bar */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-colors">
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            State
          </label>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setDistrictFilter("All");
              setTypeFilter("All");
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            District
          </label>
          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setTypeFilter("All");
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Project Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Risk Level
          </label>
          <div className="flex items-center gap-1.5 pt-0.5">
            {["RED", "YELLOW", "GREEN"].map((lvl) => {
              const active = riskLevels.includes(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => handleRiskLevelToggle(lvl)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                    active
                      ? "bg-[#1F4E79] text-white"
                      : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border)]"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <KpiRow cards={kpis} />

      {/* Projects Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xs overflow-hidden my-4 transition-colors">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--navy)]">Projects</h2>
          <span className="text-xs text-[var(--text-muted)]">Click any row to open project details</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Project ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Spatial</th>
                <th className="p-3">State</th>
                <th className="p-3">District</th>
                <th className="p-3 text-right">Parcels</th>
                <th className="p-3 text-right">Avg Risk</th>
                <th className="p-3 text-right">RED</th>
                <th className="p-3 text-right">Avg Overrun</th>
                <th className="p-3 text-center">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedProjects.map((row) => (
                <tr
                  key={row.project_id}
                  onClick={() => router.push(`/projects?id=${encodeURIComponent(row.project_id)}`)}
                  className="hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-semibold text-[var(--navy)]">{row.project_id}</td>
                  <td className="p-3 text-[var(--text-primary)]">{row.type}</td>
                  <td className="p-3 text-[var(--text-muted)]">{row.spatial}</td>
                  <td className="p-3 text-[var(--text-primary)]">{row.state}</td>
                  <td className="p-3 text-[var(--text-primary)]">{row.district}</td>
                  <td className="p-3 text-right font-medium text-[var(--text-primary)]">{row.n_parcels}</td>
                  <td className="p-3 text-right font-mono font-bold text-[var(--navy)]">
                    {(row.avg_risk * 100).toFixed(0)}%
                  </td>
                  <td className="p-3 text-right font-bold text-[var(--color-loss)]">{row.red}</td>
                  <td className="p-3 text-right font-mono text-[var(--text-muted)]">
                    {row.avg_overrun.toFixed(0)} d
                  </td>
                  <td className="p-3 text-center">
                    <RiskBadge level={row.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={projectTable.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
