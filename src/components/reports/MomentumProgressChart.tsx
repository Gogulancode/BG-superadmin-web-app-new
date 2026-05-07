'use client';

import { memo, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/chart';
import type { ChartConfig } from '@/components/chart';
import type { MomentumProgressChartProps } from './types';

const chartConfig = {
  score: {
    label: 'Momentum Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

function MomentumProgressChart({ currentScore, previousScore }: MomentumProgressChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => [
    { period: 'Previous', score: previousScore },
    { period: 'Current', score: currentScore },
  ], [currentScore, previousScore]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Progress</CardTitle>
        <CardDescription>Current vs previous momentum score comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--color-score)"
              fill="var(--color-score)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default memo(MomentumProgressChart);
