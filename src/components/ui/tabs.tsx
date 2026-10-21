import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn, type WithClassName } from "@/lib/utils";

export type TabsRootProps = WithClassName<BaseTabs.Root.Props>;
export function TabsRoot({ className, ...props }: TabsRootProps) {
  return <BaseTabs.Root className={cn("flex flex-col gap-5", className)} {...props} />;
}

export type TabsListProps = WithClassName<BaseTabs.List.Props>;
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <BaseTabs.List
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-lg border border-rule bg-surface p-1.5",
        className,
      )}
      {...props}
    />
  );
}

export type TabsTabProps = WithClassName<BaseTabs.Tab.Props>;
export function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      className={cn(
        "inline-flex h-control items-center justify-center rounded-md px-4 font-mono text-body font-bold text-gray transition-colors select-none cursor-pointer hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-active:bg-foreground data-active:text-background data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export type TabsPanelProps = WithClassName<BaseTabs.Panel.Props>;
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      className={cn(
        "rounded-lg border border-rule bg-surface p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}
