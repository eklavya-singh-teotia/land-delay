"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, Send } from "lucide-react";

export function AlertsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  if (isLoading || !data) {
    return <LoadingSpinner text="Loading automated alert feed..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Automated Alert Feed"
        subtitle="Real-time warning notifications for active court stays, statutory delay overruns, pending compensation, and high-risk parcels"
      />

      {/* Summary Band */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border)] shadow-2xs flex items-center gap-3 transition-colors">
        <div className="p-2.5 bg-red-500/10 text-[var(--color-loss)] rounded-lg">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--navy)]">
            {data.total_alerts} active alerts across {data.unique_parcels} parcels
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Automated multi-channel broadcast logs for District Officers and Administrators
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">
            Active Warning Alerts
          </h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider sticky top-0 border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Parcel ID</th>
                <th className="p-3">Alert Type</th>
                <th className="p-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.alerts.map((item, i) => (
                <tr key={i} className="hover:bg-[var(--bg-surface-hover)]">
                  <td className="p-3 font-semibold text-[var(--navy)]">{item.parcel_id}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.alert_type === "high-risk" || item.alert_type === "court-stay"
                          ? "bg-[var(--color-loss)] text-white"
                          : item.alert_type === "overrun-while-ongoing"
                          ? "bg-[var(--color-warning)] text-white"
                          : "bg-[var(--steel)] text-white"
                      }`}
                    >
                      {item.alert_type}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-primary)]">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Broadcast Log */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-2xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#4A90A4]" />
            Notification Broadcast Log (SMS / Email / Push)
          </h3>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider sticky top-0 border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Channel</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Parcel ID</th>
                <th className="p-3">Alert</th>
                <th className="p-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.notifications.map((log, i) => (
                <tr key={i} className="hover:bg-[var(--bg-surface-hover)]">
                  <td className="p-3 font-semibold text-[var(--steel)]">{log.channel}</td>
                  <td className="p-3 font-medium text-[var(--text-primary)]">{log.recipient}</td>
                  <td className="p-3 font-mono text-[var(--navy)]">{log.parcel_id}</td>
                  <td className="p-3 capitalize text-[var(--text-muted)]">{log.alert}</td>
                  <td className="p-3 text-[var(--text-primary)] font-mono text-[11px]">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
