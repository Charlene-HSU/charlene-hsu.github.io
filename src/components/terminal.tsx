import type { HTMLAttributes, ReactNode } from "react";
import { cn, type WithClassName } from "@/lib/utils";

export type TerminalProps = WithClassName<HTMLAttributes<HTMLDivElement>> & {
  title: string;
  headerRight?: ReactNode;
  bodyClassName?: string;
};

export function Terminal({
  title,
  headerRight,
  className,
  bodyClassName,
  children,
  ...props
}: TerminalProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-rule bg-surface text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-4 border-b border-rule bg-background/60 px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-red/80" />
            <span className="size-2.5 rounded-full bg-yellow/80" />
            <span className="size-2.5 rounded-full bg-green/80" />
          </div>
          <span className="truncate font-mono text-caption text-gray">{title}</span>
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </div>
  );
}
