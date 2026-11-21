import type { ReactNode } from "react";

export type BadgeTone = "primary" | "accent" | "success" | "danger" | "muted";

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  primary: "border-primary/40 bg-primary/10 text-primary",
  accent: "border-accent/40 bg-accent/10 text-accent",
  success: "border-success/40 bg-success/10 text-success",
  danger: "border-danger/40 bg-danger/10 text-danger",
  muted: "border-line bg-surface text-muted",
};

/** 작은 라벨 (시대, 상태, 꿀팁 종류 등) */
function Badge({ tone = "muted", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
