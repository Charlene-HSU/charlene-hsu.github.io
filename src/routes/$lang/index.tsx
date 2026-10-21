import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { HeroSection } from "@/components/sections/hero";
import { ShortcutsSection } from "@/components/sections/shortcuts";
import { MarqueeSection, StatusSection } from "@/components/sections/status";

function HomePage() {
  return (
    <>
      <PageMeta page={{ kind: "home" }} />
      <HeroSection />
      <StatusSection />
      <ShortcutsSection />
      <MarqueeSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/")({
  component: HomePage,
});
