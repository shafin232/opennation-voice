import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  rows?: number;
  type?: 'card' | 'list' | 'table';
}

export function LoadingSkeleton({ rows = 3, type = 'card' }: Props) {
  if (type === 'list') {
    return (
      <div className="space-y-3 animate-fade-in">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-2 animate-fade-in rounded-xl border border-border/50 overflow-hidden">
        <Skeleton className="h-12 w-full rounded-none" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 p-5 space-y-3">
          <Skeleton className="h-5 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
