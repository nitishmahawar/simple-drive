"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const DrivePageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Folders section */}
      <div>
        <Skeleton className="mb-3 h-4 w-16" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-lg border bg-card p-4"
            >
              <Skeleton className="mb-3 h-12 w-12 rounded-lg" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Files section */}
      <div>
        <Skeleton className="mb-3 h-4 w-12" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
    </div>
  );
};
