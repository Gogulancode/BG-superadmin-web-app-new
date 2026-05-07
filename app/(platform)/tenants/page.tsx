'use client';

import { useState, useEffect } from 'react';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useTenant,
  useTenantStats,
  useActivateTenant,
  useDeactivateTenant,
} from '@/hooks';
import {
  Tenant,
  CreateTenantPayload,
  TenantStatus,
  SubscriptionPlan,
  OnboardingFilter,
} from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Eye,
  Power,
  PowerOff,
  Users,
  Target,
  Activity,
  TrendingUp,
  Calendar,
  Mail,
  Globe,
  Flame,
  BarChart3,
  CheckCircle2,
  Copy,
  Key,
  ExternalLink,
} from 'lucide-react';

// Import shared components
import {
  PageHeader,
  TenantStatusBadge,
  PlanBadge,
  OnboardingBadge,
  TableSkeleton,
  EmptyState,
  StatCard,
  FilterBar,
} from '@/components/common';

// ============================================================================
// View Tenant Sheet (Drawer)
// ============================================================================
function ViewTenantSheet({
  open,
  onOpenChange,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string | null;
}) {
  const { data: tenant, isLoading: tenantLoading } = useTenant(tenantId || '', !!tenantId);
  const { data: stats, isLoading: statsLoading } = useTenantStats(tenantId || '', !!tenantId);

  const isLoading = tenantLoading || statsLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tenant Details
          </SheetTitle>
          <SheetDescription>
            View detailed information and statistics for this tenant
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : tenant ? (
          <div className="mt-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{tenant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TenantStatusBadge status={tenant.status} />
                    <PlanBadge plan={tenant.plan} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{tenant.email}</span>
                </div>
                {tenant.domain && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{tenant.domain}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(tenant.createdAt).toLocaleDateString()}</span>
                </div>
                {tenant.lastActiveAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Last active {new Date(tenant.lastActiveAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Onboarding Status */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Onboarding Status
              </h4>
              <div className="flex items-center gap-3">
                <OnboardingBadge isOnboarded={tenant.isOnboarded} onboardingStep={tenant.onboardingStep} />
                {tenant.onboardingCompletedAt && (
                  <span className="text-sm text-muted-foreground">
                    Completed on {new Date(tenant.onboardingCompletedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {!tenant.isOnboarded && tenant.onboardingStep && tenant.onboardingStep > 1 && (
                <p className="text-sm text-muted-foreground mt-2">
                  User is currently on step {tenant.onboardingStep} of the onboarding process.
                </p>
              )}
            </div>

            {/* Statistics */}
            {stats && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      icon={TrendingUp}
                      label="Momentum Score"
                      value={`${stats.momentumScore}%`}
                    />
                    <StatCard
                      icon={Flame}
                      label="Current Streak"
                      value={`${stats.streak} days`}
                    />
                    <StatCard
                      icon={Target}
                      label="Outcomes Completed"
                      value={stats.outcomesCompleted}
                    />
                    <StatCard
                      icon={Activity}
                      label="Activities Logged"
                      value={stats.activitiesLogged}
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Metrics Logged"
                      value={stats.metricsLogged}
                    />
                    <StatCard
                      icon={Users}
                      label="Sales Logged"
                      value={stats.salesLogged}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tenant not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Create/Edit Tenant Dialog
// ============================================================================
function TenantFormDialog({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant;
  onSubmit: (data: CreateTenantPayload) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('FREE');
  const [notes, setNotes] = useState('');

  // Reset form when dialog opens/closes or tenant changes
  useEffect(() => {
    if (open) {
      setName(tenant?.name || '');
      setEmail(tenant?.email || '');
      setDomain(tenant?.domain || '');
      setPlan(tenant?.plan || 'FREE');
      setNotes('');
    }
  }, [open, tenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      domain: domain || undefined,
      plan,
    });
  };

  const isEdit = !!tenant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tenant' : 'Create New Tenant'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update tenant information below.'
              : 'Fill in the details to create a new tenant organization.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acme.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="acme.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as SubscriptionPlan)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this tenant..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || !email}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Tenant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Activate/Deactivate Confirmation Dialog
// ============================================================================
function StatusChangeDialog({
  open,
  onOpenChange,
  tenant,
  action,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant;
  action: 'activate' | 'deactivate';
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const isActivate = action === 'activate';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActivate ? 'Activate Tenant' : 'Deactivate Tenant'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivate ? (
              <>
                Are you sure you want to activate <strong>{tenant?.name}</strong>? 
                This will restore their access to the platform.
              </>
            ) : (
              <>
                Are you sure you want to deactivate <strong>{tenant?.name}</strong>? 
                They will lose access to the platform until reactivated.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isActivate ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {isActivate ? 'Activating...' : 'Deactivating...'}
              </>
            ) : isActivate ? (
              <>
                <Power className="h-4 w-4 mr-2" />
                Activate
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Credentials Dialog - Shows admin login details after tenant creation
// ============================================================================
interface AdminCredentials {
  email: string;
  tempPassword: string;
  loginUrl: string;
}

function CredentialsDialog({
  open,
  onOpenChange,
  tenantName,
  credentials,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  credentials: AdminCredentials | null;
}) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
      duration: 2000,
    });
  };

  const copyAllCredentials = () => {
    if (!credentials) return;
    const text = `Tenant: ${tenantName}\nEmail: ${credentials.email}\nPassword: ${credentials.tempPassword}\nLogin URL: ${credentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    toast({
      title: 'All Credentials Copied!',
      description: 'You can now share this with the tenant admin.',
      duration: 3000,
    });
  };

  if (!credentials) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Tenant Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Share these credentials with the tenant admin. They can use these to log in for the first time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Tenant Name */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              Tenant
            </div>
            <p className="font-semibold">{tenantName}</p>
          </div>

          {/* Login Credentials */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Key className="h-4 w-4" />
              Admin Login Credentials
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-mono text-sm">{credentials.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, 'Email')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Temporary Password</p>
                  <p className="font-mono text-sm font-bold text-primary">{credentials.tempPassword}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.tempPassword, 'Password')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Login URL */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <ExternalLink className="h-4 w-4" />
              Login URL
            </div>
            <div className="flex items-center justify-between">
              <a
                href={credentials.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono"
              >
                {credentials.loginUrl}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(credentials.loginUrl, 'Login URL')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Please share these credentials securely. The tenant should change their password after first login.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={copyAllCredentials} className="w-full sm:w-auto">
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Tenants Page Component
// ============================================================================
export default function TenantsPage() {
  const { toast } = useToast();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'ALL'>('ALL');
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | 'ALL'>('ALL');
  const [onboardingFilter, setOnboardingFilter] = useState<OnboardingFilter>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [viewTenantId, setViewTenantId] = useState<string | null>(null);
  const [statusChangeTenant, setStatusChangeTenant] = useState<Tenant | null>(null);
  const [statusChangeAction, setStatusChangeAction] = useState<'activate' | 'deactivate'>('activate');
  
  // Credentials dialog state (shown after tenant creation or password reset)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCredentials, setNewTenantCredentials] = useState<AdminCredentials | null>(null);

  // Queries
  const {
    data: tenantsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useTenants({
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    plan: planFilter !== 'ALL' ? planFilter : undefined,
    onboarding: onboardingFilter !== 'ALL' ? onboardingFilter : undefined,
  });

  // Mutations
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const activateMutation = useActivateTenant();
  const deactivateMutation = useDeactivateTenant();

  // Handlers
  const handleCreate = async (data: CreateTenantPayload) => {
    try {
      const result = await createMutation.mutateAsync(data);
      setCreateDialogOpen(false);
      
      const credentials = (result as Tenant & { adminCredentials?: AdminCredentials }).adminCredentials;
      if (credentials) {
        setNewTenantName(data.name);
        setNewTenantCredentials(credentials);
        setCredentialsDialogOpen(true);
      } else {
        toast({
          title: 'Tenant Created',
          description: `${data.name} has been successfully created.`,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to create tenant.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: CreateTenantPayload) => {
    if (!editTenant) return;
    try {
      await updateMutation.mutateAsync({ id: editTenant.id, data });
      setEditTenant(null);
      toast({
        title: 'Tenant Updated',
        description: `${data.name} has been successfully updated.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || 'Failed to update tenant.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async () => {
    if (!statusChangeTenant) return;
    try {
      if (statusChangeAction === 'activate') {
        await activateMutation.mutateAsync(statusChangeTenant.id);
        toast({
          title: 'Tenant Activated',
          description: `${statusChangeTenant.name} has been activated.`,
        });
      } else {
        await deactivateMutation.mutateAsync(statusChangeTenant.id);
        toast({
          title: 'Tenant Deactivated',
          description: `${statusChangeTenant.name} has been deactivated.`,
        });
      }
      setStatusChangeTenant(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message || `Failed to ${statusChangeAction} tenant.`,
        variant: 'destructive',
      });
    }
  };

  const openStatusChangeDialog = (tenant: Tenant, action: 'activate' | 'deactivate') => {
    setStatusChangeTenant(tenant);
    setStatusChangeAction(action);
  };

  // Handle both array and paginated response from API
  const tenantsResponse = tenantsData;
  let tenants = tenantsResponse?.data || [];

  // Client-side onboarding filter (fallback if API doesn't support it)
  if (onboardingFilter !== 'ALL') {
    tenants = tenants.filter((tenant) => {
      if (onboardingFilter === 'COMPLETED') {
        return tenant.isOnboarded === true;
      }
      return tenant.isOnboarded !== true;
    });
  }

  const total = tenantsResponse?.total || 0;
  const totalPages = tenantsResponse?.totalPages || Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header - Using shared PageHeader */}
      <PageHeader
        title="Tenant Management"
        description="Manage all organizations using the platform"
        icon={Building2}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tenant
          </Button>
        }
      />

      {/* Filters - Using shared FilterBar */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            searchValue={search}
            searchPlaceholder="Search by name or domain..."
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Inactive', value: 'INACTIVE' },
                ],
              },
              {
                key: 'plan',
                label: 'Plan',
                options: [
                  { label: 'Free', value: 'FREE' },
                  { label: 'Starter', value: 'STARTER' },
                  { label: 'Pro', value: 'PRO' },
                  { label: 'Enterprise', value: 'ENTERPRISE' },
                ],
              },
              {
                key: 'onboarding',
                label: 'Onboarding',
                options: [
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Not Completed', value: 'NOT_COMPLETED' },
                ],
              },
            ]}
            filterValues={{
              status: statusFilter,
              plan: planFilter,
              onboarding: onboardingFilter,
            }}
            onFilterChange={(key, value) => {
              if (key === 'status') setStatusFilter(value as TenantStatus | 'ALL');
              if (key === 'plan') setPlanFilter(value as SubscriptionPlan | 'ALL');
              if (key === 'onboarding') setOnboardingFilter(value as OnboardingFilter);
              setPage(1);
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
              <Building2 className="h-5 w-5" />
              Tenants
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {total} {total === 1 ? 'tenant' : 'tenants'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : isError ? (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load tenants"
              description={(error as Error)?.message || 'An unexpected error occurred.'}
              onRetry={() => refetch()}
              variant="error"
            />
          ) : tenants.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No tenants found"
              description={
                search || statusFilter !== 'ALL' || planFilter !== 'ALL' || onboardingFilter !== 'ALL'
                  ? 'No tenants match your current filters. Try adjusting your search criteria.'
                  : 'Create your first tenant to get started.'
              }
              action={!search && statusFilter === 'ALL' && planFilter === 'ALL' && onboardingFilter === 'ALL' ? () => setCreateDialogOpen(true) : undefined}
              actionLabel="Create Tenant"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{tenant.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {tenant.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.domain || '—'}
                      </TableCell>
                      <TableCell>
                        <TenantStatusBadge status={tenant.status} />
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={tenant.plan} />
                      </TableCell>
                      <TableCell>
                        <OnboardingBadge isOnboarded={tenant.isOnboarded} onboardingStep={tenant.onboardingStep} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => setViewTenantId(tenant.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTenant(tenant)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {tenant.status === 'ACTIVE' ? (
                              <DropdownMenuItem
                                onClick={() => openStatusChangeDialog(tenant, 'deactivate')}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openStatusChangeDialog(tenant, 'activate')}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                    {Math.min(page * pageSize, total)} of {total} tenants
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

      {/* View Tenant Sheet */}
      <ViewTenantSheet
        open={!!viewTenantId}
        onOpenChange={(open) => !open && setViewTenantId(null)}
        tenantId={viewTenantId}
      />

      {/* Create Dialog */}
      <TenantFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <TenantFormDialog
        open={!!editTenant}
        onOpenChange={(open) => !open && setEditTenant(null)}
        tenant={editTenant || undefined}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={!!statusChangeTenant}
        onOpenChange={(open) => !open && setStatusChangeTenant(null)}
        tenant={statusChangeTenant || undefined}
        action={statusChangeAction}
        onConfirm={handleStatusChange}
        isLoading={activateMutation.isPending || deactivateMutation.isPending}
      />

      {/* Credentials Dialog - Shows after successful tenant creation */}
      <CredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={setCredentialsDialogOpen}
        tenantName={newTenantName}
        credentials={newTenantCredentials}
      />
    </div>
  );
}
