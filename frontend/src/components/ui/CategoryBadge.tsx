import type { Category } from '../../lib/types';

const CONFIG: Record<Category, { bg: string; text: string; label: string }> = {
  TECH:          { bg: '#EEF2FF', text: '#4338CA', label: 'Tech' },
  COMMUNICATION: { bg: '#FEF3C7', text: '#92400E', label: 'Communication' },
  PSYCHOLOGY:    { bg: '#FCE7F3', text: '#9D174D', label: 'Psychology' },
  LANGUAGE:      { bg: '#D1FAE5', text: '#065F46', label: 'Language' },
};

interface Props {
  category: Category;
  className?: string;
}

export default function CategoryBadge({ category, className = '' }: Props) {
  const c = CONFIG[category] ?? { bg: '#F1F5F9', text: '#334155', label: category };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        background: c.bg,
        color: c.text,
        borderRadius: 'var(--radius-badge)',
        letterSpacing: '0.02em',
      }}
    >
      {c.label}
    </span>
  );
}
