"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CompareEntitySummary, Stage } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function CompareStageChart({
  nameA,
  nameB,
  stagesA,
  stagesB,
}: {
  nameA: string;
  nameB: string;
  stagesA: { stage: Stage; avg_prob: number }[];
  stagesB: { stage: Stage; avg_prob: number }[];
}) {
  const stages: Stage[] = ["SIA", "NOTIFICATION", "DECLARATION", "AWARD", "POSSESSION"];
  const mapA = Object.fromEntries(stagesA.map((s) => [s.stage, s.avg_prob]));
  const mapB = Object.fromEntries(stagesB.map((s) => [s.stage, s.avg_prob]));

  const data = stages.map((stage) => ({
    stage,
    [nameA]: mapA[stage] ?? 0,
    [nameB]: mapB[stage] ?? 0,
  }));

  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs my-4 transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Stage delay probability comparison
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`]} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "var(--text-secondary)" }} />
            <Bar dataKey={nameA} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey={nameB} fill="var(--color-loss)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CompareRiskMixChart({
  nameA,
  nameB,
  summaryA,
  summaryB,
}: {
  nameA: string;
  nameB: string;
  summaryA: CompareEntitySummary;
  summaryB: CompareEntitySummary;
}) {
  const data = [
    { level: "RED", [nameA]: summaryA.red, [nameB]: summaryB.red },
    { level: "YELLOW", [nameA]: summaryA.yel, [nameB]: summaryB.yel },
    { level: "GREEN", [nameA]: summaryA.grn, [nameB]: summaryB.grn },
  ];

  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs my-4 transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Risk level distribution (parcels count)
      </h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="level" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "var(--text-secondary)" }} />
            <Bar dataKey={nameA} fill="var(--steel)" radius={[4, 4, 0, 0]} />
            <Bar dataKey={nameB} fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

