'use client';

import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/chart';
import type { ChartConfig } from '@/components/chart';
import type { OutcomesProgressChartProps } from './types';

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

function OutcomesProgressChart({ data }: OutcomesProgressChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => data, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcomes Progress</CardTitle>
        <CardDescription>Completed vs remaining weekly outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default memo(OutcomesProgressChart);
