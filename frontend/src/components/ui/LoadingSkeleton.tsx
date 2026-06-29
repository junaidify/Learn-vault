interface Props {
  count?: number;
}

/** Shimmer skeleton cards for course grid loading state. */
export default function LoadingSkeleton({ count = 6 }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden"
          style={{ borderRadius: 'var(--radius-card)', background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Header stripe skeleton */}
          <div className="skeleton h-2 w-full" style={{ borderRadius: 0 }} />

          <div className="p-5 space-y-4">
            {/* Badge + price row */}
            <div className="flex items-center justify-between">
              <div className="skeleton h-6 w-20" />
              <div className="skeleton h-6 w-14" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="skeleton h-5 w-full" />
              <div className="skeleton h-5 w-3/4" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>

            {/* Author row */}
            <div className="flex items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--color-surface-100)' }}>
              <div className="skeleton h-7 w-7 rounded-full" />
              <div className="skeleton h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
