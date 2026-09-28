import React from "react";
import { RiskLevel } from "@/lib/types";
import { RISK_COLORS, RISK_EMOJI } from "@/lib/colors";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const bg = RISK_COLORS[level] || "#888888";
  const emoji = RISK_EMOJI[level] || "";

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
      style={{ backgroundColor: bg }}
    >
      <span>{level}</span>
    </span>
  );
}
