"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Stage } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function RiskByStateChart({ data }: { data: { state: string; avg_risk: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Average risk by state</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${(Number(v) * 100).toFixed(0)}%`, "Avg Risk"]} />
            <Bar dataKey="avg_risk" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StageProbChart({ data }: { data: { stage: Stage; avg_prob: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Mean delay probability per stage</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, "P(delay)"]} />
            <Bar dataKey="avg_prob" fill="var(--steel)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RiskByTypeChart({ data }: { data: { project_type: string; avg_risk: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Average risk by project type</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="project_type" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${(Number(v) * 100).toFixed(0)}%`, "Avg Risk"]} />
            <Bar dataKey="avg_risk" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TopDistrictsChart({ data }: { data: { district: string; avg_risk: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Top districts by average risk</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis type="category" dataKey="district" tick={{ fontSize: 10, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${(Number(v) * 100).toFixed(0)}%`, "Avg Risk"]} />
            <Bar dataKey="avg_risk" fill="var(--color-purple)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HistoricalOverrunChart({ data }: { data: { stage: Stage; mean_delay_days: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs my-4 transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Historical mean overrun per stage (completed projects)
      </h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} days`, "Mean Overrun"]} />
            <Bar dataKey="mean_delay_days" fill="var(--color-loss)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HeatmapChart({ data }: { data: { district: string; stage: Stage; avg_prob: number }[] }) {
  const stages: Stage[] = ["SIA", "NOTIFICATION", "DECLARATION", "AWARD", "POSSESSION"];
  const districts = Array.from(new Set(data.map((d) => d.district)));

  const map: Record<string, Record<string, number>> = {};
  data.forEach((item) => {
    if (!map[item.district]) map[item.district] = {};
    map[item.district][item.stage] = item.avg_prob;
  });

  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs my-4 overflow-x-auto transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Heat map — delay probability by district × stage
      </h3>
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
            <th className="p-2 text-left text-[var(--text-muted)] font-bold">District</th>
            {stages.map((s) => (
              <th key={s} className="p-2 text-[var(--text-muted)] font-bold">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {districts.map((dist) => (
            <tr key={dist} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-hover)]">
              <td className="p-2 text-left font-semibold text-[var(--navy)]">{dist}</td>
              {stages.map((s) => {
                const prob = map[dist]?.[s] ?? 0;
                const intensity = Math.min(Math.max(prob, 0), 1);
                const bg = `rgba(225, 29, 72, ${Math.max(0.1, intensity * 0.85).toFixed(2)})`;
                const textColor = intensity > 0.4 ? "#ffffff" : "var(--text-primary)";

                return (
                  <td
                    key={s}
                    className="p-2 font-mono text-[11px] font-bold transition-colors"
                    style={{ backgroundColor: bg, color: textColor }}
                  >
                    {(prob * 100).toFixed(0)}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

