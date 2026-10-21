import { createFileRoute } from "@tanstack/react-router";
import { PageMeta } from "@/components/layout/page-meta";
import { FriendsSection } from "@/components/sections/friends";

function FriendsPage() {
  return (
    <>
      <PageMeta page={{ kind: "nav", id: "friends" }} />
      <FriendsSection />
    </>
  );
}

export const Route = createFileRoute("/$lang/friends")({
  component: FriendsPage,
});
