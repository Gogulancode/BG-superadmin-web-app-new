'use client';

import { useState, useEffect } from 'react';
import {
  useTemplateList,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
} from '@/hooks';
import {
  Template,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplateScope,
  TemplateStatus,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  Users,
} from 'lucide-react';

// Import shared components
import {
  PageHeader,
  TemplateStatusBadge,
  TableSkeleton,
  EmptyState,
  FilterBar,
} from '@/components/common';

// ============================================================================
// Scope Badge Component
// ============================================================================
import { Badge } from '@/components/ui/badge';

function ScopeBadge({ scope }: { scope: TemplateScope }) {
  const variants: Record<TemplateScope, { className: string; label: string }> = {
    GLOBAL: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Global' },
    DEFAULT: { className: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Default' },
  };
  const { className, label } = variants[scope] || variants.DEFAULT;
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

// ============================================================================
// Template Form Dialog (Create/Edit)
// ============================================================================
function TemplateFormDialog({
  open,
  onOpenChange,
  templateId,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSubmit: (data: CreateTemplatePayload, isEdit: boolean) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<TemplateScope>('GLOBAL');
  const [status, setStatus] = useState<TemplateStatus>('ACTIVE');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('');

  // Fetch template by ID when editing
  const { data: template, isLoading: templateLoading } = useTemplate(templateId || '', !!templateId);

  const isEdit = !!templateId;

  // Populate form when template data is loaded or dialog opens
  useEffect(() => {
    if (open) {
      if (template && isEdit) {
        setName(template.name);
        setDescription(template.description || '');
        setScope(template.scope);
        setStatus(template.status);
        setCategory(template.category || '');
        setFrequency(template.frequency || '');
      } else if (!isEdit) {
        // Reset form for create
        setName('');
        setDescription('');
        setScope('GLOBAL');
        setStatus('ACTIVE');
        setCategory('');
        setFrequency('');
      }
    }
  }, [open, template, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        name,
        description: description || undefined,
        scope,
        category: category || undefined,
        frequency: frequency || undefined,
        metricSchema: template?.metricSchema || [],
      },
      isEdit
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update template details below.'
              : 'Create a new metric template for tenants.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && templateLoading ? (
          <div className="py-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sales Pipeline Template"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what metrics this template includes..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Sales, Marketing, Operations"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency || ''} onValueChange={(v) => setFrequency(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select value={scope} onValueChange={(v) => setScope(v as TemplateScope)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                      <SelectItem value="DEFAULT">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isEdit && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as TemplateStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !name}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : isEdit ? (
                  'Save Changes'
                ) : (
                  'Create Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================
function DeleteConfirmDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{template?.name}</strong>? This action cannot
            be undone.
            {template?.usedByTenantsCount && template.usedByTenantsCount > 0 && (
              <span className="block mt-2 text-orange-600">
                ⚠️ This template is currently used by {template.usedByTenantsCount} tenant(s).
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Main Templates Page Component
// ============================================================================
export default function TemplatesPage() {
  const { toast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<TemplateScope | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'ALL'>('ALL');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);

  // Queries
  const {
    data: templatesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTemplateList({
    search: search || undefined,
    scope: scopeFilter !== 'ALL' ? scopeFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  // Mutations
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();

  // Handlers
  const handleSubmit = async (data: CreateTemplatePayload, isEdit: boolean) => {
    try {
      if (isEdit && editTemplateId) {
        await updateMutation.mutateAsync({
          id: editTemplateId,
          payload: data as UpdateTemplatePayload,
        });
        setEditTemplateId(null);
        toast({
          title: 'Template Updated',
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        await createMutation.mutateAsync(data);
        setCreateDialogOpen(false);
        toast({
          title: 'Template Created',
          description: `${data.name} has been successfully created.`,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || `Failed to ${isEdit ? 'update' : 'create'} template.`,
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      await duplicateMutation.mutateAsync(template);
      toast({
        title: 'Template Duplicated',
        description: `${template.name} (Copy) has been created.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to duplicate template.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;
    try {
      await deleteMutation.mutateAsync(deleteTemplate.id);
      const templateName = deleteTemplate.name;
      setDeleteTemplate(null);
      toast({
        title: 'Template Deleted',
        description: `${templateName} has been permanently deleted.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  };

  // Handle both array and paginated response
  const templates = Array.isArray(templatesData)
    ? templatesData
    : templatesData?.data || [];
  const total = Array.isArray(templatesData)
    ? templatesData.length
    : templatesData?.total || templates.length;

  return (
    <div className="space-y-6">
      {/* Header - Using shared PageHeader */}
      <PageHeader
        title="Global Templates"
        description="Manage metric templates for tenant onboarding"
        icon={FileText}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        }
      />

      {/* Filters - Using shared FilterBar */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            searchValue={search}
            searchPlaceholder="Search templates..."
            onSearchChange={setSearch}
            filters={[
              {
                key: 'scope',
                label: 'Scope',
                options: [
                  { label: 'Global', value: 'GLOBAL' },
                  { label: 'Default', value: 'DEFAULT' },
                ],
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                ],
              },
            ]}
            filterValues={{
              scope: scopeFilter,
              status: statusFilter,
            }}
            onFilterChange={(key, value) => {
              if (key === 'scope') setScopeFilter(value as TemplateScope | 'ALL');
              if (key === 'status') setStatusFilter(value as TemplateStatus | 'ALL');
            }}
            onRefresh={() => refetch()}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {total} {total === 1 ? 'template' : 'templates'}
            </span>
          </CardTitle>
          <CardDescription>Pre-configured metric sets for tenant onboarding</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load templates"
              description={(error as Error)?.message || 'An unexpected error occurred.'}
              onRetry={() => refetch()}
              variant="error"
            />
          ) : templates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No templates found"
              description={
                search || scopeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No templates match your current filters. Try adjusting your search criteria.'
                  : 'Create your first template to get started.'
              }
              action={!search && scopeFilter === 'ALL' && statusFilter === 'ALL' ? () => setCreateDialogOpen(true) : undefined}
              actionLabel="Create Template"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {template.type || 'metric'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {template.category || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground capitalize">
                        {template.frequency || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ScopeBadge scope={template.scope} />
                    </TableCell>
                    <TableCell>
                      <TemplateStatusBadge status={template.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setEditTemplateId(template.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(template)}
                            disabled={duplicateMutation.isPending}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTemplate(template)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <TemplateFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <TemplateFormDialog
        open={!!editTemplateId}
        onOpenChange={(open) => !open && setEditTemplateId(null)}
        templateId={editTemplateId || undefined}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
        template={deleteTemplate || undefined}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
