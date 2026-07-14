import { useState, useMemo } from 'react';
import { useCourses } from '../api/courses';
import CourseCard from '../components/ui/CourseCard';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import type { Category, SortBy, Direction } from '../lib/types';

const CATEGORIES: { value: Category | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All Courses', icon: '🎯' },
  { value: 'TECH', label: 'Tech', icon: '💻' },
  { value: 'COMMUNICATION', label: 'Communication', icon: '🎤' },
  { value: 'PSYCHOLOGY', label: 'Psychology', icon: '🧠' },
  { value: 'LANGUAGE', label: 'Language', icon: '🌍' },
];

const SORT_OPTIONS: { label: string; sortBy: SortBy; direction: Direction }[] = [
  { label: 'Newest first', sortBy: 'createdAt', direction: 'DESC' },
  { label: 'Oldest first', sortBy: 'createdAt', direction: 'ASC' },
  { label: 'Price: Low → High', sortBy: 'price', direction: 'ASC' },
  { label: 'Price: High → Low', sortBy: 'price', direction: 'DESC' },
  { label: 'Title A–Z', sortBy: 'title', direction: 'ASC' },
  { label: 'Title Z–A', sortBy: 'title', direction: 'DESC' },
];

export default function CatalogPage() {
  const [page, setPage] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const sort = SORT_OPTIONS[sortIdx];
  const { data, isLoading, isError } = useCourses({
    page,
    size: 12,
    sortBy: sort.sortBy,
    direction: sort.direction,
  });

  // Client-side category + search filter
  const filteredCourses = useMemo(() => {
    let courses = data?.content ?? [];
    if (categoryFilter !== 'ALL') {
      courses = courses.filter((c) => c.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    return courses;
  }, [data?.content, categoryFilter, searchQuery]);

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <section className="relative overflow-hidden py-16 sm:py-20"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-800) 100%)' }}>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, white, transparent 70%)' }} />
        {/* Decorative dots pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
              style={{ fontFamily: 'var(--font-heading)' }}>
            Learn Without{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Limits
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
             style={{ color: 'rgba(255,255,255,0.8)' }}>
            Premium courses from expert authors. Unlock your potential in tech, communication, psychology, and languages.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                placeholder="Search courses, authors, topics…"
                className="w-full rounded-2xl border-none py-3.5 pl-12 pr-4 text-sm outline-none shadow-lg"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-6 text-sm"
               style={{ color: 'rgba(255,255,255,0.7)' }}>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">{data?.totalElements ?? '—'}</span>
              <span>Courses</span>
            </div>
            <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">4</span>
              <span>Categories</span>
            </div>
            <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">🤖</span>
              <span>AI-Powered Q&A</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Courses */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Controls bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategoryFilter(cat.value); setPage(0); }}
                className="cursor-pointer rounded-full border-none px-4 py-2 text-sm font-medium transition-all"
                style={
                  categoryFilter === cat.value
                    ? { background: 'var(--color-brand-600)', color: 'white', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }
                    : { background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }
                }
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sortIdx}
            onChange={(e) => { setSortIdx(Number(e.target.value)); setPage(0); }}
            className="cursor-pointer rounded-xl border px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--color-surface-200)', background: 'var(--color-surface-0)', color: 'var(--color-surface-800)' }}
          >
            {SORT_OPTIONS.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {isLoading && <LoadingSkeleton count={6} />}

        {/* Error */}
        {isError && (
          <div className="animate-fade-in rounded-xl p-8 text-center"
               style={{ background: '#FEF2F2', borderRadius: 'var(--radius-card)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
              Failed to load courses. Please try again later.
            </p>
          </div>
        )}

        {/* Course grid */}
        {!isLoading && !isError && filteredCourses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredCourses.length === 0 && (
          <div className="animate-fade-in py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                 style={{ background: 'var(--color-brand-50)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-400)"
                   strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-surface-900)' }}>
              No courses found
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
              {searchQuery ? 'Try a different search term or category.' : 'Try a different category or check back later.'}
            </p>
            {(searchQuery || categoryFilter !== 'ALL') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); }}
                className="mt-4 cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-medium"
                style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)' }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Pagination totalPages={data.totalPages} currentPage={data.number} onPageChange={setPage} />
        )}
      </section>
    </div>
  );
}
