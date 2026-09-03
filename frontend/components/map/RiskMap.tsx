"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { getRiskColor, getRiskLevel } from "@/lib/colors";
import { RiskBadge } from "@/components/shared/RiskBadge";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

// Centroids for HP, PB, UK districts
const DISTRICT_CENTROIDS: Record<string, [number, number]> = {
  Bilaspur: [31.33, 76.75], Chamba: [32.55, 76.13], Hamirpur: [31.68, 76.52],
  Kangra: [32.1, 76.27], Kinnaur: [31.6, 78.4], Kullu: [31.96, 77.11],
  "Lahaul and Spiti": [32.5, 77.6], Mandi: [31.71, 76.93], Shimla: [31.1, 77.17],
  Sirmaur: [30.75, 77.55], Solan: [30.9, 77.1], Una: [31.47, 76.27],
  Amritsar: [31.63, 74.87], Barnala: [30.37, 75.55], Bathinda: [30.21, 74.94],
  Faridkot: [30.67, 74.76], "Fatehgarh Sahib": [30.64, 76.39], Fazilka: [30.4, 74.03],
  Ferozepur: [30.93, 74.61], Gurdaspur: [32.04, 75.4], Hoshiarpur: [31.53, 75.91],
  Jalandhar: [31.33, 75.58], Kapurthala: [31.38, 75.38], Ludhiana: [30.9, 75.85],
  Malerkotla: [30.53, 75.88], Mansa: [29.99, 75.4], Moga: [30.81, 75.17],
  "Sri Muktsar Sahib": [30.47, 74.52], Pathankot: [32.27, 75.65], Patiala: [30.34, 76.39],
  Rupnagar: [30.97, 76.53], "SAS Nagar": [30.7, 76.72], Sangrur: [30.24, 75.83],
  "SBS Nagar": [31.12, 76.13], "Tarn Taran": [31.45, 74.92], Almora: [29.6, 79.66],
  Bageshwar: [29.84, 79.77], Chamoli: [30.41, 79.33], Champawat: [29.33, 80.1],
  Dehradun: [30.32, 78.03], Haridwar: [29.95, 78.16], Nainital: [29.38, 79.46],
  "Pauri Garhwal": [30.15, 78.78], Pithoragarh: [29.58, 80.21], Rudraprayag: [30.29, 78.98],
  "Tehri Garhwal": [30.38, 78.48], "Udham Singh Nagar": [28.98, 79.41], Uttarkashi: [30.73, 78.44],
};

// Tile providers
const TILE_PROVIDERS = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri World Imagery",
  },
};

// Helper to create clusterable colored Leaflet icons
const createCustomPin = (color: string) =>
  L.divIcon({
    className: "custom-point-pin",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

type RiskFilterOption = "ALL" | "LOW" | "MODERATE" | "HIGH";

interface RiskMapProps {
  projects: any[];
  portfolio: any[];
}

export default function RiskMap({ projects, portfolio }: RiskMapProps) {
  const router = useRouter();
  const [tileMode, setTileMode] = useState<"light" | "satellite">("light");
  const [riskFilter, setRiskFilter] = useState<RiskFilterOption>("ALL");

  // Compute average risk per project
  const projectRiskMap: Record<string, number> = {};
  portfolio.forEach((p) => {
    if (!projectRiskMap[p.project_id]) {
      const projParcels = portfolio.filter((item) => item.project_id === p.project_id);
      const avg = projParcels.reduce((acc, curr) => acc + curr.risk_score, 0) / projParcels.length;
      projectRiskMap[p.project_id] = avg;
    }
  });

  // Filter helper logic
  const passesFilter = (avgRisk: number) => {
    if (riskFilter === "ALL") return true;
    if (riskFilter === "LOW") return avgRisk < 0.40;
    if (riskFilter === "MODERATE") return avgRisk >= 0.40 && avgRisk <= 0.70;
    if (riskFilter === "HIGH") return avgRisk > 0.70;
    return true;
  };

  // Separate and filter projects
  const pointProjects = projects.filter(
    (p) => p.spatial_type === "point" && passesFilter(projectRiskMap[p.project_id] || 0.5)
  );
  
  const linearProjects = projects.filter(
    (p) => p.spatial_type === "linear" && passesFilter(projectRiskMap[p.project_id] || 0.5)
  );

  const activeCount = pointProjects.length + linearProjects.length;

  return (
    <div className="h-[550px] w-full rounded-xl overflow-hidden border border-[#E2E8F0] shadow-2xs relative z-0">
      
      {/* Floating Risk Filter Bar */}
      <div className="absolute top-3 left-14 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E2E8F0] shadow-md flex items-center space-x-2 text-[12px] font-medium">
        <div className="flex items-center text-[#1F4E79] pr-3 border-r border-slate-200">
          <span className="font-bold">Filter Risk ({activeCount})</span>
        </div>
        
        <button
          onClick={() => setRiskFilter("ALL")}
          className={`px-3 py-1 rounded-full transition-all ${
            riskFilter === "ALL" ? "bg-slate-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Projects
        </button>
        
        <button
          onClick={() => setRiskFilter("HIGH")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            riskFilter === "HIGH" ? "bg-[#DC2626] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${riskFilter === "HIGH" ? "bg-white" : "bg-[#DC2626]"}`} />
          Red (&gt;0.70)
        </button>
        
        <button
          onClick={() => setRiskFilter("MODERATE")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            riskFilter === "MODERATE" ? "bg-[#D97706] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${riskFilter === "MODERATE" ? "bg-white" : "bg-[#D97706]"}`} />
          Yellow (0.40–0.70)
        </button>
        
        <button
          onClick={() => setRiskFilter("LOW")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            riskFilter === "LOW" ? "bg-[#16A34A] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${riskFilter === "LOW" ? "bg-white" : "bg-[#16A34A]"}`} />
          Green (&lt;0.40)
        </button>
      </div>

      {/* Floating Tile Switcher */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md p-1 rounded-lg border border-[#E2E8F0] shadow-xs flex space-x-1 text-[11px]">
        <button
          onClick={() => setTileMode("light")}
          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
            tileMode === "light" ? "bg-[#1F4E79] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Light Map
        </button>
        <button
          onClick={() => setTileMode("satellite")}
          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
            tileMode === "satellite" ? "bg-[#1F4E79] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={[31.1, 76.9]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={TILE_PROVIDERS[tileMode].attribution}
          url={TILE_PROVIDERS[tileMode].url}
        />

        {/* Linear Projects */}
        {linearProjects.map((p) => {
          let path: [number, number][] = [];
          try {
            path = JSON.parse(p.coord_path || "[]");
          } catch (e) {
            path = [];
          }
          if (path.length === 0) return null;

          const avgRisk = projectRiskMap[p.project_id] || 0.5;
          const color = getRiskColor(avgRisk);

          return (
            <Polyline
              key={p.project_id}
              positions={path}
              pathOptions={{ color: color, weight: 4, opacity: 0.9 }}
              eventHandlers={{
                click: () => router.push(`/projects?id=${encodeURIComponent(p.project_id)}`),
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 p-1">
                  <strong className="text-[#1F4E79] font-bold text-sm block">{p.project_id}</strong>
                  <div>Type: {p.project_type} (Corridor)</div>
                  <div>State: {p.state}</div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span>Avg Risk: <strong>{avgRisk.toFixed(2)}</strong></span>
                    <RiskBadge level={getRiskLevel(avgRisk)} />
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Point Projects (Marker Cluster) */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {pointProjects.map((p) => {
            const coords = DISTRICT_CENTROIDS[p.district];
            if (!coords) return null;
            const avgRisk = projectRiskMap[p.project_id] || 0.5;
            const color = getRiskColor(avgRisk);

            return (
              <Marker
                key={p.project_id}
                position={coords}
                icon={createCustomPin(color)}
                eventHandlers={{
                  click: () => router.push(`/projects?id=${encodeURIComponent(p.project_id)}`),
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <strong className="text-[#1F4E79] font-bold text-sm block">{p.project_id}</strong>
                    <div>Type: {p.project_type} (Point)</div>
                    <div>District: {p.district}</div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span>Avg Risk: <strong>{avgRisk.toFixed(2)}</strong></span>
                      <RiskBadge level={getRiskLevel(avgRisk)} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}