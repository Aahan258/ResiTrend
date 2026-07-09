import React from "react";

/**
 * Button — Spec §10 (Button Hierarchy)
 *
 * Five variants, each with exactly one job. Rule of thumb enforced by
 * convention, not code: at most one `primary` button visible per screen.
 *
 * - primary:   the one thing to click on this screen. Solid white fill.
 * - secondary: supporting action. Bordered glass surface.
 * - ghost:     low-emphasis action (dismiss, cancel, inline links).
 * - danger:    reserved for destructive actions only.
 * - icon:      icon-only utility action (logout, share, close).
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "leading" | "trailing";
  children?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium tracking-tight transition lift " +
  "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-[11px] px-2.5 py-1 rounded-lg",
  md: "text-xs px-3.5 py-1.5 rounded-lg",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-white text-[#09090b] hover:bg-white/90",
  secondary:
    "border border-white/[0.10] bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-white/[0.16]",
  ghost: "text-white/60 hover:text-white bg-transparent border border-transparent",
  danger:
    "border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:border-red-500/35",
  icon:
    "p-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] text-white/55 hover:text-white",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  icon: Icon,
  iconPosition = "leading",
  children,
  className = "",
  ...rest
}) => {
  const isIconOnly = variant === "icon";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <button
      className={`${base} ${isIconOnly ? variantStyles.icon : `${sizeStyles[size]} ${variantStyles[variant]}`} ${className}`}
      {...rest}
    >
      {isIconOnly ? (
        Icon && <Icon className={iconSize} />
      ) : (
        <>
          {Icon && iconPosition === "leading" && <Icon className={iconSize} />}
          {children}
          {Icon && iconPosition === "trailing" && <Icon className={iconSize} />}
        </>
      )}
    </button>
  );
};
