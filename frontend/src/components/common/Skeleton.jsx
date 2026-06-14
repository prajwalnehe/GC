const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-secondary-200 dark:bg-secondary-700 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
