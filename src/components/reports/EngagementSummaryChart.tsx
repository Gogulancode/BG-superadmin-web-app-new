'use client';

import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/chart';
import type { ChartConfig } from '@/components/chart';
import type { EngagementSummaryChartProps } from './types';

const chartConfig = {
  activeDays: {
    label: 'Active Days',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function EngagementSummaryChart({ activeDays, totalDays }: EngagementSummaryChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => [
    { name: 'Active Days', activeDays: activeDays },
    { name: 'Inactive Days', activeDays: totalDays - activeDays },
  ], [activeDays, totalDays]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Summary</CardTitle>
        <CardDescription>Active days in the reporting period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="activeDays" fill="var(--color-activeDays)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default memo(EngagementSummaryChart);
