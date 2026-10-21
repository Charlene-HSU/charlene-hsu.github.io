import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { AboutSection } from "@/components/sections/about";

function AboutPage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "about" }} />
      <AboutSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/about")({
  component: AboutPage,
});
