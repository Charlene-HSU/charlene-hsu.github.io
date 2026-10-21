import { useEffect } from "react";
import { createFileRoute, notFound, Outlet, useParams } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NotFoundPage } from "@/components/layout/not-found";
import { ToastList } from "@/components/ui/toast";
import { I18nProvider, isLang, type Lang } from "@/lib/i18n";

function LangLayout() {
  const { lang } = Route.useParams();
  const validLang: Lang = isLang(lang) ? lang : "en";

  useEffect(() => {
    document.documentElement.lang = validLang;
  }, [validLang]);

  return (
    <I18nProvider lang={validLang}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ToastList lang={validLang} />
      </div>
    </I18nProvider>
  );
}

function LangNotFound() {
  const params = useParams({ strict: false }) as { lang?: string };
  return <NotFoundPage lang={isLang(params.lang) ? params.lang : undefined} />;
}

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) {
      throw notFound();
    }
  },
  component: LangLayout,
  notFoundComponent: LangNotFound,
});
