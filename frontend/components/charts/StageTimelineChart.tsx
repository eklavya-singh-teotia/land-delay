"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/colors";

export function StageTimelineChart({
  data,
}: {
  data: { stage: string; statutory_days: number; expected_days: number }[];
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs my-4">
      <h3 className="text-sm font-bold text-[#1F4E79] mb-3">
        Timeline analysis — statutory vs expected duration per stage
      </h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip formatter={(v: any) => [`${v} days`]} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Bar dataKey="statutory_days" name="Statutory" fill="#95A5A6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="expected_days" name="Expected (Statutory + Overrun)" fill={COLORS.navy} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
