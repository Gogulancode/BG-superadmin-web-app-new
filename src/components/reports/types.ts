// Shared types for report chart components

export interface MetricsChartData {
  name: string;
  value: number;
  fill: string;
}

export interface OutcomesChartData {
  name: string;
  value: number;
  fill: string;
}

export interface MomentumChartData {
  period: string;
  score: number;
}

export interface EngagementChartData {
  name: string;
  activeDays: number;
}

// Props for chart components
export interface ActivityBreakdownChartProps {
  data: MetricsChartData[];
}

export interface OutcomesProgressChartProps {
  data: OutcomesChartData[];
}

export interface MomentumProgressChartProps {
  currentScore: number;
  previousScore: number;
}

export interface EngagementSummaryChartProps {
  activeDays: number;
  totalDays: number;
}
