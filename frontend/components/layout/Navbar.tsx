"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, User, ChevronDown, Check, ShieldCheck, Eye } from "lucide-react";
import { useAppStore, Theme } from "@/store/useAppStore";

type Role = "Admin" | "Officer" | "Viewer";

const ROLE_OPTIONS: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "Admin",   label: "Admin",   icon: <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-profit)]" /> },
  { value: "Officer", label: "Officer", icon: <User className="w-3.5 h-3.5 text-[#60a5fa]" /> },
  { value: "Viewer",  label: "Viewer",  icon: <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" /> },
];

export function Navbar() {
  const role = useAppStore((state) => state.role);
  const setRole = useAppStore((state) => state.setRole);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  const handleSelectRole = (newRole: Role) => {
    setRole(newRole);
    setShowRoleMenu(false);
  };

  const activeRoleOption = ROLE_OPTIONS.find((r) => r.value === role) ?? ROLE_OPTIONS[0];

  return (
    <header className="navbar">
      {/* Brand area */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1F4E79] border border-[#4A90A4] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
          BS
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base text-[var(--navy)] tracking-tight">BhoomiSetu</span>
          <span className="hidden sm:inline text-xs text-[var(--text-muted)]">
            · Predicting delays before they cost the project
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Interactive Theme Selector */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowRoleMenu(false); }}
            title="Toggle theme (Light / Dark)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-all shadow-xs"
          >
            {theme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-[#60a5fa]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#E8A33D]" />
            )}
            <span className="capitalize">{theme}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] ml-0.5" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleSelectTheme("light")}
                className="w-full px-3 py-1.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-[#E8A33D]" />
                  <span>Light Mode</span>
                </span>
                {theme === "light" && <Check className="w-3.5 h-3.5 text-[var(--color-profit)]" />}
              </button>
              <button
                type="button"
                onClick={() => handleSelectTheme("dark")}
                className="w-full px-3 py-1.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>Dark Mode</span>
                </span>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-[var(--color-profit)]" />}
              </button>
            </div>
          )}
        </div>

        {/* Role Selector */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowThemeMenu(false); }}
            title={`Current role: ${role}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-all shadow-xs"
          >
            {activeRoleOption.icon}
            <span>{role}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-40 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 mb-0.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                Switch Role
              </div>
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectRole(opt.value)}
                  className="w-full px-3 py-1.5 text-xs text-left font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.label}</span>
                  </span>
                  {role === opt.value && <Check className="w-3.5 h-3.5 text-[var(--color-profit)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
