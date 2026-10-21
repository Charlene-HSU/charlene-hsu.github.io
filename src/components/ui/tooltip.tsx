import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn, type WithClassName } from "@/lib/utils";

export const TooltipProvider = BaseTooltip.Provider;
export const TooltipRoot = BaseTooltip.Root;
export const TooltipPortal = BaseTooltip.Portal;

export type TooltipTriggerProps = WithClassName<BaseTooltip.Trigger.Props>;
export function TooltipTrigger({ className, ...props }: TooltipTriggerProps) {
  return (
    <BaseTooltip.Trigger
      className={cn(
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type TooltipPositionerProps = WithClassName<BaseTooltip.Positioner.Props>;
export function TooltipPositioner({ className, ...props }: TooltipPositionerProps) {
  return (
    <BaseTooltip.Positioner
      sideOffset={6}
      className={cn("z-50 outline-none", className)}
      {...props}
    />
  );
}

export type TooltipPopupProps = WithClassName<BaseTooltip.Popup.Props>;
export function TooltipPopup({ className, ...props }: TooltipPopupProps) {
  return (
    <BaseTooltip.Popup
      className={cn(
        "rounded-xs border border-rule bg-surface px-2.5 py-1 font-mono text-caption text-foreground",
        className,
      )}
      {...props}
    />
  );
}
