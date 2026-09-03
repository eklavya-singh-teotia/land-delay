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
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
        <div className="p-2.5 bg-[#C62828]/10 text-[#C62828] rounded-lg">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#1F4E79]">
            {data.total_alerts} active alerts across {data.unique_parcels} parcels
          </h2>
          <p className="text-xs text-[#6B7280]">
            Automated multi-channel broadcast logs for District Officers and Administrators
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h3 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">
            Active Warning Alerts
          </h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FA] text-[#6B7280] font-bold uppercase tracking-wider sticky top-0 border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Parcel ID</th>
                <th className="p-3">Alert Type</th>
                <th className="p-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {data.alerts.map((item, i) => (
                <tr key={i} className="hover:bg-[#F5F7FA]">
                  <td className="p-3 font-semibold text-[#1F4E79]">{item.parcel_id}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.alert_type === "high-risk" || item.alert_type === "court-stay"
                          ? "bg-[#C62828] text-white"
                          : item.alert_type === "overrun-while-ongoing"
                          ? "bg-[#E8A33D] text-white"
                          : "bg-[#4A90A4] text-white"
                      }`}
                    >
                      {item.alert_type}
                    </span>
                  </td>
                  <td className="p-3 text-[#1A1A1A]">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Broadcast Log */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#4A90A4]" />
            Notification Broadcast Log (SMS / Email / Push)
          </h3>
        </div>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FA] text-[#6B7280] font-bold uppercase tracking-wider sticky top-0 border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Channel</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Parcel ID</th>
                <th className="p-3">Alert</th>
                <th className="p-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {data.notifications.map((log, i) => (
                <tr key={i} className="hover:bg-[#F5F7FA]">
                  <td className="p-3 font-semibold text-[#4A90A4]">{log.channel}</td>
                  <td className="p-3 font-medium text-[#1A1A1A]">{log.recipient}</td>
                  <td className="p-3 font-mono text-[#1F4E79]">{log.parcel_id}</td>
                  <td className="p-3 capitalize text-[#6B7280]">{log.alert}</td>
                  <td className="p-3 text-[#1A1A1A] font-mono text-[11px]">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
