import React from "react";

/**
 * Badge — Spec §12 (Color Tokens) + §11 (Iconography) + §15 (Accessibility)
 *
 * Each tone maps to exactly one semantic color role. Color is never the
 * sole signal — every tone renders a text label alongside its color/icon
 * (Spec §15, rule 2), so the badge still reads correctly for anyone who
 * can't perceive the color difference.
 */

export type BadgeTone =
  | "status-live"
  | "status-cached"
  | "status-error"
  | "role-founder"
  | "metric-xp"
  | "metric-reputation"
  | "neutral";

interface BadgeProps {
  tone: BadgeTone;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  pulse?: boolean;
  className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
  "status-live": "bg-[color:var(--color-status-success)]/[0.06] border-[color:var(--color-status-success)]/20 text-emerald-300",
  "status-cached": "bg-white/[0.03] border-white/[0.06] text-white/45",
  "status-error": "bg-[color:var(--color-status-error)]/10 border-[color:var(--color-status-error)]/25 text-red-300",
  "role-founder": "bg-[color:var(--color-status-success)]/10 border-[color:var(--color-status-success)]/25 text-emerald-300",
  "metric-xp": "bg-[color:var(--color-accent-xp)]/10 border-[color:var(--color-accent-xp)]/25 text-amber-300",
  "metric-reputation": "bg-white/[0.02] border-white/[0.06] text-white/60",
  neutral: "bg-white/[0.03] border-white/[0.06] text-white/55",
};

export const Badge: React.FC<BadgeProps> = ({ tone, label, icon: Icon, pulse = false, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${toneStyles[tone]} ${className}`}
    >
      {Icon && <Icon className="h-2.5 w-2.5" />}
      <span>{label}</span>
      {pulse && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      )}
    </span>
  );
};
