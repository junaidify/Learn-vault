import { Link } from 'react-router-dom';

/**
 * ⚠️ FLAGGED GAP: There is no "my enrollments" endpoint on the backend.
 * This page shows a "Coming soon" placeholder.
 * Recommend: GET /api/v1/enrollments/my-courses (or similar)
 */
export default function StudentDashboardPage() {
  return (
    <div className="animate-fade-in flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Illustration */}
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full"
             style={{ background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" strokeWidth="1.2"
               stroke="var(--color-brand-400)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <path d="M12 6v7"/>
            <path d="M15 9.5l-3-3.5-3 3.5"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
          Your Dashboard
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed"
           style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
          We're working on bringing your enrolled courses here. Soon you'll be able to track your progress, access course materials, and continue learning right from this page.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
             style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: 'var(--color-brand-400)' }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ background: 'var(--color-brand-500)' }} />
          </span>
          Coming soon
        </div>

        <div className="mt-8">
          <Link to="/"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
