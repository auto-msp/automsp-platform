import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";

export default function AppNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="That page doesn’t exist in this workspace"
      description="The record may have been deleted, or the link may belong to a different organization."
      action={{ href: "/app/dashboard", label: "Back to dashboard" }}
    />
  );
}
