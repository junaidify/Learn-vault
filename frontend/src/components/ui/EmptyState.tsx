import type { ReactNode } from 'react';

/* =========================================
   Reusable Empty State Component
   ========================================= */

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in py-20 text-center">
      <div
        className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))' }}
      >
        {icon}
      </div>
      <h3
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}
      >
        {title}
      </h3>
      <p
        className="mx-auto mt-2 max-w-sm text-sm leading-relaxed"
        style={{ color: 'var(--color-surface-800)', opacity: 0.55 }}
      >
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
