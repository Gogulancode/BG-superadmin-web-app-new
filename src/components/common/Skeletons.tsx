"use client";

import { Skeleton } from "@/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Card, CardContent, CardHeader } from "@/components/card";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * Unified table skeleton for loading states.
 */
export function TableSkeleton({
  columns,
  rows = 5,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showHeader && (
        <div className="flex items-center gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  showIcon?: boolean;
  className?: string;
}

/**
 * Unified card skeleton for KPI/stat cards.
 */
export function CardSkeleton({ showIcon = true, className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          {showIcon && <Skeleton className="h-10 w-10 rounded-full" />}
        </div>
      </CardContent>
    </Card>
  );
}

interface CardGridSkeletonProps {
  cards?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Grid of card skeletons for KPI sections.
 */
export function CardGridSkeleton({
  cards = 4,
  columns = 4,
  className,
}: CardGridSkeletonProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(`grid grid-cols-1 ${gridCols[columns]} gap-4`, className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

/**
 * Chart placeholder skeleton.
 */
export function ChartSkeleton({ height = 300, className }: ChartSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div
          className="w-full rounded-lg bg-muted/30 flex items-end justify-around gap-2 p-4"
          style={{ height }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-8 rounded-t-sm"
              style={{ height: `${20 + ((i * 15) % 60)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

/**
 * Form skeleton for dialogs/forms.
 */
export function FormSkeleton({ fields = 3, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 mt-4" />
    </div>
  );
}

interface StatsSkeletonProps {
  cards?: number;
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Stats skeleton for stat card sections.
 */
export function StatsSkeleton({ cards, count, columns = 4, className }: StatsSkeletonProps) {
  const numCards = cards ?? count ?? 4;
  
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };
  
  return (
    <div className={cn(`grid grid-cols-1 ${gridCols[columns]} gap-4`, className)}>
      {Array.from({ length: numCards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
