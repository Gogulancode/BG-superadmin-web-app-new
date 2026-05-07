'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuditLogs } from '@/hooks';
import { AuditLogEntry, AuditEventType } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  History,
  RefreshCw,
  Search,
  Download,
  User,
  Shield,
  Database,
  Settings,
  Eye,
  Calendar,
  Building2,
  X,
  Filter,
} from 'lucide-react';

// Import shared components
import {
  PageHeader,
  TableSkeleton,
  EmptyState,
} from '@/components/common';

// ============================================================================
// Custom Hook for Debounced Value
// ============================================================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Action Type Badge Component
// ============================================================================
function ActionBadge({ eventType }: { eventType: string }) {
  const getActionStyle = (eventType: string) => {
    if (eventType.includes('CREATED') || eventType.includes('create')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (eventType.includes('DELETED') || eventType.includes('delete') || eventType.includes('REVOKE') || eventType.includes('DEACTIVATED')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (eventType.includes('UPDATED') || eventType.includes('update') || eventType.includes('MODIFIED') || eventType.includes('ACTIVATED') || eventType.includes('CHANGED')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (eventType.includes('LOGIN')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (eventType.includes('LOGOUT')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Badge variant="outline" className={getActionStyle(eventType)}>
      {formatEventType(eventType)}
    </Badge>
  );
}

// ============================================================================
// Actor Icon Component
// ============================================================================
function ActorIcon({ actor }: { actor: string }) {
  const lowerActor = (actor || 'system').toLowerCase();
  if (lowerActor === 'system') {
    return <Database className="h-4 w-4 text-muted-foreground" />;
  }
  if (lowerActor === 'automation' || lowerActor === 'scheduler') {
    return <Settings className="h-4 w-4 text-muted-foreground" />;
  }
  if (lowerActor.includes('admin') || lowerActor.includes('superadmin')) {
    return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
  return <User className="h-4 w-4 text-muted-foreground" />;
}

// ============================================================================
// Metadata Details Dialog
// ============================================================================
function MetadataDialog({
  open,
  onOpenChange,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLogEntry | null;
}) {
  if (!entry) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>
            Full details for this audit entry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">ID</Label>
              <p className="font-mono text-xs mt-1">{entry.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Timestamp</Label>
              <p className="mt-1">{formatDate(entry.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Actor</Label>
              <div className="flex items-center gap-2 mt-1">
                <ActorIcon actor={entry.actor} />
                <span>{entry.actor}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Event Type</Label>
              <div className="mt-1">
                <ActionBadge eventType={entry.eventType} />
              </div>
            </div>
            {entry.tenantId && (
              <div>
                <Label className="text-muted-foreground">Tenant</Label>
                <p className="mt-1">{entry.tenantName || entry.tenantId}</p>
              </div>
            )}
            {entry.resource && (
              <div>
                <Label className="text-muted-foreground">Resource</Label>
                <p className="mt-1 font-mono text-xs">{entry.resource}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div>
              <Label className="text-muted-foreground">Metadata</Label>
              <pre className="mt-2 p-4 rounded-lg bg-muted/50 text-xs overflow-x-auto font-mono">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Known Event Types for Filter
// ============================================================================
const EVENT_TYPES: { value: AuditEventType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Events' },
  { value: 'TENANT_CREATED', label: 'Tenant Created' },
  { value: 'TENANT_UPDATED', label: 'Tenant Updated' },
  { value: 'TENANT_ACTIVATED', label: 'Tenant Activated' },
  { value: 'TENANT_DEACTIVATED', label: 'Tenant Deactivated' },
  { value: 'TEMPLATE_CREATED', label: 'Template Created' },
  { value: 'TEMPLATE_UPDATED', label: 'Template Updated' },
  { value: 'TEMPLATE_DELETED', label: 'Template Deleted' },
  { value: 'SUPPORT_TICKET_CREATED', label: 'Ticket Created' },
  { value: 'SUPPORT_TICKET_UPDATED', label: 'Ticket Updated' },
  { value: 'USER_LOGIN', label: 'User Login' },
  { value: 'USER_LOGOUT', label: 'User Logout' },
  { value: 'SETTINGS_CHANGED', label: 'Settings Changed' },
];

// ============================================================================
// Main Audit Page Component
// ============================================================================
export default function AuditPage() {
  const { toast } = useToast();

  // Filter states
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<AuditEventType | 'ALL'>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Dialog state
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Debounce search inputs to avoid spamming API
  const debouncedSearch = useDebounce(search, 500);
  const debouncedTenant = useDebounce(tenantFilter, 500);
  const debouncedUser = useDebounce(userFilter, 500);

  // Query
  const {
    data: auditData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAuditLogs({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    tenantId: debouncedTenant || undefined,
    userId: debouncedUser || undefined,
    eventType: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedTenant, debouncedUser, eventTypeFilter, fromDate, toDate]);

  // Extract data from response (memoized to avoid re-renders)
  const auditLogs = useMemo(() => auditData?.data || [], [auditData?.data]);
  const total = auditData?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Check if any filters are active
  const hasActiveFilters = search || tenantFilter || userFilter || eventTypeFilter !== 'ALL' || fromDate || toDate;

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setTenantFilter('');
    setUserFilter('');
    setEventTypeFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // Export to CSV
  const handleExport = useCallback(() => {
    if (auditLogs.length === 0) {
      toast({
        title: 'No Data',
        description: 'No audit logs to export.',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = [
      ['Timestamp', 'Actor', 'Event Type', 'Resource', 'Tenant ID', 'Tenant Name'],
      ...auditLogs.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.actor,
        log.eventType,
        log.resource || '',
        log.tenantId || '',
        log.tenantName || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${auditLogs.length} audit log entries.`,
    });
  }, [auditLogs, toast]);

  // Format timestamp
  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header - Using shared PageHeader */}
      <PageHeader
        title="Audit Log"
        description="Centralized record of all platform-level changes and actions"
        icon={History}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={auditLogs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search and Event Type */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by actor, resource, or metadata..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={eventTypeFilter}
                onValueChange={(v) => setEventTypeFilter(v as AuditEventType | 'ALL')}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Tenant, User, Date Range */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by tenant ID or name..."
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by user email..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="pl-9 w-[160px]"
                    placeholder="From date"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[160px]"
                  placeholder="To date"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {search}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearch('')}
                      />
                    </Badge>
                  )}
                  {tenantFilter && (
                    <Badge variant="secondary" className="gap-1">
                      Tenant: {tenantFilter}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setTenantFilter('')}
                      />
                    </Badge>
                  )}
                  {userFilter && (
                    <Badge variant="secondary" className="gap-1">
                      User: {userFilter}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setUserFilter('')}
                      />
                    </Badge>
                  )}
                  {eventTypeFilter !== 'ALL' && (
                    <Badge variant="secondary" className="gap-1">
                      Event: {EVENT_TYPES.find((t) => t.value === eventTypeFilter)?.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setEventTypeFilter('ALL')}
                      />
                    </Badge>
                  )}
                  {(fromDate || toDate) && (
                    <Badge variant="secondary" className="gap-1">
                      Date: {fromDate || '...'} to {toDate || '...'}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setFromDate('');
                          setToDate('');
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Activity Log
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {total} {total === 1 ? 'entry' : 'entries'}
            </span>
          </CardTitle>
          <CardDescription>
            Complete audit trail of all administrative actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load audit logs"
              description={(error as Error)?.message || 'An unexpected error occurred.'}
              onRetry={() => refetch()}
              variant="error"
            />
          ) : auditLogs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No audit logs found"
              description={
                hasActiveFilters
                  ? 'No logs match your current filters. Try adjusting your search criteria.'
                  : 'No activities have been logged yet.'
              }
              action={hasActiveFilters ? clearFilters : undefined}
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        {entry.tenantId ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">
                              {entry.tenantName || entry.tenantId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Global</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActorIcon actor={entry.actor} />
                          <span className="truncate max-w-[150px]">{entry.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionBadge eventType={entry.eventType} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="truncate max-w-[200px] block font-mono text-xs">
                          {entry.resource || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, total)} of {total} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isFetching}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isFetching}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Metadata Details Dialog */}
      <MetadataDialog
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  );
}
