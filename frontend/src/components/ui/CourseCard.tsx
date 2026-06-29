import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import type { CourseResponseDto } from '../../lib/types';

interface Props {
  course: CourseResponseDto;
  index?: number;
}

export default function CourseCard({ course, index = 0 }: Props) {
  const delay = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <Link
      to={`/courses/${course.id}`}
      className={`animate-fade-in ${delay} group block overflow-hidden no-underline transition-all duration-300`}
      style={{
        borderRadius: 'var(--radius-card)',
        background: 'var(--color-surface-0)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Gradient header stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: 'linear-gradient(90deg, var(--color-brand-600), var(--color-brand-400))',
        }}
      />

      <div className="p-5">
        {/* Category + Price row */}
        <div className="mb-3 flex items-center justify-between">
          <CategoryBadge category={course.category} />
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-brand-700)' }}
          >
            ₹{course.amount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Title */}
        <h3
          className="mb-2 line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-indigo-600"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}
        >
          {course.name}
        </h3>

        {/* Description */}
        <p
          className="mb-4 line-clamp-2 text-sm leading-relaxed"
          style={{ color: 'var(--color-surface-800)', opacity: 0.65 }}
        >
          {course.description}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--color-surface-100)' }}>
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))',
            }}
          >
            {course.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            {course.authorName}
          </span>
        </div>
      </div>
    </Link>
  );
}
