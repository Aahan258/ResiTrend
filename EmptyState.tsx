import React from "react";
import { Button } from "./Button";

/**
 * EmptyState — Spec §17
 *
 * Does not exist anywhere in the current codebase. A junior resident with
 * zero XP will hit nearly every empty state on day one, so tone matters:
 * positive/reassuring framing by default, never styled as an error.
 */

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center text-center py-10 px-6 ${className}`}>
      <div className="h-11 w-11 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3.5">
        <Icon className="h-5 w-5 text-white/40" />
      </div>
      <p className="text-[13px] font-semibold text-white font-display mb-1">{title}</p>
      <p className="text-[12px] text-white/45 leading-snug max-w-[280px] mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
