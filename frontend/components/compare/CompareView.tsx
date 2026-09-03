"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCompare } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiRow } from "@/components/shared/KpiCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CompareStageChart, CompareRiskMixChart } from "@/components/charts/CompareCharts";

export function CompareView() {
  const [colMode, setColMode] = useState<"district" | "project_id">("district");
  const [entityA, setEntityA] = useState<string>("");
  const [entityB, setEntityB] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["compare", colMode, entityA, entityB],
    queryFn: () => fetchCompare(colMode, entityA, entityB),
  });

  const entities = data?.entities || [];

  // Update selection when mode changes or entities load
  React.useEffect(() => {
    if (entities.length >= 2) {
      if (!entityA || !entities.includes(entityA)) setEntityA(entities[0]);
      if (!entityB || !entities.includes(entityB) || entityB === entityA) {
        const other = entities.find((e) => e !== (entityA || entities[0]));
        if (other) setEntityB(other);
      }
    }
  }, [entities, colMode, entityA, entityB]);

  if (isLoading || !data) {
    return <LoadingSpinner text="Loading comparative analytics..." />;
  }

  const sa = data.a;
  const sb = data.b;

  const kpis = sa && sb
    ? [
        { label: `${sa.entity} Avg Risk`, value: sa.risk.toFixed(3), color: "#1F4E79" },
        { label: `${sb.entity} Avg Risk`, value: sb.risk.toFixed(3), color: "#4A90A4" },
        { label: "Parcels (A / B)", value: `${sa.n} / ${sb.n}`, color: "#1F4E79" },
        { label: "Avg Overrun (A / B)", value: `${sa.overrun.toFixed(0)}d / ${sb.overrun.toFixed(0)}d`, color: "#4A90A4" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Comparative Analytics"
        subtitle="Side-by-side comparative benchmarking of districts or individual infrastructure projects"
      />

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Compare By
          </label>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setColMode("district")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                colMode === "district" ? "bg-[#1F4E79] text-white" : "bg-[#F5F7FA] text-[#6B7280] hover:bg-[#E2E8F0]"
              }`}
            >
              Districts
            </button>
            <button
              onClick={() => setColMode("project_id")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                colMode === "project_id" ? "bg-[#1F4E79] text-white" : "bg-[#F5F7FA] text-[#6B7280] hover:bg-[#E2E8F0]"
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Entity A
          </label>
          <select
            value={entityA}
            onChange={(e) => setEntityA(e.target.value)}
            className="w-full text-xs font-bold text-[#1F4E79] bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5"
          >
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Entity B
          </label>
          <select
            value={entityB}
            onChange={(e) => setEntityB(e.target.value)}
            className="w-full text-xs font-bold text-[#C62828] bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5"
          >
            {entities
              .filter((e) => e !== entityA)
              .map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
          </select>
        </div>
      </div>

      {sa && sb ? (
        <div className="space-y-4">
          <KpiRow cards={kpis} />
          <CompareStageChart nameA={sa.entity} nameB={sb.entity} stagesA={sa.stages} stagesB={sb.stages} />
          <CompareRiskMixChart nameA={sa.entity} nameB={sb.entity} summaryA={sa} summaryB={sb} />
        </div>
      ) : (
        <div className="p-8 bg-white rounded-xl text-center text-xs text-[#6B7280]">
          Select two distinct entities above to generate comparative analytics.
        </div>
      )}
    </div>
  );
}
