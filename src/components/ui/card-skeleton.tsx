import { Skeleton } from "./skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
      <Skeleton className="skeleton-shimmer h-4 w-24" />
      <Skeleton className="skeleton-shimmer h-8 w-32" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
      <Skeleton className="skeleton-shimmer h-4 w-20" />
      <Skeleton className="skeleton-shimmer h-10 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-4">
      <Skeleton className="skeleton-shimmer h-4 w-32" />
      <Skeleton className="skeleton-shimmer h-48 w-full rounded" />
    </div>
  );
}
