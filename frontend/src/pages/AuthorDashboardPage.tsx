import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses, useDeleteCourse } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/ui/CategoryBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Pagination from '../components/ui/Pagination';

/**
 * ⚠️ FLAGGED GAP: There is no author-scoped "my courses" endpoint.
 * This page fetches ALL courses and filters client-side by authorName.
 * This is inefficient and will break at scale. Recommend:
 *   GET /api/v1/courses/my-courses  (or query param ?author=X)
 */
export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useCourses({ page, size: 100 });
  const deleteMutation = useDeleteCourse();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Client-side filter by author name
  const myCourses = data?.content.filter(
    (c) => c.authorName === user?.name,
  ) ?? [];

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            My Courses
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Manage and track your published courses
          </p>
        </div>
        <Link to="/author/courses/new"
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Course
        </Link>
      </div>

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
            No courses yet
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
            Create your first course and share your knowledge.
          </p>
          <Link to="/author/courses/new"
                className="mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold text-white no-underline"
                style={{ background: 'var(--color-brand-600)' }}>
            Create Course
          </Link>
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

      {data && data.totalPages > 1 && (
        <Pagination totalPages={data.totalPages} currentPage={data.number} onPageChange={setPage} />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="animate-slide-up w-full max-w-sm rounded-2xl p-6"
               style={{ background: 'var(--color-surface-0)' }}>
            <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
              Delete course?
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This cannot be undone.
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
          </div>
        </div>
      )}
    </div>
  );
}
