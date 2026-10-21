import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn, type WithClassName } from "@/lib/utils";

export const DialogRoot = BaseDialog.Root;
export const DialogPortal = BaseDialog.Portal;

export type DialogTriggerProps = WithClassName<BaseDialog.Trigger.Props>;
export function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  return (
    <BaseDialog.Trigger
      className={cn(
        "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type DialogBackdropProps = WithClassName<BaseDialog.Backdrop.Props>;
export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <BaseDialog.Backdrop
      className={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-xs", className)}
      {...props}
    />
  );
}

export type DialogPopupProps = WithClassName<BaseDialog.Popup.Props>;
export function DialogPopup({ className, ...props }: DialogPopupProps) {
  return (
    <BaseDialog.Popup
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-full max-w-content -translate-x-1/2 -translate-y-1/2 rounded-lg border border-rule bg-surface p-6 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type DialogTitleProps = WithClassName<BaseDialog.Title.Props>;
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title className={cn("font-mono text-h2 font-bold", className)} {...props} />;
}

export type DialogDescriptionProps = WithClassName<BaseDialog.Description.Props>;
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description className={cn("mt-2 text-paragraph text-gray", className)} {...props} />
  );
}

export type DialogCloseProps = WithClassName<BaseDialog.Close.Props>;
export function DialogClose({ className, ...props }: DialogCloseProps) {
  return (
    <BaseDialog.Close
      className={cn(
        "inline-flex h-control items-center justify-center rounded-md border border-rule bg-background px-4 font-mono text-body font-bold text-foreground cursor-pointer hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}
