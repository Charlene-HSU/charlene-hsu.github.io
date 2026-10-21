import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { ProjectsSection } from "@/components/sections/projects";

export interface ProjectsSearch {
  p?: string;
}

function ProjectsPage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "projects" }} />
      <ProjectsSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/projects")({
  validateSearch: (search: Record<string, unknown>): ProjectsSearch => ({
    p: typeof search.p === "string" && search.p.length > 0 ? search.p : undefined,
  }),
  component: ProjectsPage,
});
