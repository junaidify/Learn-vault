import type { ReactNode } from 'react';

/* =========================================
   Stats Card — used in dashboards
   ========================================= */

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: string; // CSS color for the icon bg
}

export default function StatsCard({ icon, label, value, accent = 'var(--color-brand-50)' }: StatsCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl p-4 transition-all hover:shadow-md"
      style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--color-surface-800)', opacity: 0.55 }}>
          {label}
        </p>
        <p
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
