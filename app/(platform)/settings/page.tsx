"use client";

import Link from "next/link";
import { ShieldCheck, Settings2, RefreshCw } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Label } from "@/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Switch } from "@/components/switch";
import { usePlatformSettings, useUpdatePlatformSettings } from "@/hooks";
import type { SubscriptionPlan } from "@/lib/api";

export default function SettingsPage() {
  const { data: settings, isLoading, isRefetching, refetch } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage security and platform-wide defaults.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/settings/security"
          className="group rounded-lg border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 group-hover:bg-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">MFA & Sessions</p>
            </div>
          </div>
        </Link>

        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Default Plan</h3>
              <p className="text-sm text-muted-foreground">{settings?.defaultPlan || "Loading"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Maintenance</h3>
              <p className="text-sm text-muted-foreground">{settings?.maintenanceMode ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Defaults</CardTitle>
            <CardDescription>Defaults applied to new tenant provisioning flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Default Plan</Label>
              <Select
                value={settings?.defaultPlan ?? ""}
                disabled={!settings || isLoading || updateSettings.isPending}
                onValueChange={(defaultPlan) => updateSettings.mutate({ defaultPlan: defaultPlan as SubscriptionPlan })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SettingToggle
              label="Maintenance Mode"
              description="Temporarily pause tenant-facing access during production maintenance."
              checked={settings?.maintenanceMode ?? false}
              disabled={!settings || updateSettings.isPending}
              onCheckedChange={(maintenanceMode) => updateSettings.mutate({ maintenanceMode })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Platform-wide capability switches for Superadmin operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              label="MFA"
              description="Require and manage multi-factor authentication controls."
              checked={settings?.features.mfaEnabled ?? false}
              disabled={!settings || updateSettings.isPending}
              onCheckedChange={(mfaEnabled) => updateSettings.mutate({ features: { mfaEnabled } })}
            />
            <SettingToggle
              label="Audit Logging"
              description="Record critical Superadmin and tenant lifecycle events."
              checked={settings?.features.auditLogging ?? false}
              disabled={!settings || updateSettings.isPending}
              onCheckedChange={(auditLogging) => updateSettings.mutate({ features: { auditLogging } })}
            />
            <SettingToggle
              label="Email Notifications"
              description="Send operational notifications for tenant and support events."
              checked={settings?.features.emailNotifications ?? false}
              disabled={!settings || updateSettings.isPending}
              onCheckedChange={(emailNotifications) => updateSettings.mutate({ features: { emailNotifications } })}
            />
          </CardContent>
        </Card>
      </div>

      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Limits</CardTitle>
            <CardDescription>Current tenant capacity defaults per subscription plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(settings.maxTenantsPerPlan).map(([plan, limit]) => (
                <div key={plan} className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">{plan}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{limit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <Label className="font-medium">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
