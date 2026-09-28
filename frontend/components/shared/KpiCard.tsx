import React from "react";

export interface KpiItem {
  label: string;
  value: string | number;
  delta?: string | null;
  color?: string;
}

export function KpiCard({ label, value, delta, color = "var(--navy)" }: KpiItem) {
  return (
    <div
      className="bg-[var(--bg-card)] rounded-xl p-3.5 border-l-4 border-y border-r border-[var(--border)] shadow-2xs flex flex-col justify-between transition-colors"
      style={{ borderLeftColor: color }}
    >
      <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-extrabold text-[var(--navy)] mt-1 leading-tight">
        {value}
      </div>
      {delta && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{delta}</div>}
    </div>
  );
}

export function KpiRow({ cards }: { cards: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 my-4">
      {cards.map((c, i) => (
        <KpiCard key={i} {...c} />
      ))}
    </div>
  );
}

