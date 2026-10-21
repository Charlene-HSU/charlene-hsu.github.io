import { Toast as BaseToast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import { site } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";

export const ToastProvider = BaseToast.Provider;
export const useToastManager = BaseToast.useToastManager;

export type ToastViewportProps = WithClassName<BaseToast.Viewport.Props>;
export function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <BaseToast.Viewport
      className={cn(
        "fixed right-4 bottom-4 z-50 flex w-full max-w-80 flex-col gap-2 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function ToastList({ lang = "en" }: { lang?: Lang }) {
  const { toasts } = BaseToast.useToastManager();
  return (
    <ToastViewport>
      {toasts.map((toastItem) => (
        <BaseToast.Root
          key={toastItem.id}
          toast={toastItem}
          className="flex items-start justify-between gap-3 rounded-md border border-green/60 bg-surface p-4 text-foreground"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <BaseToast.Title className="font-mono text-body font-bold text-green" />
            <BaseToast.Description className="truncate font-mono text-caption text-gray" />
          </div>
          <BaseToast.Close
            aria-label={t(site.ui.toast.closeAriaLabel, lang)}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-gray cursor-pointer hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <X className="size-4" aria-hidden="true" />
          </BaseToast.Close>
        </BaseToast.Root>
      ))}
    </ToastViewport>
  );
}
