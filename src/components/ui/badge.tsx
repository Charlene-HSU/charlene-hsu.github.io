import type { HTMLAttributes } from "react";
import { cn, type WithClassName } from "@/lib/utils";

export type BadgeVariant = "default" | "green" | "yellow" | "red" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface text-gray border border-rule",
  green: "bg-green/15 text-green border border-green/40",
  yellow: "bg-yellow/15 text-yellow border border-yellow/40",
  red: "bg-red/15 text-red border border-red/40",
  outline: "bg-transparent text-foreground border border-rule",
};

export type BadgeProps = WithClassName<HTMLAttributes<HTMLSpanElement>> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 font-mono text-caption font-normal",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
