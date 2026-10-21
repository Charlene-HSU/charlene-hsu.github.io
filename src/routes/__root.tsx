import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotFoundPage } from "@/components/layout/not-found";

function RootComponent() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </TooltipProvider>
  );
}

function RootNotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NotFoundPage />
    </main>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: RootNotFound,
});
