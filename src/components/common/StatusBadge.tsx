"use client";

import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  AlertTriangle,
  Power,
  PowerOff,
} from "lucide-react";

// Generic status types
type GenericStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

// Ticket statuses
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

// Priority levels
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Onboarding status
type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

// Template status
type TemplateStatus = "ACTIVE" | "INACTIVE";

// Template scope
type TemplateScope = "GLOBAL" | "DEFAULT";

// Subscription plans
type SubscriptionPlan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

interface StatusBadgeProps {
  status: GenericStatus;
  className?: string;
}

/**
 * Generic status badge for tenant/user status.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<GenericStatus, { className: string; label: string }> = {
    ACTIVE: { className: "bg-green-100 text-green-800 border-green-200", label: "Active" },
    INACTIVE: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Inactive" },
    SUSPENDED: { className: "bg-red-100 text-red-800 border-red-200", label: "Suspended" },
    PENDING: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  };
  const { className: badgeClass, label } = variants[status] || variants.INACTIVE;
  return (
    <Badge variant="outline" className={cn(badgeClass, className)}>
      {label}
    </Badge>
  );
}

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

/**
 * Ticket status badge with icons.
 */
export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const variants: Record<TicketStatus, { className: string; icon: React.ReactNode; label: string }> = {
    OPEN: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <Clock className="h-3 w-3" />,
      label: "Open",
    },
    IN_PROGRESS: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <AlertTriangle className="h-3 w-3" />,
      label: "In Progress",
    },
    RESOLVED: {
      className: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Resolved",
    },
    CLOSED: {
      className: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <XCircle className="h-3 w-3" />,
      label: "Closed",
    },
  };
  const { className: badgeClass, icon, label } = variants[status] || variants.OPEN;
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1", badgeClass, className)}>
      {icon}
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

/**
 * Priority badge for support tickets.
 */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants: Record<Priority, { className: string; label: string }> = {
    LOW: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Low" },
    MEDIUM: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Medium" },
    HIGH: { className: "bg-orange-100 text-orange-800 border-orange-200", label: "High" },
    URGENT: { className: "bg-red-100 text-red-800 border-red-200", label: "Urgent" },
  };
  const { className: badgeClass, label } = variants[priority] || variants.MEDIUM;
  return (
    <Badge variant="outline" className={cn(badgeClass, className)}>
      {label}
    </Badge>
  );
}

interface OnboardingBadgeProps {
  isOnboarded?: boolean;
  onboardingStep?: number;
  className?: string;
}

/**
 * Onboarding status badge with icons.
 */
export function OnboardingBadge({ isOnboarded, onboardingStep, className }: OnboardingBadgeProps) {
  if (isOnboarded) {
    return (
      <Badge variant="outline" className={cn("bg-green-100 text-green-800 border-green-200", className)}>
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  }

  if (onboardingStep && onboardingStep > 1) {
    return (
      <Badge variant="outline" className={cn("bg-amber-100 text-amber-800 border-amber-200", className)}>
        <Clock className="h-3 w-3 mr-1" />
        Step {onboardingStep}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("bg-gray-100 text-gray-600 border-gray-200", className)}>
      <Circle className="h-3 w-3 mr-1" />
      Not started
    </Badge>
  );
}

interface TemplateScopeBadgeProps {
  scope: TemplateScope;
  className?: string;
}

/**
 * Template scope badge.
 */
export function TemplateScopeBadge({ scope, className }: TemplateScopeBadgeProps) {
  const variants: Record<TemplateScope, { className: string; label: string }> = {
    GLOBAL: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Global" },
    DEFAULT: { className: "bg-purple-100 text-purple-800 border-purple-200", label: "Default" },
  };
  const { className: badgeClass, label } = variants[scope] || variants.DEFAULT;
  return (
    <Badge variant="outline" className={cn(badgeClass, className)}>
      {label}
    </Badge>
  );
}

interface TemplateStatusBadgeProps {
  status: TemplateStatus;
  className?: string;
}

/**
 * Template status badge.
 */
export function TemplateStatusBadge({ status, className }: TemplateStatusBadgeProps) {
  const variants: Record<TemplateStatus, { className: string; label: string }> = {
    ACTIVE: { className: "bg-green-100 text-green-800 border-green-200", label: "Active" },
    INACTIVE: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Inactive" },
  };
  const { className: badgeClass, label } = variants[status] || variants.INACTIVE;
  return (
    <Badge variant="outline" className={cn(badgeClass, className)}>
      {label}
    </Badge>
  );
}

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

/**
 * Subscription plan badge.
 */
export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const variants: Record<SubscriptionPlan, { className: string }> = {
    FREE: { className: "bg-slate-100 text-slate-800 border-slate-200" },
    STARTER: { className: "bg-blue-100 text-blue-800 border-blue-200" },
    PROFESSIONAL: { className: "bg-purple-100 text-purple-800 border-purple-200" },
    ENTERPRISE: { className: "bg-amber-100 text-amber-800 border-amber-200" },
  };
  const { className: badgeClass } = variants[plan] || variants.FREE;
  return (
    <Badge variant="outline" className={cn(badgeClass, className)}>
      {plan}
    </Badge>
  );
}

interface ActionBadgeProps {
  eventType: string;
  className?: string;
}

/**
 * Audit log action badge with contextual colors.
 */
export function ActionBadge({ eventType, className }: ActionBadgeProps) {
  const getActionStyle = (type: string) => {
    if (type.includes("CREATED") || type.includes("create")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (type.includes("DELETED") || type.includes("delete") || type.includes("REVOKE") || type.includes("DEACTIVATED")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (type.includes("UPDATED") || type.includes("update") || type.includes("MODIFIED") || type.includes("ACTIVATED") || type.includes("CHANGED")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (type.includes("LOGIN")) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    if (type.includes("LOGOUT")) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Badge variant="outline" className={cn(getActionStyle(eventType), className)}>
      {formatEventType(eventType)}
    </Badge>
  );
}
