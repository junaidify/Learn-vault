import { Link } from 'react-router-dom';
import { useEnrolledCourses } from '../api/courses';
import StatsCard from '../components/ui/StatsCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import CategoryBadge from '../components/ui/CategoryBadge';

export default function StudentDashboardPage() {
  const { data: enrolledCourses, isLoading, isError } = useEnrolledCourses();

  const totalEnrolled = enrolledCourses?.length ?? 0;

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
          Your Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
          Track your learning progress and enrolled courses
        </p>
      </div>

      {/* Stats placeholder */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
          label="Courses Enrolled"
          value={isLoading ? '…' : totalEnrolled}
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          label="Completed"
          value="0"
          accent="#ECFDF5"
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          label="Hours Learned"
          value="—"
          accent="#FFFBEB"
        />
        <StatsCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Certificates"
          value="0"
        />
      </div>

      {/* Enrolled Courses */}
      <div className="overflow-hidden rounded-2xl"
           style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>
        <div className="border-b px-6 py-4" style={{ borderColor: 'var(--color-surface-100)' }}>
          <h2 className="text-base font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            My Enrolled Courses
          </h2>
        </div>

        <div className="px-6 py-8">
          {isLoading && <LoadingSkeleton count={3} />}

          {isError && (
            <div className="rounded-xl p-8 text-center" style={{ background: '#FEF2F2' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                Failed to load your enrolled courses. Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && totalEnrolled === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {/* Animated illustration */}
              <div className="animate-float mb-6 flex h-28 w-28 items-center justify-center rounded-full"
                   style={{ background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeWidth="1.2"
                     stroke="var(--color-brand-400)" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M12 6v7"/>
                  <path d="M15 9.5l-3-3.5-3 3.5"/>
                </svg>
              </div>

              <h3 className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
                No enrolled courses yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed"
                 style={{ color: 'var(--color-surface-800)', opacity: 0.55 }}>
                Explore our catalog and find the perfect learning path to build your skills and stack.
              </p>

              <div className="mt-8">
                <Link to="/"
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
                      style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
                  Browse Catalog
                </Link>
              </div>
            </div>
          )}

          {!isLoading && !isError && totalEnrolled > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses?.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between overflow-hidden transition-all hover:translate-y-[-4px]"
                  style={{
                    borderRadius: 'var(--radius-card)',
                    background: 'var(--color-surface-0)',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-surface-100)',
                  }}
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={course.category} />
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Enrolled
                      </span>
                    </div>

                    <div>
                      <h3
                        className="line-clamp-2 text-base font-bold leading-snug"
                        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}
                      >
                        {course.name}
                      </h3>
                      <p
                        className="line-clamp-2 mt-1.5 text-xs leading-relaxed"
                        style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}
                      >
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium" style={{ color: 'var(--color-surface-800)' }}>
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t px-5 py-3.5 bg-gray-50"
                    style={{ borderColor: 'var(--color-surface-100)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: 'var(--color-brand-500)' }}
                      >
                        {course.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-surface-800)' }}>
                        {course.authorName}
                      </span>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 no-underline"
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
    </div>
  );
}
