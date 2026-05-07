'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Target, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Users, 
  BarChart3, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTenants } from '@/hooks/useTenants';
import { useTenantReportSummary } from '@/hooks/useReports';
import { ChartCardSkeleton } from '@/components/reports';
import { formatReportDate, exportReportToCSV } from '@/lib/report-utils';
import type { Tenant } from '@/lib/api';
import type { MetricsChartData, OutcomesChartData } from '@/components/reports';

// Import shared components
import {
  PageHeader,
} from '@/components/common';

// Lazy load chart components - Recharts bundle stays in these chunks
const ActivityBreakdownChart = dynamic(
  () => import('@/components/reports/ActivityBreakdownChart'),
  { 
    ssr: false, 
    loading: () => <ChartCardSkeleton height={250} /> 
  }
);

const OutcomesProgressChart = dynamic(
  () => import('@/components/reports/OutcomesProgressChart'),
  { 
    ssr: false, 
    loading: () => <ChartCardSkeleton height={250} /> 
  }
);

const MomentumProgressChart = dynamic(
  () => import('@/components/reports/MomentumProgressChart'),
  { 
    ssr: false, 
    loading: () => <ChartCardSkeleton height={200} /> 
  }
);

const EngagementSummaryChart = dynamic(
  () => import('@/components/reports/EngagementSummaryChart'),
  { 
    ssr: false, 
    loading: () => <ChartCardSkeleton height={200} /> 
  }
);

// Helper functions for trend display
function getTrendIcon(trend: string) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
}

function getMomentumBadge(score: number) {
  if (score >= 70) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Green</Badge>;
  } else if (score >= 40) {
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Yellow</Badge>;
  } else {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Red</Badge>;
  }
}

export default function ReportsPage() {
  const { toast } = useToast();
  
  // Filter state
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fetchEnabled, setFetchEnabled] = useState(false);

  // Fetch tenants for dropdown
  const { 
    data: tenantsData, 
    isLoading: tenantsLoading 
  } = useTenants({ page: 1, limit: 100 });

  // Build report params - memoized to prevent unnecessary re-fetches
  const reportParams = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    includeCharts: true,
  }), [startDate, endDate]);

  // Fetch report data
  const {
    data: reportData,
    isLoading: reportLoading,
    isError: reportError,
    refetch: refetchReport,
  } = useTenantReportSummary(selectedTenantId, reportParams, fetchEnabled && !!selectedTenantId);

  // Stable callback handlers
  const handleLoadReport = useCallback(() => {
    if (!selectedTenantId) {
      toast({
        title: 'Tenant Required',
        description: 'Please select a tenant to view the report.',
        variant: 'destructive',
      });
      return;
    }
    setFetchEnabled(true);
  }, [selectedTenantId, toast]);

  const handleRefresh = useCallback(() => {
    refetchReport();
    toast({
      title: 'Refreshing',
      description: 'Report data is being refreshed...',
    });
  }, [refetchReport, toast]);

  const handleExportCSV = useCallback(() => {
    if (!reportData) return;
    exportReportToCSV(reportData);
    toast({
      title: 'Export Complete',
      description: 'Report has been exported as CSV.',
    });
  }, [reportData, toast]);

  const handleTenantChange = useCallback((value: string) => {
    setSelectedTenantId(value);
    setFetchEnabled(false);
  }, []);

  // Memoized tenant list - handles both paginated and array responses
  const tenantsList = useMemo(() => {
    if (!tenantsData) return [];
    if (Array.isArray(tenantsData)) {
      return tenantsData;
    }
    return tenantsData.data || [];
  }, [tenantsData]);

  // Memoized chart data - only recalculated when reportData changes
  const metricsChartData = useMemo((): MetricsChartData[] => {
    if (!reportData) return [];
    return [
      { name: 'Metrics', value: reportData.metrics.totalMetricsLogged, fill: 'var(--color-metrics)' },
      { name: 'Activities', value: reportData.metrics.activitiesLogged, fill: 'var(--color-activities)' },
      { name: 'Sales', value: reportData.metrics.salesLogged, fill: 'var(--color-sales)' },
    ];
  }, [reportData]);

  const outcomesChartData = useMemo((): OutcomesChartData[] => {
    if (!reportData) return [];
    return [
      { name: 'Completed', value: reportData.metrics.outcomesCompleted, fill: 'var(--color-completed)' },
      { name: 'Remaining', value: reportData.metrics.outcomesTotal - reportData.metrics.outcomesCompleted, fill: 'var(--color-total)' },
    ];
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Header - Using shared PageHeader */}
      <PageHeader
        title="Reports"
        description="View detailed tenant performance reports and analytics"
        icon={FileText}
        actions={
          reportData && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )
        }
      />

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Parameters
          </CardTitle>
          <CardDescription>Select a tenant and date range to generate the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="tenant-select">Tenant</Label>
              <Select 
                value={selectedTenantId} 
                onValueChange={handleTenantChange}
                disabled={tenantsLoading}
              >
                <SelectTrigger id="tenant-select" className="mt-1.5">
                  <SelectValue placeholder={tenantsLoading ? "Loading tenants..." : "Select a tenant"} />
                </SelectTrigger>
                <SelectContent>
                  {tenantsList.map((tenant: Tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} {tenant.domain ? `(${tenant.domain})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="w-44">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button 
              onClick={handleLoadReport} 
              disabled={!selectedTenantId || reportLoading}
              className="h-10"
            >
              {reportLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder State */}
      {!fetchEnabled && !reportData && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No Report Selected</h3>
            <p className="text-gray-500 mt-1">Select a tenant and click &ldquo;Generate Report&rdquo; to view analytics</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {reportLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Loading Report</h3>
            <p className="text-gray-500 mt-1">Fetching data for the selected tenant...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {reportError && !reportLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">Failed to Load Report</h3>
            <p className="text-red-600 mt-1">There was an error fetching the report data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetchReport()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      {reportData && !reportLoading && (
        <>
          {/* Report Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{reportData.tenantName}</h2>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatReportDate(reportData.period.startDate)} — {formatReportDate(reportData.period.endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Momentum Status</p>
                    {getMomentumBadge(reportData.momentum.currentScore)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.metrics.completionRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData.metrics.outcomesCompleted} of {reportData.metrics.outcomesTotal} outcomes
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Momentum Score</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-gray-900">{reportData.momentum.currentScore}</p>
                      {getTrendIcon(reportData.momentum.trend)}
                    </div>
                    <p className={`text-sm mt-1 ${getTrendColor(reportData.momentum.trend)}`}>
                      Previous: {reportData.momentum.previousScore}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.momentum.streak}</p>
                    <p className="text-sm text-gray-500 mt-1">consecutive days</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.engagement.engagementRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData.engagement.activeDays} of {reportData.engagement.totalDays} days active
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Metrics Logged</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.metrics.totalMetricsLogged}</p>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Activities Logged</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.metrics.activitiesLogged}</p>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sales Logged</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.metrics.salesLogged}</p>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reviews Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.metrics.reviewsCompleted}</p>
                  </div>
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row - Lazy Loaded */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityBreakdownChart data={metricsChartData} />
            <OutcomesProgressChart data={outcomesChartData} />
          </div>

          {/* Momentum & Engagement Charts - Lazy Loaded */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MomentumProgressChart 
              currentScore={reportData.momentum.currentScore} 
              previousScore={reportData.momentum.previousScore} 
            />
            <EngagementSummaryChart 
              activeDays={reportData.engagement.activeDays} 
              totalDays={reportData.engagement.totalDays} 
            />
          </div>
        </>
      )}
    </div>
  );
}
