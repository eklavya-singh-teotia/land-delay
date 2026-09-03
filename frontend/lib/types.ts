export type RiskLevel = "RED" | "YELLOW" | "GREEN";

export const STAGES = ["SIA", "NOTIFICATION", "DECLARATION", "AWARD", "POSSESSION"] as const;
export type Stage = typeof STAGES[number];

export interface StageContract {
  delay_prob: number;
  expected_overrun: number;
  statutory_days: number;
  status: "completed" | "ongoing" | "pending" | null;
  elapsed_days: number | null;
  actual_days: number | null;
  top_factors: [string, number][];
}

export interface ParcelContract {
  parcel_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  expected_overrun_days: number;
  max_delay_prob: number;
  overrun_while_ongoing_days: number | null;
  stages: Record<Stage, StageContract>;
  top_factors: [string, number][];
  recommended_actions: {
    factor: string;
    action: string;
    priority: 1 | 2 | 3;
    priority_label: "high" | "medium" | "low";
  }[];
}

export interface PortfolioRow {
  parcel_id: string;
  project_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  expected_overrun_days: number;
  max_delay_prob: number;
  SIA_prob: number;
  SIA_overrun: number;
  NOTIFICATION_prob: number;
  NOTIFICATION_overrun: number;
  DECLARATION_prob: number;
  DECLARATION_overrun: number;
  AWARD_prob: number;
  AWARD_overrun: number;
  POSSESSION_prob: number;
  POSSESSION_overrun: number;
  village: string;
  village_code: string;
  tehsil: string;
  district: string;
  district_code: string;
  state: string;
  state_code: string;
  spatial_type: "point" | "linear";
  project_type: string;
  compensation_status: string;
  land_class: string;
  affected_families: number;
  rehab_progress_pct: number;
  stakeholder_responsiveness: number;
  historical_performance_score: number;
  owner_count: number;
  area_sqm: number;
  pending_mutations: number;
  court_stay: number;
  encumbrances: number;
  lat: number;
  lon: number;
  current_stage: Stage | null;
  overrun_while_ongoing_days: number | null;
  is_user?: number;
}

export interface PortfolioSummary {
  total_projects: number;
  total_parcels: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  avg_risk: number;
}

export interface ProjectMeta {
  project_id: string;
  project_type: string;
  spatial_type: "point" | "linear";
  state: string;
  district: string;
  affected_families: number;
  compensation_status: string;
  rehab_progress_pct: number;
  stakeholder_responsiveness: number;
  coord_path?: string;
}

export interface ProjectDetailResponse {
  project_meta: ProjectMeta;
  kpis: {
    n_parcels: number;
    avg_risk: number;
    red: number;
    yellow: number;
    green: number;
    avg_overrun: number;
  };
  stage_bottleneck: { stage: Stage; avg_delay_prob: number }[];
  segment_profile: { village: string; avg_risk: number; count: number }[];
  timeline: {
    stage: Stage;
    statutory_days: number;
    expected_days: number;
    expected_overrun: number;
  }[];
  project_shap?: [string, number][];
  parcels: PortfolioRow[];
}

export interface AlertItem {
  parcel_id: string;
  alert_type: string;
  detail: string;
}

export interface NotificationLogItem {
  channel: string;
  recipient: string;
  parcel_id: string;
  alert: string;
  message: string;
}

export interface AlertsResponse {
  total_alerts: number;
  unique_parcels: number;
  alerts: AlertItem[];
  notifications: NotificationLogItem[];
}

export interface TrendsResponse {
  risk_by_state: { state: string; avg_risk: number }[];
  delay_prob_by_stage: { stage: Stage; avg_prob: number }[];
  risk_by_project_type: { project_type: string; avg_risk: number }[];
  top_districts_by_risk: { district: string; avg_risk: number }[];
  heatmap: { district: string; stage: Stage; avg_prob: number }[];
  historical_overrun: { stage: Stage; mean_delay_days: number }[];
}

export interface CompareEntitySummary {
  entity: string;
  n: number;
  risk: number;
  red: number;
  yel: number;
  grn: number;
  overrun: number;
  maxprob: number;
  stages: { stage: Stage; avg_prob: number }[];
}

export interface CompareResponse {
  col: "district" | "project_id";
  entities: string[];
  a: CompareEntitySummary | null;
  b: CompareEntitySummary | null;
}

export interface AreaResponse {
  kpis: {
    parcels_in_area: number;
    red_count: number;
    avg_risk: number;
    avg_expected_overrun: number;
  };
  factors: { factor: string; count: number }[];
  parcels: PortfolioRow[];
}

export interface VillageInfo {
  village: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
}
