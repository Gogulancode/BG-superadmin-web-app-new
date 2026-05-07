"use client";

import * as React from "react";
import { Search, Filter, X, RefreshCw, Download, Plus } from "lucide-react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  /** Search input value */
  searchValue?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Current filter values */
  filterValues?: Record<string, string>;
  /** Callback when filter values change */
  onFilterChange?: (key: string, value: string) => void;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Callback to export data */
  onExport?: () => void;
  /** Callback to add new item */
  onAdd?: () => void;
  /** Label for add button */
  addLabel?: string;
  /** Number of active filters */
  activeFiltersCount?: number;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Unified filter bar component for tables and lists.
 * Provides consistent search, filters, and action buttons.
 */
export function FilterBar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onRefresh,
  onExport,
  onAdd,
  addLabel = "Add New",
  activeFiltersCount = 0,
  onClearFilters,
  actions,
  isLoading,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "all"}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Filter className="h-3 w-3" />
            {activeFiltersCount} active
            <button
              onClick={onClearFilters}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}
        
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        {onAdd && (
          <Button
            size="sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing filter state.
 */
export function useFilters<T extends Record<string, string>>(initialFilters: T) {
  const [filters, setFilters] = React.useState<T>(initialFilters);

  const updateFilter = React.useCallback((key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = React.useCallback(() => {
    const cleared = {} as T;
    Object.keys(initialFilters).forEach((key) => {
      cleared[key as keyof T] = "all" as T[keyof T];
    });
    setFilters(cleared);
  }, [initialFilters]);

  const activeCount = React.useMemo(() => {
    return Object.values(filters).filter((v) => v && v !== "all").length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    activeCount,
    setFilters,
  };
}

export default FilterBar;
