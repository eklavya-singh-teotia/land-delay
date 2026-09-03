"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/colors";

export function SegmentProfileChart({ data }: { data: { village: string; avg_risk: number; count: number }[] }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
      <h3 className="text-sm font-bold text-[#1F4E79] mb-3">
        Risk by village
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 15, left: 40, bottom: 5 }}>
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis type="category" dataKey="village" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip formatter={(v: any) => [Number(v).toFixed(3), "Avg Risk"]} />
            <Bar dataKey="avg_risk" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
