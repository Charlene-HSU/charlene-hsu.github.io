import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cn, type WithClassName } from "@/lib/utils";

export type ToggleGroupProps = WithClassName<BaseToggleGroup.Props>;
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <BaseToggleGroup className={cn("flex items-center gap-2", className)} {...props} />;
}

export type ToggleProps = WithClassName<BaseToggle.Props>;
export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <BaseToggle
      className={cn(
        "inline-flex h-control shrink-0 items-center gap-2 rounded-full border border-rule bg-surface px-4 font-mono text-body text-gray transition-colors select-none cursor-pointer hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-pressed:border-green data-pressed:text-green data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
