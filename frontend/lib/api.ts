import {
  PortfolioRow,
  PortfolioSummary,
  ProjectDetailResponse,
  ParcelContract,
  AlertsResponse,
  TrendsResponse,
  CompareResponse,
  AreaResponse,
  VillageInfo,
} from "./types";

export async function fetchPortfolio(filters?: {
  state?: string;
  district?: string;
  project_type?: string;
  risk_level?: string[];
}): Promise<PortfolioRow[]> {
  const params = new URLSearchParams();
  if (filters?.state && filters.state !== "All") params.append("state", filters.state);
  if (filters?.district && filters.district !== "All") params.append("district", filters.district);
  if (filters?.project_type && filters.project_type !== "All") params.append("project_type", filters.project_type);
  if (filters?.risk_level) {
    filters.risk_level.forEach((r) => params.append("risk_level", r));
  }
  const res = await fetch(`/api/portfolio?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await fetch("/api/portfolio/summary");
  if (!res.ok) throw new Error("Failed to fetch portfolio summary");
  return res.json();
}

export async function refreshPortfolioCache(): Promise<void> {
  const res = await fetch("/api/portfolio/refresh", { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh portfolio cache");
}

export async function fetchProjects(): Promise<any[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetailResponse> {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
  if (!res.ok) throw new Error(`Project ${projectId} not found`);
  return res.json();
}

export async function updateProjectOverride(
  projectId: string,
  compensationStatus: string,
  rehabProgressPct: number
): Promise<void> {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compensation_status: compensationStatus,
      rehab_progress_pct: rehabProgressPct,
    }),
  });
  if (!res.ok) throw new Error("Failed to save project state override");
}

export async function fetchParcelDetail(
  parcelId: string,
  whatif?: { court_stay?: number; compensation_status?: string }
): Promise<ParcelContract> {
  const params = new URLSearchParams();
  if (whatif?.court_stay !== undefined) params.append("court_stay", whatif.court_stay.toString());
  if (whatif?.compensation_status) params.append("compensation_status", whatif.compensation_status);
  const res = await fetch(`/api/parcels/${encodeURIComponent(parcelId)}?${params.toString()}`);
  if (!res.ok) throw new Error(`Parcel ${parcelId} not found`);
  return res.json();
}

export async function fetchAlerts(): Promise<AlertsResponse> {
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchTrends(): Promise<TrendsResponse> {
  const res = await fetch("/api/trends");
  if (!res.ok) throw new Error("Failed to fetch trends");
  return res.json();
}

export async function fetchCompare(col: "district" | "project_id", a: string, b: string): Promise<CompareResponse> {
  const params = new URLSearchParams({ col, a, b });
  const res = await fetch(`/api/compare?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch compare data");
  return res.json();
}

export async function fetchArea(state: string, district: string, village: string, radiusKm: number): Promise<AreaResponse> {
  const params = new URLSearchParams({
    state,
    district,
    village,
    radius_km: radiusKm.toString(),
  });
  const res = await fetch(`/api/area?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch area catchment data");
  return res.json();
}

export async function fetchVillages(): Promise<VillageInfo[]> {
  const res = await fetch("/api/villages");
  if (!res.ok) throw new Error("Failed to fetch villages");
  return res.json();
}

export async function createNewProject(payload: {
  project_type: string;
  spatial_type: string;
  affected_families: number;
  parcel_ids: string[];
}): Promise<{ project_id: string; parcels_created: number; missing_ids: string[]; project_shap?: [string, number][] }> {
  const res = await fetch("/api/projects/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create project");
  }
  return res.json();
}

export async function resetUserData(): Promise<void> {
  const res = await fetch("/api/projects/user/reset", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to reset user projects");
}
