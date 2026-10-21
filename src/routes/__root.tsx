import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

function RootComponent() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </TooltipProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
