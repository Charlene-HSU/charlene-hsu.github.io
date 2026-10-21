import type { HTMLAttributes, ReactNode } from "react";
import { cn, type WithClassName } from "@/lib/utils";

export type SectionShellProps = WithClassName<HTMLAttributes<HTMLElement>> & {
  id?: string;
  comment?: string;
  title?: string;
  headerRight?: ReactNode;
  columnClassName?: string;
};

export function SectionShell({
  id,
  comment,
  title,
  headerRight,
  className,
  columnClassName,
  children,
  ...props
}: SectionShellProps) {
  return (
    <section id={id} className={cn("w-full px-6 pt-header pb-16 md:pb-24", className)} {...props}>
      <div
        className={cn(
          "mx-auto flex w-full max-w-content flex-col gap-8 pt-8 md:pt-12",
          columnClassName,
        )}
      >
        {comment || title || headerRight ? (
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              {comment ? (
                <span className="font-mono text-body font-bold text-green">{comment}</span>
              ) : null}
              {title ? (
                <h1 className="font-mono text-display font-bold text-foreground">{title}</h1>
              ) : null}
            </div>
            {headerRight ? <div>{headerRight}</div> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
