import { RiskLevel } from "./types";

export const COLORS = {
  navy: "#1F4E79",
  steel: "#4A90A4",
  green: "#2E7D32",
  yellow: "#E8A33D",
  red: "#C62828",
  bg: "#F5F7FA",
  text: "#1A1A1A",
  orange: "#E67E22",
  purple: "#8E44AD",
  muted: "#6B7280",
  border: "#E2E8F0",
} as const;

export const RISK_COLORS: Record<RiskLevel, string> = {
  RED: COLORS.red,
  YELLOW: COLORS.yellow,
  GREEN: COLORS.green,
};

export const RISK_EMOJI: Record<RiskLevel, string> = {
  RED: "🔴",
  YELLOW: "🟡",
  GREEN: "🟢",
};

export function getRiskLevel(score: number): RiskLevel {
  if (score > 0.7) return "RED";
  if (score >= 0.4) return "YELLOW";
  return "GREEN";
}

export function getRiskColor(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}
