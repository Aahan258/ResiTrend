import React from "react";

/**
 * Avatar — Spec §5
 *
 * Previously inlined only in Header.tsx, with initials derived by
 * `displayName[4]` (an assumption that every name is prefixed "Dr. ").
 * That breaks for any name without the title. This version strips known
 * titles explicitly, then falls back to the first letter of what's left.
 */

export type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-12 w-12 text-sm",
};

const TITLE_PREFIXES = ["dr.", "dr", "mr.", "mr", "ms.", "ms", "mrs.", "mrs", "prof.", "prof"];

function getInitial(name?: string | null): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  const firstReal = words.find((w) => !TITLE_PREFIXES.includes(w.toLowerCase())) ?? words[0];
  return firstReal?.[0]?.toUpperCase() ?? "?";
}

export const Avatar: React.FC<AvatarProps> = ({ photoUrl, name, size = "md", className = "" }) => {
  return (
    <div
      className={`shrink-0 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-semibold text-white overflow-hidden ${sizeStyles[size]} ${className}`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name ? `${name}'s avatar` : "User avatar"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        getInitial(name)
      )}
    </div>
  );
};
