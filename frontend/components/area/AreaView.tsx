"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVillages, fetchArea } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiRow } from "@/components/shared/KpiCard";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ParcelPanel } from "@/components/projects/ParcelPanel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "@/lib/colors";

export function AreaView() {
  const [selectedState, setSelectedState] = useState("Himachal Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState("Kangra");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [radiusKm, setRadiusKm] = useState(15);

  const [expandedParcelId, setExpandedParcelId] = useState<string | null>(null);

  // Fetch villages list
  const { data: villagesList, isLoading: loadingVillages } = useQuery({
    queryKey: ["villages"],
    queryFn: fetchVillages,
  });

  // Derived cascade options
  const states = Array.from(new Set(villagesList?.map((v) => v.state) || [])).sort();

  const filteredDistricts = Array.from(
    new Set(villagesList?.filter((v) => v.state === selectedState).map((v) => v.district) || [])
  ).sort();

  const filteredVillages = Array.from(
    new Set(
      villagesList
        ?.filter((v) => v.state === selectedState && v.district === selectedDistrict)
        .map((v) => v.village) || []
    )
  ).sort();

  // Auto-select initial village
  React.useEffect(() => {
    if (filteredVillages.length > 0 && !filteredVillages.includes(selectedVillage)) {
      setSelectedVillage(filteredVillages[0]);
    }
  }, [filteredVillages, selectedVillage]);

  // Query Catchment Area Data
  const { data: areaData, isLoading: loadingArea } = useQuery({
    queryKey: ["area", selectedState, selectedDistrict, selectedVillage, radiusKm],
    queryFn: () => fetchArea(selectedState, selectedDistrict, selectedVillage, radiusKm),
    enabled: Boolean(selectedVillage),
  });

  if (loadingVillages) {
    return <LoadingSpinner text="Loading geographical data..." />;
  }

  const kpis = areaData
    ? [
        { label: "Parcels in Area", value: areaData.kpis.parcels_in_area.toLocaleString(), color: "#1F4E79" },
        { label: "RED Parcels", value: areaData.kpis.red_count.toLocaleString(), color: "#C62828" },
        { label: "Avg Risk Score", value: `${(areaData.kpis.avg_risk * 100).toFixed(0)}%`, color: "#4A90A4" },
        {
          label: "Avg Expected Overrun",
          value: `${areaData.kpis.avg_expected_overrun.toFixed(0)} d`,
          color: "#1F4E79",
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Area of Interest (Site Catchment Analysis)"
        subtitle="Select a target center village and catchment radius to analyze localized land acquisition risk factors"
      />

      {/* Selectors */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center transition-colors">
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
            }}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {filteredDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Center Village
          </label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full text-xs bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
          >
            {filteredVillages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Radius: {radiusKm} km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-[#1F4E79]"
          />
        </div>
      </div>

      {loadingArea || !areaData ? (
        <LoadingSpinner text="Analyzing site catchment radius..." />
      ) : (
        <div className="space-y-4">
          <KpiRow cards={kpis} />

          {/* Factor Prevalence Chart */}
          {areaData.factors.length > 0 && (
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs transition-colors">
              <h3 className="text-sm font-bold text-[var(--navy)] mb-3">Risk-factor prevalence in the area</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={areaData.factors} margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
                    <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: "var(--chart-text-color)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--chart-tooltip-bg)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(v: any) => [`${v} parcels`, "Affected"]}
                    />
                    <Bar dataKey="count" fill="var(--color-purple)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Parcels Table */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xs overflow-hidden my-4 transition-colors">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--navy)]">Riskiest parcels in area</h3>
              <span className="text-xs text-[var(--text-muted)]">Click any row to view details</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="p-3">Parcel ID</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-right">Risk Score</th>
                    <th className="p-3 text-right">Expected Overrun</th>
                    <th className="p-3">Village</th>
                    <th className="p-3 text-center">Court Stay</th>
                    <th className="p-3">Compensation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {areaData.parcels.map((parcel) => {
                    const isExpanded = expandedParcelId === parcel.parcel_id;
                    return (
                      <React.Fragment key={parcel.parcel_id}>
                        <tr
                          onClick={() => setExpandedParcelId(isExpanded ? null : parcel.parcel_id)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? "bg-[var(--bg-surface-hover)]" : "hover:bg-[var(--bg-surface)]"
                          }`}
                        >
                          <td className="p-3 font-semibold text-[var(--navy)]">{parcel.parcel_id}</td>
                          <td className="p-3">
                            <RiskBadge level={parcel.risk_level} />
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[var(--text-primary)]">{(parcel.risk_score * 100).toFixed(0)}%</td>
                          <td className="p-3 text-right font-mono text-[var(--text-primary)]">{parcel.expected_overrun_days.toFixed(0)} d</td>
                          <td className="p-3 text-[var(--text-primary)]">{parcel.village}</td>
                          <td className="p-3 text-center text-[var(--text-primary)]">{parcel.court_stay === 1 ? "Yes" : "No"}</td>
                          <td className="p-3 capitalize text-[var(--text-primary)]">{parcel.compensation_status}</td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 border-b border-[var(--border)]">
                              <ParcelPanel parcelId={parcel.parcel_id} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
