"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  MapPin,
  TrendingUp,
  Scale,
  Map as MapIcon,
  Bell,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { refreshPortfolioCache, resetUserData } from "@/lib/api";

const NAV_ITEMS = [
  { name: "Portfolio", href: "/portfolio", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "New Project Assessment", href: "/new-project", icon: FilePlus2 },
  { name: "Area of Interest", href: "/area", icon: MapPin },
  { name: "Trends", href: "/trends", icon: TrendingUp },
  { name: "Compare", href: "/compare", icon: Scale },
  { name: "Map", href: "/map", icon: MapIcon },
  { name: "Alerts", href: "/alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAppStore((state) => state.role);
  const setRole = useAppStore((state) => state.setRole);

  const [loading, setLoading] = React.useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshPortfolioCache();
      window.location.reload();
    } catch (e) {
      alert("Failed to refresh portfolio cache");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset user-created projects?")) return;
    setLoading(true);
    try {
      await resetUserData();
      window.location.reload();
    } catch (e) {
      alert("Failed to reset user data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
          Navigation
        </div>

        {NAV_ITEMS.filter((item) => {
          if (role === "Viewer") {
            return ["/portfolio", "/projects", "/map"].includes(item.href);
          }
          return true;
        }).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/portfolio" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1F4E79] text-white shadow-xs"
                  : "text-[#1A1A1A] hover:bg-[#F5F7FA] hover:text-[#1F4E79]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#4A90A4]"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Role Switcher & Admin Actions */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F5F7FA] space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
            Role (Mock)
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full text-xs bg-white border border-[#E2E8F0] rounded-md px-2 py-1.5 text-[#1A1A1A] font-medium focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          >
            <option value="Admin">Admin</option>
            <option value="Officer">Officer</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {role === "Admin" && (
          <div className="space-y-1.5 pt-1 border-t border-[#E2E8F0]">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white hover:bg-white/80 border border-[#E2E8F0] text-[#1F4E79] py-1.5 px-2 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Refresh portfolio cache
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white hover:bg-red-50 border border-red-200 text-[#C62828] py-1.5 px-2 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset user projects
            </button>
          </div>
        )}

        <div className="text-[10px] text-[#6B7280] text-center pt-1">
          Logged in as <span className="font-bold text-[#1F4E79]">{role}</span>
        </div>
      </div>
    </aside>
  );
}
