"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function StageDelayChart({ data }: { data: { stage: string; avg_delay_prob: number }[] }) {
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
      <h3 className="text-sm font-bold text-[var(--navy)] mb-3">
        Per-stage Delay
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--chart-tooltip-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, "P(delay)"]}
            />
            <Bar dataKey="avg_delay_prob" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.avg_delay_prob > 0.7
                      ? "var(--color-loss)"
                      : entry.avg_delay_prob > 0.4
                      ? "var(--color-warning)"
                      : "var(--color-accent)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

