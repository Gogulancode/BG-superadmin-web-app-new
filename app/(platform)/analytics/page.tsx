'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { RefreshCw, TrendingUp, Users, Activity, Target, BarChart3, PieChart, Building2 } from 'lucide-react';
import { usePlatformStats, useTenantGrowth, useHealthDistribution, useTopPerformers } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('30d');

  const { data: stats, isLoading: statsLoading, isRefetching } = usePlatformStats();
  const { data: tenantGrowth } = useTenantGrowth();
  const { data: healthDist } = useHealthDistribution();
  const { data: topPerformers } = useTopPerformers();

  const loading = statsLoading;
  const refreshing = isRefetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const getFlagColor = (flag: string) => {
    if (flag === 'Green' || flag === 'healthy') return 'bg-green-100 text-green-800';
    if (flag === 'Yellow' || flag === 'atRisk') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalTenants = stats?.totalTenants || 0;
  const activeTenants = stats?.activeTenants || 0;
  const inactiveTenants = stats?.inactiveTenants || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalMetrics = stats?.totalMetrics || 0;
  const totalOutcomes = stats?.totalOutcomes || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-500 mt-1">Insights and metrics across all tenants</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{activeTenants} active</span>
              {' · '}
              <span className="text-gray-500">{inactiveTenants} inactive</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {totalTenants > 0 ? (totalUsers / totalTenants).toFixed(1) : 0} per tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Outcomes</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOutcomes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Goals tracked platform-wide
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tenant Growth
            </CardTitle>
            <CardDescription>Monthly tenant acquisition trend</CardDescription>
          </CardHeader>
          <CardContent>
            {tenantGrowth && tenantGrowth.length > 0 ? (
              <div className="space-y-3">
                {tenantGrowth.slice(-6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 bg-blue-500 rounded" 
                        style={{ width: `${Math.min((item.count / Math.max(...tenantGrowth.map(g => g.count))) * 150, 150)}px` }}
                      />
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No growth data available</p>
            )}
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tenant Health Distribution
            </CardTitle>
            <CardDescription>Based on onboarding and activity status</CardDescription>
          </CardHeader>
          <CardContent>
            {healthDist ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Healthy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{healthDist.healthy}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {totalTenants > 0 ? Math.round((healthDist.healthy / totalTenants) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">At Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{healthDist.atRisk}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {totalTenants > 0 ? Math.round((healthDist.atRisk / totalTenants) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{healthDist.critical}</span>
                    <Badge className="bg-red-100 text-red-800">
                      {totalTenants > 0 ? Math.round((healthDist.critical / totalTenants) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No health data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performing Tenants
          </CardTitle>
          <CardDescription>Ranked by activity and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {topPerformers && topPerformers.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.slice(0, 10).map((tenant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{idx + 1}</span>
                    <div>
                      <p className="font-medium">{tenant.tenantName}</p>
                      <p className="text-xs text-gray-500">Activity Score: {tenant.activityScore}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Top {Math.round(((idx + 1) / topPerformers.length) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No performer data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
