import type { TenantReportSummary } from '@/lib/api';

/**
 * Format a date string to a readable format
 */
export function formatReportDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate CSV content from report data and trigger download
 */
export function exportReportToCSV(reportData: TenantReportSummary): void {
  const csvData = [
    ['Business Accountability Report'],
    ['Tenant', reportData.tenantName],
    ['Period', `${formatReportDate(reportData.period.startDate)} - ${formatReportDate(reportData.period.endDate)}`],
    [''],
    ['METRICS'],
    ['Total Metrics Logged', reportData.metrics.totalMetricsLogged.toString()],
    ['Outcomes Completed', reportData.metrics.outcomesCompleted.toString()],
    ['Outcomes Total', reportData.metrics.outcomesTotal.toString()],
    ['Completion Rate', `${reportData.metrics.completionRate}%`],
    ['Activities Logged', reportData.metrics.activitiesLogged.toString()],
    ['Sales Logged', reportData.metrics.salesLogged.toString()],
    ['Reviews Completed', reportData.metrics.reviewsCompleted.toString()],
    [''],
    ['MOMENTUM'],
    ['Current Score', reportData.momentum.currentScore.toString()],
    ['Previous Score', reportData.momentum.previousScore.toString()],
    ['Trend', reportData.momentum.trend],
    ['Streak', `${reportData.momentum.streak} days`],
    [''],
    ['ENGAGEMENT'],
    ['Active Days', reportData.engagement.activeDays.toString()],
    ['Total Days', reportData.engagement.totalDays.toString()],
    ['Engagement Rate', `${reportData.engagement.engagementRate}%`],
  ];

  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `report-${reportData.tenantId}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
}
