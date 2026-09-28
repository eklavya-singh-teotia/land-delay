"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function StageTimelineChart({
  data,
}: {
  data: { stage: string; statutory_days: number; expected_days: number }[];
}) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs my-4 transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Timeline analysis — statutory vs expected duration per stage
      </h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--chart-tooltip-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(v: any) => [`${v} days`]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px", color: "var(--text-secondary)" }} />
            <Bar dataKey="statutory_days" name="Statutory" fill="#94a3b8" radius={[0, 4, 4, 0]} />
            <Bar dataKey="expected_days" name="Expected (Statutory + Overrun)" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

