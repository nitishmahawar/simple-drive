"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const FilesPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Optional description */}
      <Skeleton className="h-4 w-72" />

      {/* Files grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-lg border bg-card p-4"
          >
            <Skeleton className="mb-3 h-12 w-12 rounded-lg" />
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
};
