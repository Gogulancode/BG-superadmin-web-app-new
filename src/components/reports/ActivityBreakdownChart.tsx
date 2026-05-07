'use client';

import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/chart';
import type { ChartConfig } from '@/components/chart';
import type { ActivityBreakdownChartProps } from './types';

const chartConfig = {
  metrics: {
    label: 'Metrics Logged',
    color: 'hsl(var(--chart-1))',
  },
  activities: {
    label: 'Activities',
    color: 'hsl(var(--chart-2))',
  },
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

function ActivityBreakdownChart({ data }: ActivityBreakdownChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => data, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Breakdown</CardTitle>
        <CardDescription>Distribution of logged activities by type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default memo(ActivityBreakdownChart);
