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
  { name: "New Project", href: "/new-project", icon: FilePlus2 },
  { name: "Zonal Analysis", href: "/area", icon: MapPin },
  { name: "Delay Insights", href: "/trends", icon: TrendingUp },
  { name: "Compare", href: "/compare", icon: Scale },
  { name: "Map", href: "/map", icon: MapIcon },
  { name: "Alerts", href: "/alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAppStore((state) => state.role);

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
        <div className="px-3 pb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
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
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--navy)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#4A90A4]"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Actions (visible only to Admin role) */}
      {role === "Admin" && (
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-surface)] space-y-1.5">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Admin Actions
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border)] text-[var(--navy)] py-1.5 px-2 rounded-md transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh portfolio cache
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium bg-[var(--bg-card)] hover:bg-red-500/10 border border-red-500/30 text-[var(--color-loss)] py-1.5 px-2 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset user projects
          </button>
        </div>
      )}
    </aside>
  );
}
