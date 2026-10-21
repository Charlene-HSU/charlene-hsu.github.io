import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { getPageMeta, type PageRef } from "@/lib/pages";

/** Keeps the document title and description in sync with the current page after client navigation. */
export function PageMeta({ page }: { page: PageRef }) {
  const { lang } = useI18n();
  const { title, description } = getPageMeta(page, lang);

  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);

  return null;
}
