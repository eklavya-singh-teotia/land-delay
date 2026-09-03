"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { COLORS } from "@/lib/colors";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface FeatureInfo {
  label: string;
  description: (val: number) => string;
}

const FEATURE_MAP: Record<string, FeatureInfo> = {
  court_stay: {
    label: "Court Cases",
    description: (val) =>
      val > 0
        ? "Active court cases may delay the acquisition process."
        : "No active court cases reported.",
  },

  compensation_status: {
    label: "Compensation",
    description: (val) =>
      val > 0
        ? "Pending compensation may delay the acquisition process."
        : "Compensation is fully settled or on track.",
  },

  affected_families: {
    label: "Affected Families",
    description: (val) =>
      val > 0
        ? "More affected families can increase rehabilitation and coordination requirements."
        : "Few families are affected.",
  },

  stakeholder_responsiveness: {
    label: "Admin Response",
    description: (val) =>
      val > 0
        ? "Slow administrative response may extend acquisition timelines."
        : "Administrative coordination is proceeding smoothly.",
  },

  pending_mutations: {
    label: "Land Records",
    description: (val) =>
      val > 0
        ? "Unresolved land records may delay ownership verification."
        : "Land records are clear.",
  },

  area_sqm: {
    label: "Land Area",
    description: (val) =>
      val > 0
        ? "Larger land areas may require more surveying and valuation work."
        : "Small land area reduces surveying requirements.",
  },

  land_class: {
    label: "Land Type",
    description: (val) =>
      val > 0
        ? "Certain land types may require additional approvals."
        : "Standard land classification simplifies acquisition.",
  },

  encumbrances: {
    label: "Land Claims",
    description: (val) =>
      val > 0
        ? "Existing claims or restrictions may delay verification."
        : "No significant claims or restrictions reported.",
  },

  owner_count: {
    label: "Landowners",
    description: (val) =>
      val > 0
        ? "Multiple landowners can increase coordination and documentation."
        : "Single ownership simplifies the acquisition process.",
  },

  rehab_progress_pct: {
    label: "Rehabilitation",
    description: (val) =>
      val < 0
        ? "Good rehabilitation progress is reducing delay risk."
        : "Low rehabilitation progress may increase delay risk.",
  },

  historical_performance_score: {
    label: "District Performance",
    description: (val) =>
      val < 0
        ? "Strong past performance reduces expected delay."
        : "Poor past performance indicates higher delay risk.",
  },

  project_type: {
    label: "Project Type",
    description: (val) =>
      val > 0
        ? "This project type may involve additional approvals and coordination."
        : "Project type has a lower impact on acquisition complexity.",
  },
};

export function ShapBarChart({
  factors,
  title = "Why is this parcel at risk? (SHAP impact)",
}: {
  factors: [string, number][];
  title?: string;
}) {
  // Sort factors by absolute SHAP impact
  const sortedFactors = [...factors].sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  // Top positive SHAP factors
  const topRiskAccelerators = sortedFactors
    .filter(([, val]) => val > 0)
    .slice(0, 3);

  // Top negative SHAP factors
  const topRiskMitigators = sortedFactors
    .filter(([, val]) => val < 0)
    .slice(0, 2);

  // Convert internal feature names into human-readable labels
  const chartData = factors
    .map(([factor, value]) => ({
      factor:
        FEATURE_MAP[factor]?.label ||
        factor.replace(/_/g, " "),
      value,
    }))
    .reverse();

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="text-sm font-bold text-[#1F4E79] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1F4E79]" />
          <span>{title}</span>
        </h3>

        <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F5F7FA] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
          ML Feature Importance (SHAP)
        </span>
      </div>

      {/* Human Readable SHAP Analysis Card */}
      <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] space-y-3">
        {/* Executive Summary */}
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#1F4E79] mt-0.5 shrink-0" />

          <div>
            <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">
              Executive Risk Driver Summary
            </h4>

            <p className="text-xs text-[#334155] mt-1 leading-relaxed">
              {topRiskAccelerators.length > 0 ? (
                <>
                  The machine learning model identifies{" "}
                  <strong className="text-[#1F4E79]">
                    {FEATURE_MAP[topRiskAccelerators[0][0]]?.label ||
                      topRiskAccelerators[0][0].replace(/_/g, " ")}
                  </strong>{" "}
                  as the primary factor driving delay risk for this
                  selection, followed by{" "}
                  <strong className="text-[#1F4E79]">
                    {topRiskAccelerators[1]
                      ? FEATURE_MAP[topRiskAccelerators[1][0]]?.label ||
                        topRiskAccelerators[1][0].replace(/_/g, " ")
                      : "secondary attributes"}
                  </strong>
                  .
                </>
              ) : (
                "Feature impact values indicate balanced risk across assessed statutory parameters."
              )}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Risk Drivers */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-[#C62828] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Primary Risk Accelerators</span>
            </h5>

            <ul className="space-y-2">
              {topRiskAccelerators.map(([featKey, val]) => {
                const info = FEATURE_MAP[featKey] || {
                  label: featKey.replace(/_/g, " ").toUpperCase(),
                  description: () =>
                    "Elevates estimated statutory overrun risk.",
                };

                return (
                  <li
                    key={featKey}
                    className="bg-white p-2.5 rounded-md border border-red-100 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                      <span>{info.label}</span>

                      <span className="font-mono text-[11px] font-bold text-[#C62828] bg-red-50 px-1.5 py-0.5 rounded">
                        +{val.toFixed(2)} SHAP
                      </span>
                    </div>

                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      {info.description(val)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mitigating Factors */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mitigating Risk Stabilizers</span>
            </h5>

            {topRiskMitigators.length > 0 ? (
              <ul className="space-y-2">
                {topRiskMitigators.map(([featKey, val]) => {
                  const info = FEATURE_MAP[featKey] || {
                    label: featKey.replace(/_/g, " ").toUpperCase(),
                    description: () =>
                      "Helps reduce overall delay probability.",
                  };

                  return (
                    <li
                      key={featKey}
                      className="bg-white p-2.5 rounded-md border border-emerald-100 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                        <span>{info.label}</span>

                        <span className="font-mono text-[11px] font-bold text-[#2E7D32] bg-emerald-50 px-1.5 py-0.5 rounded">
                          {val.toFixed(2)} SHAP
                        </span>
                      </div>

                      <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                        {info.description(val)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="bg-white p-2.5 rounded-md border border-[#E2E8F0] text-[11px] text-[#64748B]">
                No significant mitigating factors detected for this
                assessment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SHAP Bar Chart */}
      <div>
        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
          Delay Risk Factors(Factor-wise delay risk)
        </h4>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                top: 5,
                right: 15,
                left: 10,
                bottom: 5,
              }}
            >
              <XAxis
                type="number"
                tick={{
                  fontSize: 11,
                  fill: "#6B7280",
                }}
              />

              <YAxis
                type="category"
                dataKey="factor"
                width={130}
                tick={{
                  fontSize: 10,
                  fill: "#6B7280",
                }}
              />

              <Tooltip
                formatter={(v: any) => [
                  Number(v).toFixed(2),
                  "SHAP impact",
                ]}
              />

              <ReferenceLine
                x={0}
                stroke="#E2E8F0"
              />

              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.value >= 0
                        ? COLORS.red
                        : COLORS.steel
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}