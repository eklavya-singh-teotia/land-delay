"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function SegmentProfileChart({ data }: { data: { village: string; avg_risk: number; count: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Risk by village
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 15, left: 40, bottom: 5 }}>
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis type="category" dataKey="village" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--chart-tooltip-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(v: any) => [Number(v).toFixed(3), "Avg Risk"]}
            />
            <Bar dataKey="avg_risk" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

