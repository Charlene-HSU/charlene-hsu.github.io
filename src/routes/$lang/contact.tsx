import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { ContactSection } from "@/components/sections/contact";

function ContactPage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "contact" }} />
      <ContactSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/contact")({
  component: ContactPage,
});
