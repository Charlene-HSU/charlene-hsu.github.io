import { useEffect } from "react";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ToastList } from "@/components/ui/toast";
import { site } from "@/lib/content";
import { I18nProvider, isLang, t, type Lang } from "@/lib/i18n";

function LangLayout() {
  const { lang } = Route.useParams();
  const validLang: Lang = isLang(lang) ? lang : "en";

  useEffect(() => {
    document.documentElement.lang = validLang;
    document.title = t(site.meta.title, validLang);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", t(site.meta.description, validLang));
    }
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

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) {
      throw notFound();
    }
  },
  component: LangLayout,
});
