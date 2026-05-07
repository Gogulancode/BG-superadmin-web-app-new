'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { RefreshCw, DollarSign, CreditCard, TrendingUp, Users, Building2 } from 'lucide-react';
import { useSubscriptionList, useSubscriptionStats, usePlanDistribution, useUpdateSubscription } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, PlanBadge, TenantStatusBadge } from '@/components/common';
import { SubscriptionPlan } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{ id: string; name: string; plan: SubscriptionPlan } | null>(null);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('FREE');

  const { data: subscriptions, isLoading: subsLoading, isRefetching } = useSubscriptionList();
  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();
  const { data: planDist } = usePlanDistribution();
  const updateSubscription = useUpdateSubscription();

  const loading = subsLoading || statsLoading;
  const refreshing = isRefetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
  };

  const handleChangePlan = (sub: { id: string; name: string; plan: SubscriptionPlan }) => {
    setSelectedSubscription(sub);
    setNewPlan(sub.plan);
    setChangePlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!selectedSubscription) return;

    try {
      await updateSubscription.mutateAsync({
        tenantId: selectedSubscription.id,
        payload: { plan: newPlan },
      });
      toast({
        title: 'Plan Updated',
        description: `${selectedSubscription.name} has been updated to ${newPlan} plan.`,
      });
      setChangePlanDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update subscription plan.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !subscriptions) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage tenant subscriptions and billing"
        actions={
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalMRR || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats?.activeSubscriptions || 0} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscriptions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.activeSubscriptions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(stats?.churnRate || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>Breakdown of subscriptions by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(planDist || []).map((item) => (
              <div key={item.plan} className="p-4 bg-gray-50 rounded-lg text-center">
                <PlanBadge plan={item.plan} className="mb-2" />
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-gray-500">{item.percentage.toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            {subscriptions?.length || 0} total subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subscriptions || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                (subscriptions || []).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{sub.tenantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={sub.plan} />
                    </TableCell>
                    <TableCell>
                      <TenantStatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sub.mrr)}/mo
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangePlan({
                          id: sub.tenantId,
                          name: sub.tenantName,
                          plan: sub.plan,
                        })}
                      >
                        Change Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan for {selectedSubscription?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select New Plan</label>
            <Select value={newPlan} onValueChange={(v) => setNewPlan(v as SubscriptionPlan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free - $0/mo</SelectItem>
                <SelectItem value="STARTER">Starter - $29/mo</SelectItem>
                <SelectItem value="PRO">Pro - $99/mo</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise - $299/mo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePlan}
              disabled={updateSubscription.isPending || newPlan === selectedSubscription?.plan}
            >
              {updateSubscription.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
