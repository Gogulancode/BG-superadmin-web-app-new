'use client';

import { useState, useEffect } from 'react';
import {
  useSupportTicketList,
  useSupportTicket,
  useCreateSupportTicket,
  useUpdateSupportTicketStatus,
  useTenantList,
} from '@/hooks';
import {
  TicketStatus,
  TicketPriority,
  CreateSupportTicketPayload,
  UpdateSupportTicketStatusPayload,
} from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  MessageSquare,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Eye,
  User,
  Building2,
  Calendar,
  MessageCircle,
  Send,
} from 'lucide-react';

// Import shared components
import {
  PageHeader,
  TicketStatusBadge,
  PriorityBadge,
  TableSkeleton,
  EmptyState,
  StatCard,
  FilterBar,
} from '@/components/common';

// ============================================================================
// Ticket Detail Sheet
// ============================================================================
function TicketDetailSheet({
  open,
  onOpenChange,
  ticketId,
  onStatusUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
  onStatusUpdate: () => void;
}) {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<TicketStatus>('OPEN');
  const [assignee, setAssignee] = useState('');
  const [note, setNote] = useState('');

  const { data: ticket, isLoading } = useSupportTicket(ticketId || '', !!ticketId);
  const updateStatusMutation = useUpdateSupportTicketStatus();

  // Update local state when ticket data loads
  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
      setAssignee(ticket.assignee || '');
      setNote('');
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticketId) return;

    const payload: UpdateSupportTicketStatusPayload = {
      status: newStatus,
      assignee: assignee || undefined,
      note: note || undefined,
    };

    try {
      await updateStatusMutation.mutateAsync({ id: ticketId, payload });
      toast({
        title: 'Ticket Updated',
        description: 'Ticket status has been updated successfully.',
      });
      onStatusUpdate();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to update ticket.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ticket Details
          </SheetTitle>
          <SheetDescription>View and manage support ticket</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : ticket ? (
          <div className="mt-6 space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground">ID: {ticket.id}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <TicketStatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>
                    <strong>Tenant:</strong> {ticket.tenantName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <strong>Created:</strong> {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong>Updated:</strong> {formatDate(ticket.updatedAt)}
                  </span>
                </div>
                {ticket.assignee && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      <strong>Assignee:</strong> {ticket.assignee}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </div>
            </div>

            <Separator />

            {/* Comments/Activity */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Activity ({ticket.comments?.length || 0})
              </h4>
              {ticket.comments && ticket.comments.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No activity yet.
                </p>
              )}
            </div>

            <Separator />

            {/* Update Controls */}
            <div className="space-y-4">
              <h4 className="font-semibold">Update Ticket</h4>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Enter assignee name or email"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="note">Add Note (optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note about this update..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1"
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ticket not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Create Ticket Dialog
// ============================================================================
function CreateTicketDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');

  // Fetch tenants for dropdown
  const { data: tenantsData } = useTenantList({ pageSize: 100 });
  const tenants = Array.isArray(tenantsData) ? tenantsData : tenantsData?.data || [];

  const createMutation = useCreateSupportTicket();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTenantId('');
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateSupportTicketPayload = {
      tenantId,
      subject,
      description,
      priority,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast({
        title: 'Ticket Created',
        description: 'Support ticket has been created successfully.',
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to create ticket.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Create a new support ticket on behalf of a tenant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select value={tenantId} onValueChange={setTenantId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !tenantId || !subject || !description}>
              {createMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Support Page Component
// ============================================================================
export default function SupportPage() {
  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog/Sheet states
  const [viewTicketId, setViewTicketId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Query
  const {
    data: ticketsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useSupportTicketList({
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
  });

  // Handle both array and paginated response
  const ticketsResponse = ticketsData;
  const tickets = Array.isArray(ticketsResponse)
    ? ticketsResponse
    : ticketsResponse?.data || [];
  const total = Array.isArray(ticketsResponse)
    ? ticketsResponse.length
    : ticketsResponse?.total || 0;
  const totalPages = Array.isArray(ticketsResponse)
    ? 1
    : ticketsResponse?.totalPages || Math.ceil(total / pageSize);

  // Calculate stats from current page data (ideally from backend)
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const highPriorityCount = tickets.filter(
    (t) => t.priority === 'HIGH'
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header - Using shared PageHeader */}
      <PageHeader
        title="Support Tickets"
        description="Manage support requests across all tenants"
        icon={MessageSquare}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        }
      />

      {/* Stats Cards - Using shared StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Open" value={openCount} />
        <StatCard icon={AlertTriangle} label="In Progress" value={inProgressCount} />
        <StatCard icon={AlertCircle} label="High Priority" value={highPriorityCount} />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolvedCount} />
      </div>

      {/* Filters - Using shared FilterBar */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            searchValue={search}
            searchPlaceholder="Search by subject or tenant..."
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Open', value: 'OPEN' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Resolved', value: 'RESOLVED' },
                ],
              },
              {
                key: 'priority',
                label: 'Priority',
                options: [
                  { label: 'Low', value: 'LOW' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'High', value: 'HIGH' },
                ],
              },
            ]}
            filterValues={{
              status: statusFilter,
              priority: priorityFilter,
            }}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value as TicketStatus | 'ALL');
              if (key === 'priority') setPriorityFilter(value as TicketPriority | 'ALL');
              setPage(1);
            }}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tickets
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {total} {total === 1 ? 'ticket' : 'tickets'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load tickets"
              description={(error as Error)?.message || 'An unexpected error occurred.'}
              onRetry={() => refetch()}
              variant="error"
            />
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No tickets found"
              description={
                search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No tickets match your current filters. Try adjusting your search criteria.'
                  : 'No support tickets have been submitted yet.'
              }
              action={!search && statusFilter === 'ALL' && priorityFilter === 'ALL' ? () => setCreateDialogOpen(true) : undefined}
              actionLabel="Create Ticket"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{ticket.tenantName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium truncate">{ticket.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            #{ticket.id.slice(0, 8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {ticket.assignee ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{ticket.assignee}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewTicketId(ticket.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
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
                    {Math.min(page * pageSize, total)} of {total} tickets
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
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

      {/* View Ticket Sheet */}
      <TicketDetailSheet
        open={!!viewTicketId}
        onOpenChange={(open) => !open && setViewTicketId(null)}
        ticketId={viewTicketId}
        onStatusUpdate={() => refetch()}
      />

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
