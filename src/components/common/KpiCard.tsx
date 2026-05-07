"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  } | "up" | "down" | "neutral";
  className?: string;
  variant?: "default" | "primary" | "gradient";
}

/**
 * Unified KPI card component for consistent dashboard metrics.
 */
export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: KpiCardProps) {
  // Handle both object and string trend formats
  const trendDirection = typeof trend === "string"
    ? trend
    : trend
      ? (trend.isPositive ? "up" : "down")
      : undefined;

  const trendValue = typeof trend === "object" && trend ? trend.value : undefined;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      variant === "gradient" && "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0",
      variant === "primary" && "bg-primary text-primary-foreground border-0",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              (variant === "gradient" || variant === "primary") ? "opacity-90" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className={cn(
                "text-xs",
                (variant === "gradient" || variant === "primary") ? "opacity-80" : "text-muted-foreground"
              )}>
                {description}
              </p>
            )}
            {trendDirection && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium mt-1",
                trendDirection === "up" && "text-green-600",
                trendDirection === "down" && "text-red-600",
                trendDirection === "neutral" && "text-gray-500"
              )}>
                {trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
                {trendDirection === "down" && <TrendingDown className="h-3 w-3" />}
                {trendDirection === "neutral" && <Minus className="h-3 w-3" />}
                {trendValue !== undefined && (
                  <span>{trendValue > 0 ? "+" : ""}{trendValue}% from last month</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              (variant === "gradient" || variant === "primary") ? "bg-white/10" : "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                (variant === "gradient" || variant === "primary") ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

/**
 * Compact stat card for secondary metrics.
 */
export function StatCard({ icon: Icon, label, value, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiCard;
