"use client";

import React from "react";
import { Sun, User, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function Navbar() {
  const role = useAppStore((state) => state.role);

  return (
    <header className="navbar">
      {/* Brand area */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1F4E79] border border-[#4A90A4] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
          BS
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base text-[#1F4E79] tracking-tight">BhoomiSetu</span>
          <span className="hidden sm:inline text-xs text-[#6B7280]">
            · Predicting delays before they cost the project
          </span>
        </div>
      </div>

      {/* Right side placeholder buttons */}
      <div className="flex items-center gap-3">
        {/* Placeholder 1: Theme Selector (Light Mode default) */}
        <button
          disabled
          title="Dark / Light mode — coming soon"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#1F4E79]/30 text-[#1F4E79] text-xs font-semibold bg-white hover:bg-[#F5F7FA] cursor-not-allowed opacity-80 transition-colors shadow-xs"
        >
          <Sun className="w-3.5 h-3.5 text-[#E8A33D]" />
          <span>Light</span>
          <ChevronDown className="w-3 h-3 text-[#6B7280] ml-0.5" />
        </button>

        {/* Placeholder 2: Role Based Access Selector */}
        <button
          disabled
          title="Role-based access — coming soon"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#1F4E79]/30 text-[#1F4E79] text-xs font-semibold bg-white hover:bg-[#F5F7FA] cursor-not-allowed opacity-80 transition-colors shadow-xs"
        >
          <User className="w-3.5 h-3.5 text-[#1F4E79]" />
          <span>{role}</span>
          <ChevronDown className="w-3 h-3 text-[#6B7280] ml-0.5" />
        </button>
      </div>
    </header>
  );
}
