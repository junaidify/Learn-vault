import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import type { CourseResponseDto, Category } from '../../lib/types';

interface Props {
  course: CourseResponseDto;
  index?: number;
}

/* Category → gradient + icon config for the thumbnail area */
const THUMB_CONFIG: Record<Category, { gradient: string; emoji: string }> = {
  TECH:          { gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)', emoji: '💻' },
  COMMUNICATION: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #FB923C 100%)', emoji: '🎤' },
  PSYCHOLOGY:    { gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #F9A8D4 100%)', emoji: '🧠' },
  LANGUAGE:      { gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)', emoji: '🌍' },
};

export default function CourseCard({ course, index = 0 }: Props) {
  const delay = `stagger-${Math.min(index + 1, 6)}`;
  const thumb = THUMB_CONFIG[course.category] ?? THUMB_CONFIG.TECH;

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
      {/* Thumbnail area — gradient + icon + play button overlay */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: '180px',
          background: thumb.gradient,
        }}
      >
        {/* Decorative background pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), ' +
              'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        {/* Decorative dots pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Category emoji */}
        <span className="relative text-5xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
          {thumb.emoji}
        </span>

        {/* Play icon overlay (indicates there's a video behind paywall) */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-brand-600)">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          </div>
        </div>

        {/* Price badge — top right */}
        <div
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-bold"
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: 'var(--color-brand-700)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {course.amount === 0 ? 'Free' : `₹${course.amount.toLocaleString('en-IN')}`}
        </div>

        {/* Category badge — top left */}
        <div className="absolute left-3 top-3">
          <CategoryBadge category={course.category} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
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
