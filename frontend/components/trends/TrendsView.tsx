"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrends } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  RiskByStateChart,
  StageProbChart,
  RiskByTypeChart,
  TopDistrictsChart,
  HeatmapChart,
  HistoricalOverrunChart,
} from "@/components/charts/TrendsCharts";

export function TrendsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["trends"],
    queryFn: fetchTrends,
  });

  if (isLoading || !data) {
    return <LoadingSpinner text="Loading delay trends analysis..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Delay Trends & Multi-State Bottleneck Analytics"
        subtitle="Aggregated risk patterns across states, project types, districts, and statutory acquisition stages"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskByStateChart data={data.risk_by_state} />
        <StageProbChart data={data.delay_prob_by_stage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskByTypeChart data={data.risk_by_project_type} />
        <TopDistrictsChart data={data.top_districts_by_risk} />
      </div>

      <HeatmapChart data={data.heatmap} />

      <HistoricalOverrunChart data={data.historical_overrun} />
    </div>
  );
}
