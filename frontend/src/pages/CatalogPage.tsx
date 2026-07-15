import { useState, useMemo } from 'react';
import { useCourses } from '../api/courses';
import CourseCard from '../components/ui/CourseCard';
import Pagination from '../components/ui/Pagination';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import type { Category, SortBy, Direction } from '../lib/types';

const CATEGORIES: { value: Category | 'ALL' | 'WISHLIST'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All Courses', icon: '🎯' },
  { value: 'TECH', label: 'Tech', icon: '💻' },
  { value: 'COMMUNICATION', label: 'Communication', icon: '🎤' },
  { value: 'PSYCHOLOGY', label: 'Psychology', icon: '🧠' },
  { value: 'LANGUAGE', label: 'Language', icon: '🌍' },
  { value: 'WISHLIST', label: 'Wishlist', icon: '❤️' },
];

const SORT_OPTIONS: { label: string; sortBy: SortBy; direction: Direction }[] = [
  { label: 'Newest first', sortBy: 'createdAt', direction: 'DESC' },
  { label: 'Oldest first', sortBy: 'createdAt', direction: 'ASC' },
  { label: 'Price: Low → High', sortBy: 'price', direction: 'ASC' },
  { label: 'Price: High → Low', sortBy: 'price', direction: 'DESC' },
  { label: 'Title A–Z', sortBy: 'title', direction: 'ASC' },
  { label: 'Title Z–A', sortBy: 'title', direction: 'DESC' },
];

const FLOATING_AVATARS = [
  { top: '15%', left: '10%', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', name: 'Alex' },
  { top: '35%', left: '4%', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', name: 'Michael' },
  { top: '65%', left: '8%', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', name: 'Emma' },
  { top: '15%', right: '10%', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', name: 'David' },
  { top: '40%', right: '4%', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', name: 'Sarah' },
  { top: '65%', right: '8%', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80', name: 'James' },
];

export default function CatalogPage() {
  const [page, setPage] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL' | 'WISHLIST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Wishlist state loaded from localStorage
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('learnvault_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const handleWishlistToggle = (courseId: number) => {
    setWishlist((prev) => {
      const updated = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      localStorage.setItem('learnvault_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const sort = SORT_OPTIONS[sortIdx];

  // Request all wishlist courses if active, otherwise standard paginated list
  const { data, isLoading, isError } = useCourses({
    page,
    size: categoryFilter === 'WISHLIST' ? 100 : 12,
    sortBy: sort.sortBy,
    direction: sort.direction,
    category: (categoryFilter === 'ALL' || categoryFilter === 'WISHLIST') ? undefined : categoryFilter,
    search: searchQuery || undefined,
  });

  // Client-side filtering wrapper for Wishlist or final query safety
  const filteredCourses = useMemo(() => {
    let courses = data?.content ?? [];
    if (categoryFilter === 'WISHLIST') {
      courses = courses.filter((c) => wishlist.includes(c.id));
    }
    return courses;
  }, [data?.content, categoryFilter, wishlist]);

  return (
    <div className="animate-fade-in" style={{ background: '#FFFFFF' }}>
      
      {/* Redesigned Hero Section (Matching Tutorly Mockup) */}
      <section className="relative overflow-hidden py-24 text-center border-b" style={{ borderColor: 'var(--color-surface-100)' }}>
        {/* Floating Profile Avatars */}
        <div className="hidden lg:block">
          {FLOATING_AVATARS.map((avatar, idx) => (
            <div
              key={idx}
              className="absolute animate-float transition-all duration-500 hover:scale-110 flex items-center justify-center rounded-xl p-1 bg-white border shadow-md"
              style={{
                top: avatar.top,
                left: avatar.left,
                right: avatar.right,
                borderColor: 'var(--color-surface-200)',
                animationDelay: `${idx * 0.4}s`,
              }}
            >
              <img
                src={avatar.img}
                alt={avatar.name}
                className="h-12 w-12 rounded-xl object-cover"
              />
            </div>
          ))}
        </div>

        <div className="relative mx-auto max-w-4xl px-4">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-6 bg-slate-100 text-slate-800">
            ✨ Premium Learning Platform
          </div>

          {/* Heading */}
          <h1
            className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            We built for the <br />
            <span className="text-slate-900 border-b-4 border-black">Future of Learning</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Tutorly is designed for creators, educators, trainers, and academies who want to launch a powerful online learning platform.
          </p>

          {/* Search bar (pill shape) */}
          <div className="mx-auto mt-10 max-w-md">
            <div className="relative rounded-full shadow-md border" style={{ borderColor: 'var(--color-surface-200)' }}>
              <svg className="absolute left-5 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24"
                   fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                placeholder="Search courses, authors, topics…"
                className="w-full rounded-full border-none py-4 pl-12 pr-6 text-sm outline-none bg-white text-black placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog List Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Controls bar */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategoryFilter(cat.value); setPage(0); }}
                className="cursor-pointer rounded-full border-none px-4 py-2 text-sm font-semibold transition-all hover:bg-slate-200"
                style={
                  categoryFilter === cat.value
                    ? { background: 'black', color: 'white' }
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
            className="cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium outline-none bg-white text-black"
            style={{ borderColor: 'var(--color-surface-200)' }}
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                isWishlisted={wishlist.includes(course.id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredCourses.length === 0 && (
          <div className="animate-fade-in py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black"
                   strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black">
              {categoryFilter === 'WISHLIST' ? 'Your wishlist is empty' : 'No courses found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {categoryFilter === 'WISHLIST'
                ? 'Click the heart icon on any course thumbnail to save it here.'
                : 'Try a different search term or category.'}
            </p>
            {(searchQuery || categoryFilter !== 'ALL') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); }}
                className="mt-4 cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-black"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {categoryFilter !== 'WISHLIST' && data && data.totalPages > 1 && (
          <Pagination totalPages={data.totalPages} currentPage={data.number} onPageChange={setPage} />
        )}
      </section>

      {/* Redesigned About Section (Matching Tutorly Mockup) */}
      <section id="about" className="py-20 border-t" style={{ background: '#F8FAFC', borderColor: 'var(--color-surface-200)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left side text and stats */}
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                About Tutorly
              </span>
              <h2
                className="mt-3 text-3xl font-extrabold text-black sm:text-4xl leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Tutorly helps creators deliver this through a professional, structured, and conversion-optimized platform. Learners want practical skills, and flexible learning.
              </h2>
              
              {/* Contact Us Pill Button */}
              <div className="mt-8">
                <a
                  href="mailto:contact@tutorly.com"
                  className="inline-flex items-center gap-3 rounded-full bg-black py-3 pl-6 pr-3 text-sm font-semibold text-white no-underline shadow-md transition-all hover:bg-slate-900"
                >
                  <span>CONTACT US</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-xs font-bold">
                    →
                  </span>
                </a>
              </div>

              {/* Statistics Grid */}
              <div className="mt-12 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: 'var(--color-surface-200)' }}>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-black">70%+</span>
                  <span className="mt-1 block text-xs sm:text-sm text-slate-500 leading-snug">learners report career improvement</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-black">25000+</span>
                  <span className="mt-1 block text-xs sm:text-sm text-slate-500 leading-snug">students enrolled our tutorly courses</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-black">100%</span>
                  <span className="mt-1 block text-xs sm:text-sm text-slate-500 leading-snug">Student satisfaction, this is our first priority</span>
                </div>
              </div>
            </div>

            {/* Right side image */}
            <div className="relative">
              {/* Image Frame Decorator */}
              <div className="absolute -inset-4 rounded-3xl bg-slate-200 transform rotate-1 opacity-50" />
              <img
                src="/images/about_instructor.jpg"
                alt="Tutorly Professional Learning"
                className="relative w-full rounded-2xl shadow-xl object-cover"
                style={{ maxHeight: '420px' }}
              />
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}
