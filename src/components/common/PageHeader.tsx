"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Unified page header component for consistent page titles across the superadmin app.
 * 
 * @example
 * <PageHeader 
 *   title="Dashboard" 
 *   description="Platform-wide overview"
 *   icon={LayoutDashboard}
 *   actions={<Button>Action</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
