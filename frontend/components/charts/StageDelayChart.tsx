"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COLORS } from "@/lib/colors";

export function StageDelayChart({ data }: { data: { stage: string; avg_delay_prob: number }[] }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
      <h3 className="text-sm font-bold text-[#1F4E79] mb-3">
        Per-stage Delay
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, "P(delay)"]} />
            <Bar dataKey="avg_delay_prob" fill={COLORS.steel} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.avg_delay_prob > 0.7 ? COLORS.red : entry.avg_delay_prob > 0.4 ? COLORS.yellow : COLORS.steel} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
