import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthorCourses, useDeleteCourse } from '../api/courses';
import CategoryBadge from '../components/ui/CategoryBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatsCard from '../components/ui/StatsCard';
import Modal from '../components/ui/Modal';

export default function AuthorDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: coursesData, isLoading, isError } = useAuthorCourses();
  const deleteMutation = useDeleteCourse();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Filter by search query
  const myCourses = useMemo(() => {
    const list = coursesData ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
    );
  }, [coursesData, searchQuery]);

  // Stats
  const totalCourses = myCourses.length;
  const published = myCourses.filter((c) => c.published).length;
  const drafts = totalCourses - published;
  const totalRevenue = myCourses.reduce((sum, c) => sum + c.amount, 0);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            My Courses
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Manage and track your published courses
          </p>
        </div>
        <Link to="/author/courses/new"
              className="flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Course
        </Link>
      </div>

      {/* Stats Cards */}
      {!isLoading && !isError && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            label="Total Courses"
            value={totalCourses}
          />
          <StatsCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            label="Published"
            value={published}
            accent="#ECFDF5"
          />
          <StatsCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            label="Drafts"
            value={drafts}
            accent="#FEF3C7"
          />
          <StatsCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            label="Total Value"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          />
        </div>
      )}

      {/* Search bar */}
      {!isLoading && !isError && totalCourses > 0 && (
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="var(--color-surface-800)" strokeWidth="2" style={{ opacity: 0.4 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your courses…"
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 sm:max-w-sm"
              style={{ borderColor: 'var(--color-surface-200)', background: 'var(--color-surface-0)' }}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingSkeleton count={3} />}

      {/* Error */}
      {isError && (
        <div className="rounded-xl p-8 text-center" style={{ background: '#FEF2F2' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
            Failed to load courses.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && myCourses.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
               style={{ background: 'var(--color-brand-50)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-400)"
                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-surface-900)' }}>
            {searchQuery ? 'No matching courses' : 'No courses yet'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
            {searchQuery ? 'Try a different search term.' : 'Create your first course and share your knowledge.'}
          </p>
          {!searchQuery && (
            <Link to="/author/courses/new"
                  className="mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white no-underline"
                  style={{ background: 'var(--color-brand-600)' }}>
              Create Course
            </Link>
          )}
        </div>
      )}

      {/* Course table */}
      {!isLoading && !isError && myCourses.length > 0 && (
        <div className="overflow-hidden rounded-xl" style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-50)' }}>
                  <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>Course</th>
                  <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>Category</th>
                  <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>Price</th>
                  <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map((course) => (
                  <tr key={course.id} className="border-t transition-colors hover:bg-gray-50"
                      style={{ borderColor: 'var(--color-surface-100)' }}>
                    <td className="px-5 py-4">
                      <Link to={`/courses/${course.id}`}
                            className="font-semibold no-underline hover:underline"
                            style={{ color: 'var(--color-surface-900)' }}>
                        {course.name}
                      </Link>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.4 }}>
                        {new Date(course.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-4"><CategoryBadge category={course.category} /></td>
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--color-brand-700)' }}>
                      ₹{course.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={course.published
                              ? { background: '#ECFDF5', color: 'var(--color-success)' }
                              : { background: '#FEF3C7', color: '#92400E' }}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/author/courses/${course.id}/edit`)}
                                className="cursor-pointer rounded-lg border-none px-3 py-1.5 text-xs font-medium transition-colors"
                                style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget({ id: course.id, name: course.name })}
                                className="cursor-pointer rounded-lg border-none px-3 py-1.5 text-xs font-medium transition-colors"
                                style={{ background: '#FEF2F2', color: 'var(--color-error)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
          Delete course?
        </h3>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
          Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer rounded-lg border-none px-4 py-2 text-sm font-medium"
                  style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
            Cancel
          </button>
          <button onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="cursor-pointer rounded-lg border-none px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'var(--color-error)' }}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
