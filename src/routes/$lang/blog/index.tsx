import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { BlogListSection } from "@/components/sections/blog-list";

export interface BlogSearch {
  tag?: string;
}

function BlogPage() {
  const { tag } = Route.useSearch();
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "blog" }} />
      <BlogListSection tag={tag} />
    </>
  );
}

export const Route = createFileRoute("/$lang/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    tag: typeof search.tag === "string" && search.tag.length > 0 ? search.tag : undefined,
  }),
  component: BlogPage,
});
