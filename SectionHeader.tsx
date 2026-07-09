import React from "react";

/**
 * SectionHeader — Spec §5
 *
 * Formalizes a pattern already used informally for the Sidebar's
 * "Portfolio" / "Community" group labels — now reusable anywhere a
 * labeled group with an optional action needs to appear.
 */

interface SectionHeaderProps {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, actionLabel, onAction, className = "" }) => {
  return (
    <div className={`flex items-center justify-between mb-1.5 ${className}`}>
      <span className="px-1 text-[9px] text-white/35 font-semibold uppercase tracking-[0.16em] font-display">
        {label}
      </span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-[10px] text-white/45 hover:text-white transition font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
