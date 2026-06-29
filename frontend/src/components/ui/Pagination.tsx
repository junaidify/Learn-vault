interface Props {
  totalPages: number;
  currentPage: number;       // 0-indexed (matches Spring Page)
  onPageChange: (page: number) => void;
}

export default function Pagination({ totalPages, currentPage, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  // Build visible page numbers: show max 7, with ellipsis
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 py-6" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex cursor-pointer items-center gap-1 rounded-lg border-none px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-2 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.4 }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none text-sm font-semibold transition-all"
            style={
              p === currentPage
                ? { background: 'var(--color-brand-600)', color: 'white' }
                : { background: 'transparent', color: 'var(--color-surface-800)' }
            }
          >
            {(p as number) + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="flex cursor-pointer items-center gap-1 rounded-lg border-none px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </nav>
  );
}

/* ---- helper to build compact page number array ---- */

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | '...')[] = [0];

  if (current > 2) pages.push('...');

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('...');

  pages.push(total - 1);
  return pages;
}
