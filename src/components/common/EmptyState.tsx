"use client";

import { LucideIcon, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onRetry?: () => void;
  variant?: "default" | "error";
  className?: string;
}

/**
 * Unified empty state component for displaying when no data is available.
 * 
 * @example
 * <EmptyState
 *   icon={Building2}
 *   title="No tenants found"
 *   description="Create your first tenant to get started."
 *   action={() => setDialogOpen(true)}
 *   actionLabel="Create Tenant"
 * />
 * 
 * @example Error variant
 * <EmptyState
 *   icon={AlertCircle}
 *   title="Failed to load data"
 *   description="Something went wrong."
 *   onRetry={() => refetch()}
 *   variant="error"
 * />
 */
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action,
  actionLabel,
  actionIcon: ActionIcon,
  onRetry,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isError = variant === "error";

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className={cn(
        "rounded-full p-4 mb-4",
        isError ? "bg-destructive/10" : "bg-muted"
      )}>
        <Icon className={cn(
          "h-8 w-8",
          isError ? "text-destructive" : "text-muted-foreground"
        )} />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
      {action && actionLabel && !onRetry && (
        <Button onClick={action} variant="outline">
          {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Unified error state component for displaying API/loading errors.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
