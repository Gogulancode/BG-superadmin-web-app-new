// Chart loading skeleton for lazy-loaded chart components
export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-60 bg-gray-100 rounded mb-4" />
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading chart...</span>
        </div>
      </div>
    </div>
  );
}

// Card wrapper for chart skeleton
export function ChartCardSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <ChartSkeleton height={height} />
    </div>
  );
}
