import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/sections/about";
import { BlogSection } from "@/components/sections/blog";
import { ContactSection } from "@/components/sections/contact";
import { ExperienceSection } from "@/components/sections/experience";
import { FriendsSection } from "@/components/sections/friends";
import { HeroSection } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { StatusSection } from "@/components/sections/status";

export interface HomeSearch {
  p?: string;
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <StatusSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <BlogSection />
      <FriendsSection />
      <ContactSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    return {
      p: typeof search.p === "string" && search.p.length > 0 ? search.p : undefined,
    };
  },
  component: HomePage,
});
