import type { BadgeType } from "@/lib/types";

const badgeStyles: Record<BadgeType, string> = {
  discount: "bg-primary/20 text-primary",
  new: "bg-tertiary/20 text-tertiary",
  "pre-order": "bg-secondary/20 text-secondary",
  rare: "bg-secondary-container text-on-secondary-container",
  popular: "bg-primary/10 text-primary",
  instant: "bg-tertiary/20 text-tertiary",
};

export function Badge({
  type,
  children,
}: {
  type: BadgeType;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${badgeStyles[type]}`}
    >
      {children}
    </span>
  );
}
