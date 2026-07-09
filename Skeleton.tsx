import React from "react";

/**
 * Skeleton — Spec §16
 *
 * Does not exist anywhere in the current codebase today (no differentiation
 * between "loading," "empty," and "error"). Shapes match the content they
 * stand in for so there's no layout shift when real content arrives.
 */

export type SkeletonVariant = "card" | "row" | "text" | "circle";

interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  card: "h-24 rounded-[var(--radius-card)] w-full",
  row: "h-10 rounded-[var(--radius-inline)] w-full",
  text: "h-3 rounded w-3/4",
  circle: "h-8 w-8 rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({ variant = "text", count = 1, className = "" }) => {
  const items = Array.from({ length: count });
  return (
    <div className="space-y-2" aria-hidden="true">
      {items.map((_, i) => (
        <div key={i} className={`skeleton-pulse ${variantStyles[variant]} ${className}`} />
      ))}
    </div>
  );
};
