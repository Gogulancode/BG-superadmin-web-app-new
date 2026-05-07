'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { RefreshCw, Server, Database, Shield, Activity, AlertTriangle, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { useAuditLogs } from '@/hooks';
import { API_URL, api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Types for health and telemetry data from our backend ops endpoints
interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  database: { status: string; latencyMs?: number };
  redis?: { status: string; connected?: boolean };
  memory: { heapUsed: number; heapTotal: number; rss: number };
}

interface TelemetryData {
  jobsProcessed: number;
  jobsFailed: number;
  avgProcessingTimeMs: number;
  queueDepth: number;
  lastRunAt: string;
}

interface RateLimitData {
  tenantId: string;
  tenantName: string;
  requestCount: number;
  limitReached: boolean;
  windowStart: string;
}

// Custom hooks using the api() function for proper token handling
function useOpsHealth() {
  return useQuery<HealthStatus, Error>({
    queryKey: ['ops', 'health'],
    queryFn: async () => {
      // Health endpoint might not require auth
      const res = await fetch(`${API_URL}/api/v1/ops/health`);
      if (!res.ok) throw new Error('Failed to fetch health');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

function useOpsTelemetry() {
  return useQuery<TelemetryData, Error>({
    queryKey: ['ops', 'telemetry'],
    queryFn: () => api<TelemetryData>('/api/v1/ops/telemetry'),
    refetchInterval: 30000,
    staleTime: 10000,
    retry: false,
  });
}

function useOpsRateLimits() {
  return useQuery<{ tenants: RateLimitData[] }, Error>({
    queryKey: ['ops', 'rateLimits'],
    queryFn: () => api<{ tenants: RateLimitData[] }>('/api/v1/ops/rate-limits'),
    refetchInterval: 30000,
    staleTime: 10000,
    retry: false,
  });
}

export default function OpsPage() {
  const queryClient = useQueryClient();
  
  const { data: health, isLoading: healthLoading, isRefetching: healthRefetching } = useOpsHealth();
  const { data: telemetry } = useOpsTelemetry();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ pageSize: 20 });
  const { data: rateLimitsData } = useOpsRateLimits();
  
  const auditLogs = auditData?.data || [];
  const rateLimits = rateLimitsData?.tenants || [];
  
  const loading = healthLoading;
  const refreshing = healthRefetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ops'] });
    queryClient.invalidateQueries({ queryKey: ['audit'] });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const getStatusIcon = (status: string) => {
    if (status === 'healthy' || status === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'degraded') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'healthy' || status === 'ok') return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
    if (status === 'degraded') return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
    return <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Operations</h1>
          <p className="text-gray-500 mt-1">Monitor system health, performance, and audit logs</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health && getStatusIcon(health.status)}
              {health && getStatusBadge(health.status)}
            </div>
            {health && <p className="text-xs text-gray-500 mt-2">Uptime: {formatUptime(health.uptime)}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health?.database && getStatusIcon(health.database.status)}
              {health?.database && getStatusBadge(health.database.status)}
            </div>
            {health?.database?.latencyMs && (
              <p className="text-xs text-gray-500 mt-2">Latency: {health.database.latencyMs}ms</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <Wifi className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health?.redis && getStatusIcon(health.redis.status)}
              {health?.redis && getStatusBadge(health.redis.status)}
            </div>
            {health?.redis?.connected !== undefined && (
              <p className="text-xs text-gray-500 mt-2">
                {health.redis.connected ? 'Connected' : 'Disconnected'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {health?.memory && (
              <>
                <div className="text-2xl font-bold">
                  {Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100)}%
                </div>
                <p className="text-xs text-gray-500">
                  {formatBytes(health.memory.heapUsed)} / {formatBytes(health.memory.heapTotal)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Stats */}
      {telemetry && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Jobs Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telemetry.jobsProcessed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Jobs Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{telemetry.jobsFailed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telemetry.avgProcessingTimeMs}ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Queue Depth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telemetry.queueDepth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Audit Logs
              </CardTitle>
              <CardDescription>Platform-wide activity log for security monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Tenant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No audit logs available
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs">{new Date(log.createdAt).toLocaleString()}</TableCell>
                          <TableCell>{log.actor}</TableCell>
                          <TableCell><Badge variant="outline">{log.eventType}</Badge></TableCell>
                          <TableCell className="text-sm">{log.resource || '-'}</TableCell>
                          <TableCell>{log.tenantName || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Overview</CardTitle>
              <CardDescription>Current rate limit status per tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Request Count</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No rate limit data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    rateLimits.map((rl, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{rl.tenantName || rl.tenantId}</TableCell>
                        <TableCell>{rl.requestCount}</TableCell>
                        <TableCell>
                          {rl.limitReached ? (
                            <Badge className="bg-red-100 text-red-800">Limit Reached</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>Runtime environment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">Environment</h4>
                  <p className="text-gray-900">{process.env.NODE_ENV || 'development'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">API URL</h4>
                  <p className="text-gray-900 text-sm break-all">{API_URL}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">Last Health Check</h4>
                  <p className="text-gray-900">{health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">RSS Memory</h4>
                  <p className="text-gray-900">{health?.memory ? formatBytes(health.memory.rss) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
