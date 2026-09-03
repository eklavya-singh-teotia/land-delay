import React from "react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-gradient-to-r from-[#1F4E79] via-[#2C6B9B] to-[#4A90A4] text-white p-5 rounded-xl mb-5 shadow-xs">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
    </div>
  );
}
