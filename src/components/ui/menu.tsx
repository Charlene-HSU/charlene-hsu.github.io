import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn, type WithClassName } from "@/lib/utils";

export const MenuRoot = BaseMenu.Root;
export const MenuPortal = BaseMenu.Portal;
export const MenuRadioGroup = BaseMenu.RadioGroup;

export type MenuTriggerProps = WithClassName<BaseMenu.Trigger.Props>;
export function MenuTrigger({ className, ...props }: MenuTriggerProps) {
  return (
    <BaseMenu.Trigger
      className={cn(
        "inline-flex size-control-icon items-center justify-center rounded-full border border-rule bg-surface font-mono text-body font-bold text-foreground transition-colors select-none cursor-pointer hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-popup-open:border-green data-popup-open:text-green",
        className,
      )}
      {...props}
    />
  );
}

export type MenuPositionerProps = WithClassName<BaseMenu.Positioner.Props>;
export function MenuPositioner({ className, ...props }: MenuPositionerProps) {
  return (
    <BaseMenu.Positioner sideOffset={8} className={cn("z-50 outline-none", className)} {...props} />
  );
}

export type MenuPopupProps = WithClassName<BaseMenu.Popup.Props>;
export function MenuPopup({ className, ...props }: MenuPopupProps) {
  return (
    <BaseMenu.Popup
      className={cn(
        "min-w-40 rounded-lg border border-rule bg-surface p-1.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type MenuItemProps = WithClassName<BaseMenu.Item.Props>;
export function MenuItem({ className, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      className={cn(
        "flex h-control items-center gap-2.5 rounded-md px-3 font-mono text-body text-foreground transition-colors select-none cursor-pointer outline-none data-highlighted:bg-rule/60 data-highlighted:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type MenuRadioItemProps = WithClassName<BaseMenu.RadioItem.Props>;
export function MenuRadioItem({ className, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      className={cn(
        "flex h-control items-center justify-between gap-3 rounded-md px-3 font-mono text-body text-gray transition-colors select-none cursor-pointer outline-none data-checked:font-bold data-checked:text-green data-highlighted:bg-rule/60 data-highlighted:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}
