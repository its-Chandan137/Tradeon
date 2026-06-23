import { Skeleton } from "./skeleton";

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center p-3 rounded-lg border border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className="skeleton-shimmer h-4 rounded"
              style={{ 
                width: j === 0 ? '120px' : j === columns - 1 ? '80px' : `${Math.random() * 100 + 80}px`,
                flex: j === 0 ? 'none' : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
