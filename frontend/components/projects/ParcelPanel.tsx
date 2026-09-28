"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchParcelDetail } from "@/lib/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { KpiRow } from "@/components/shared/KpiCard";
import { StageDelayChart } from "@/components/charts/StageDelayChart";
import { ShapBarChart } from "@/components/charts/ShapBarChart";

export function ParcelPanel({ parcelId }: { parcelId: string }) {
  const [courtStay, setCourtStay] = useState<number | undefined>(undefined);
  const [compStatus, setCompStatus] = useState<string | undefined>(undefined);

  // Baseline query
  const { data: baseline, isLoading: loadingBase } = useQuery({
    queryKey: ["parcel", parcelId],
    queryFn: () => fetchParcelDetail(parcelId),
  });

  // What-if query if inputs changed
  const isWhatIfActive = courtStay !== undefined || compStatus !== undefined;
  const { data: whatifData } = useQuery({
    queryKey: ["parcel-whatif", parcelId, courtStay, compStatus],
    queryFn: () =>
      fetchParcelDetail(parcelId, {
        court_stay: courtStay,
        compensation_status: compStatus,
      }),
    enabled: isWhatIfActive,
  });

  if (loadingBase || !baseline) {
    return <LoadingSpinner text={`Loading parcel ${parcelId} details...`} />;
  }

  const current = isWhatIfActive && whatifData ? whatifData : baseline;

  const currentStayVal = courtStay !== undefined ? courtStay : baseline.top_factors.some((f) => f[0] === "court_stay" && f[1] > 0) ? 1 : 0;
  const currentCompVal = compStatus !== undefined ? compStatus : "pending";

  const kpis = [
    { label: "Risk Score", value: `${(current.risk_score * 100).toFixed(0)}%`, color: "#1F4E79" },
    {
      label: "Risk Level",
      value: current.risk_level,
      color: current.risk_level === "RED" ? "#C62828" : current.risk_level === "YELLOW" ? "#E8A33D" : "#2E7D32",
    },
    { label: "Expected Overrun", value: `${current.expected_overrun_days.toFixed(0)} days`, color: "#4A90A4" },
    {
      label: "Ongoing Overrun",
      value: current.overrun_while_ongoing_days ? `${current.overrun_while_ongoing_days.toFixed(0)} d` : "—",
      color: "#C62828",
    },
  ];

  const stageData = Object.entries(current.stages).map(([stage, details]) => ({
    stage,
    avg_delay_prob: details.delay_prob,
  }));

  return (
    <div className="bg-[#F5F7FA] p-5 rounded-xl border border-[#E2E8F0] my-3 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1F4E79] text-base">Parcel: {parcelId}</span>
          <RiskBadge level={current.risk_level} />
        </div>
        <span className="text-xs text-[#6B7280]">Parcel Details & What-If Simulator</span>
      </div>

      {/* KPIs */}
      <KpiRow cards={kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StageDelayChart data={stageData} />
        <ShapBarChart factors={current.top_factors} />
      </div>

      {/* Recommended Actions */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider mb-2">
          Recommended Actions
        </h4>
        <ul className="space-y-1.5 text-xs text-[#1A1A1A]">
          {current.recommended_actions.map((act, i) => {
            const badgeColor = act.priority_label === "high" ? "bg-[#C62828]" : act.priority_label === "medium" ? "bg-[#E8A33D]" : "bg-[#2E7D32]";
            return (
              <li key={i} className="flex items-start gap-2">
                <span className={`text-[9px] font-bold text-white uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>{act.priority_label}</span>
                <span>
                  <strong className="text-[#1F4E79]">{act.factor}</strong> — {act.action}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* What-if Simulator */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider mb-3">
          What-if Simulator
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Court Stay</label>
            <select
              value={currentStayVal}
              onChange={(e) => setCourtStay(Number(e.target.value))}
              className="w-full text-xs bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-[#1A1A1A]"
            >
              <option value={0}>No (0)</option>
              <option value={1}>Yes (1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Compensation Status</label>
            <select
              value={currentCompVal}
              onChange={(e) => setCompStatus(e.target.value)}
              className="w-full text-xs bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-[#1A1A1A]"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isWhatIfActive && (
          <div className="mt-3 p-2.5 bg-[#EBF2F8] rounded-md text-xs font-medium text-[#1F4E79] flex items-center justify-between">
            <span>
              Simulated Level: <strong>{baseline.risk_level}</strong> → <strong>{current.risk_level}</strong>
            </span>
            <span>
              Risk Delta: <strong>{(current.risk_score - baseline.risk_score).toFixed(3)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
