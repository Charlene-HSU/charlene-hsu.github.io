import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { BlogPostSection } from "@/components/sections/blog-post";
import { getBlogSlugs } from "@/lib/markdown";

function BlogPostPage() {
  const { slug } = Route.useParams();
  return (
    <>
      <PageMeta page={{ kind: "post", slug }} />
      <BlogPostSection slug={slug} />
    </>
  );
}

export const Route = createFileRoute("/$lang/blog/$slug")({
  beforeLoad: ({ params }) => {
    // Drafts are only listed in development, so they 404 in production builds.
    if (!getBlogSlugs().includes(params.slug)) {
      throw notFound();
    }
  },
  component: BlogPostPage,
});
