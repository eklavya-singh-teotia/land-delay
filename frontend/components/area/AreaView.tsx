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
        { label: "Avg Risk Score", value: areaData.kpis.avg_risk.toFixed(2), color: "#4A90A4" },
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
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
            }}
            className="w-full text-xs bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-[#1A1A1A] font-semibold"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full text-xs bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-[#1A1A1A] font-semibold"
          >
            {filteredDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Center Village
          </label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full text-xs bg-[#F5F7FA] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-[#1A1A1A] font-semibold"
          >
            {filteredVillages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
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
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
              <h3 className="text-sm font-bold text-[#1F4E79] mb-3">Risk-factor prevalence in the area</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={areaData.factors} margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip formatter={(v: any) => [`${v} parcels`, "Affected"]} />
                    <Bar dataKey="count" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Parcels Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden my-4">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F4E79]">Riskiest parcels in area</h3>
              <span className="text-xs text-[#6B7280]">Click any row to view details</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F7FA] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
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
                <tbody className="divide-y divide-[#E2E8F0]">
                  {areaData.parcels.map((parcel) => {
                    const isExpanded = expandedParcelId === parcel.parcel_id;
                    return (
                      <React.Fragment key={parcel.parcel_id}>
                        <tr
                          onClick={() => setExpandedParcelId(isExpanded ? null : parcel.parcel_id)}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? "bg-[#EBF2F8]" : "hover:bg-[#F5F7FA]"
                          }`}
                        >
                          <td className="p-3 font-semibold text-[#1F4E79]">{parcel.parcel_id}</td>
                          <td className="p-3">
                            <RiskBadge level={parcel.risk_level} />
                          </td>
                          <td className="p-3 text-right font-mono font-bold">{parcel.risk_score.toFixed(3)}</td>
                          <td className="p-3 text-right font-mono">{parcel.expected_overrun_days.toFixed(0)} d</td>
                          <td className="p-3 text-[#1A1A1A]">{parcel.village}</td>
                          <td className="p-3 text-center">{parcel.court_stay === 1 ? "⚠️ Yes" : "No"}</td>
                          <td className="p-3 capitalize">{parcel.compensation_status}</td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 border-b border-[#E2E8F0]">
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
