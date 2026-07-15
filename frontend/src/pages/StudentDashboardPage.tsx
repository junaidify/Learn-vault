import { Link } from 'react-router-dom';
import { useEnrolledCourses, useCourses } from '../api/courses';
import StatsCard from '../components/ui/StatsCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import CategoryBadge from '../components/ui/CategoryBadge';
import CourseCard from '../components/ui/CourseCard';
import { useState } from 'react';

export default function StudentDashboardPage() {
  const { data: enrolledCourses, isLoading, isError, error } = useEnrolledCourses();
  const { data: catalogData } = useCourses({ size: 100 });

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
  const totalEnrolled = enrolledCourses?.length ?? 0;
  const wishlistCourses = catalogData?.content?.filter(c => wishlist.includes(c.id)) ?? [];

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black"
            style={{ fontFamily: 'var(--font-heading)' }}>
          Your Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your learning progress and enrolled courses
        </p>
      </div>

      {isError && (
        <div className="mb-6 rounded-xl p-4 bg-red-50 text-red-700 text-sm border border-red-200">
          <p className="font-semibold">Failed to fetch enrolled courses:</p>
          <p className="mt-1 text-xs font-mono">{(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown network error'}</p>
        </div>
      )}

      {/* Stats placeholder */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
          label="Courses Enrolled"
          value={isLoading ? '…' : totalEnrolled}
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          label="Completed"
          value="0"
          accent="#F8FAFC"
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          label="Hours Learned"
          value="—"
          accent="#F8FAFC"
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Certificates"
          value="0"
        />
      </div>

      {/* Enrolled Courses */}
      <div className="overflow-hidden rounded-2xl border"
           style={{ background: 'var(--color-surface-0)', borderColor: 'var(--color-surface-200)', boxShadow: 'var(--shadow-card)' }}>
        <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-surface-200)' }}>
          <h2 className="text-base font-bold text-black"
              style={{ fontFamily: 'var(--font-heading)' }}>
            My Enrolled Courses
          </h2>
        </div>

        <div className="px-6 py-8">
          {isLoading && <LoadingSkeleton count={3} />}

          {!isLoading && totalEnrolled === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Animated illustration */}
              <div className="animate-float mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-slate-100">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeWidth="1.2"
                     stroke="black" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v7"/>
                  <path d="M15 9.5l-3-3.5-3 3.5"/>
                </svg>
              </div>

              <h3 className="text-lg font-bold text-black"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                Not enrolled in any course
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Explore our catalog and find the perfect learning path to build your skills and stack.
              </p>

              <div className="mt-8">
                <Link to="/"
                      className="inline-flex items-center gap-2 rounded-full bg-black py-2.5 px-6 text-sm font-semibold text-white no-underline hover:bg-slate-900 shadow-sm">
                  Browse Catalog
                </Link>
              </div>
            </div>
          )}

          {!isLoading && totalEnrolled > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses?.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between overflow-hidden transition-all hover:translate-y-[-4px] border"
                  style={{
                    borderRadius: 'var(--radius-card)',
                    background: 'var(--color-surface-0)',
                    boxShadow: 'var(--shadow-card)',
                    borderColor: 'var(--color-surface-200)',
                  }}
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={course.category} />
                      <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                        Enrolled
                      </span>
                    </div>

                    <div>
                      <h3
                        className="line-clamp-2 text-base font-bold leading-snug text-black"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {course.name}
                      </h3>
                      <p
                        className="line-clamp-2 mt-1.5 text-xs leading-relaxed text-slate-500"
                      >
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t px-5 py-3.5 bg-slate-50"
                    style={{ borderColor: 'var(--color-surface-200)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white bg-black"
                      >
                        {course.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-slate-700">
                        {course.authorName}
                      </span>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline no-underline"
                    >
                      Start Learning
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="mt-12 overflow-hidden rounded-2xl border"
           style={{ background: 'var(--color-surface-0)', borderColor: 'var(--color-surface-200)', boxShadow: 'var(--shadow-card)' }}>
        <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--color-surface-200)' }}>
          <h2 className="text-base font-bold text-black"
              style={{ fontFamily: 'var(--font-heading)' }}>
            My Wishlist ({wishlistCourses.length})
          </h2>
        </div>

        <div className="px-6 py-8">
          {wishlistCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-black">No wishlisted courses</h3>
              <p className="mt-1 text-xs text-slate-500">
                Browse our catalog and heart courses you are interested in.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistCourses.map((course, idx) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={idx}
                  isWishlisted={true}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
