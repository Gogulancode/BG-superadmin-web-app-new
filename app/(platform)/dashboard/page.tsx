'use client';

import { useDashboardSummary } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building2, Users, Target, CheckCircle2, RefreshCw, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  PageHeader,
  KpiCard,
  StatCard,
  StatsSkeleton,
  ChartSkeleton,
  EmptyState,
} from '@/components/common';

// Loading Skeleton - using shared components
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatsSkeleton count={4} columns={4} />
      <StatsSkeleton count={3} columns={3} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

// Error State Component - using shared EmptyState
function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Failed to load dashboard"
      description={error.message || 'An error occurred while fetching dashboard data.'}
      onRetry={onRetry}
      variant="error"
    />
  );
}

export default function PlatformDashboard() {
  const { data: summary, isLoading, isError, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Platform Dashboard"
          description="Overview of your multi-tenant SaaS platform"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Platform Dashboard"
          description="Overview of your multi-tenant SaaS platform"
        />
        <DashboardError error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  // Mock growth data if not available from API
  const tenantGrowthData = summary?.tenantGrowthSeries?.length
    ? summary.tenantGrowthSeries
    : [
        { date: 'Jan', count: 12 },
        { date: 'Feb', count: 18 },
        { date: 'Mar', count: 25 },
        { date: 'Apr', count: 32 },
        { date: 'May', count: 45 },
        { date: 'Jun', count: summary?.totalTenants || 52 },
      ];

  // Mock top tenants if not available from API
  const topTenantsData = summary?.topTenantsByActivity?.length
    ? summary.topTenantsByActivity
    : [
        { tenantName: 'Acme Corp', activityScore: 95 },
        { tenantName: 'TechStart Inc', activityScore: 87 },
        { tenantName: 'Growth Labs', activityScore: 76 },
        { tenantName: 'Summit Co', activityScore: 68 },
        { tenantName: 'Vista Digital', activityScore: 54 },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Platform Dashboard"
        description="Overview of your multi-tenant SaaS platform"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* KPI Cards - Using shared KpiCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Tenants"
          value={summary?.totalTenants ?? 0}
          icon={Building2}
          description="Registered businesses"
          trend={{ value: 12, isPositive: true }}
        />
        <KpiCard
          title="Active Tenants"
          value={summary?.activeTenants ?? 0}
          icon={Activity}
          description="Active in last 7 days"
          trend={{ value: 8, isPositive: true }}
        />
        <KpiCard
          title="Total Users"
          value={summary?.totalUsers ?? 0}
          icon={Users}
          description="Across all tenants"
          trend={{ value: 15, isPositive: true }}
        />
        <KpiCard
          title="Total Outcomes"
          value={summary?.totalOutcomes ?? 0}
          icon={CheckCircle2}
          description="Platform-wide outcomes"
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      {/* Secondary Stats Row - Using shared StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Target}
          label="Business KPIs monitored"
          value={summary?.totalMetrics ?? 0}
        />
        <StatCard
          icon={AlertCircle}
          label="Need re-engagement"
          value={summary?.inactiveTenants ?? 0}
        />
        <StatCard
          icon={AlertCircle}
          label="Awaiting resolution"
          value={summary?.openSupportTickets ?? 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Growth</CardTitle>
            <CardDescription>Monthly tenant acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tenantGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Tenants"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Tenants by Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tenants by Activity</CardTitle>
            <CardDescription>Most engaged businesses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTenantsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="tenantName"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Activity Score']}
                  />
                  <Bar
                    dataKey="activityScore"
                    name="Activity Score"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common platform management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href="/tenants/new">
                <Building2 className="h-4 w-4 mr-2" />
                Add New Tenant
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/templates">
                <Target className="h-4 w-4 mr-2" />
                Manage Templates
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/support">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Support Tickets
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/audit">
                <Activity className="h-4 w-4 mr-2" />
                Audit Logs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
