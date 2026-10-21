import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { SkillsSection } from "@/components/sections/skills";

function SkillsPage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "skills" }} />
      <SkillsSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/skills")({
  component: SkillsPage,
});
