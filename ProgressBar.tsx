import React from "react";

/**
 * ProgressBar (linear) — Spec §5 / §9
 *
 * The circular variant (CircularProgressRing, used for profile completion)
 * already exists and is well-built per the review — it is not duplicated
 * here. This covers the *linear* case (e.g. the XP bar), which previously
 * had its own bespoke markup per screen.
 */

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  trailingLabel?: string;
  tone?: "neutral" | "xp";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  trailingLabel,
  tone = "neutral",
  className = "",
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const fillColor = tone === "xp" ? "bg-[color:var(--color-accent-xp)]" : "bg-white/85";

  return (
    <div className={className}>
      {(label || trailingLabel) && (
        <div className="flex justify-between items-center text-[10px] font-mono mb-2">
          {label && <span className="text-white/60">{label}</span>}
          {trailingLabel && <span className="text-white/35">{trailingLabel}</span>}
        </div>
      )}
      <div
        className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
