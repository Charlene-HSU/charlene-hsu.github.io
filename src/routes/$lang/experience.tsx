import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { ExperienceSection } from "@/components/sections/experience";

function ExperiencePage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "experience" }} />
      <ExperienceSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/experience")({
  component: ExperiencePage,
});
