import React from "react";

/**
 * Card — Spec §9 (Card Hierarchy)
 *
 * Visual weight maps to information importance. Pick the tier by asking
 * "how separate is this from its neighbor," not by habit.
 *
 * - elevated:    primary container, once per screen max (e.g. completion banner,
 *                a leaderboard table wrapper). Uses .glass-panel.
 * - standard:    repeated content units (an achievement entry, a kudos entry).
 *                Uses .glass-card.
 * - interactive: standard + hover lift + pointer. Use only when the whole
 *                card — not just a button inside it — is clickable.
 * - inline:      flattest tier, for content nested *inside* another card
 *                (e.g. the XP row inside a profile card). Border only,
 *                no blur/shadow, so it doesn't compete with its parent.
 */

export type CardVariant = "elevated" | "standard" | "interactive" | "inline";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: "div" | "section" | "article";
}

const variantStyles: Record<CardVariant, string> = {
  elevated: "glass-panel rounded-[var(--radius-panel)] p-4",
  standard: "glass-card p-3.5",
  interactive: "glass-card p-3.5 lift cursor-pointer",
  inline: "border border-white/[0.05] rounded-[var(--radius-inline)] p-2.5",
};

export const Card: React.FC<CardProps> = ({
  variant = "standard",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) => {
  return (
    <Tag className={`${variantStyles[variant]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
};
