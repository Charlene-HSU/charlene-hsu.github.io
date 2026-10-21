import {
  Braces,
  Briefcase,
  FolderGit2,
  Mail,
  PenLine,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { resolveBrandIcon } from "@/lib/brand-icons";
import { cn } from "@/lib/utils";
import type { NavIconName } from "@/types/content";

const navIconAllowlist: Record<NavIconName, LucideIcon> = {
  User,
  Braces,
  Briefcase,
  FolderGit2,
  PenLine,
  Users,
  Mail,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const IconComponent = navIconAllowlist[name];
  return <IconComponent className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}

export function BrandIcon({
  name,
  className,
  inverted = false,
  iconStyle = "mono",
}: {
  name: string;
  className?: string;
  /** The icon sits on a light surface. */
  inverted?: boolean;
  iconStyle?: "mono" | "color";
}) {
  const src = resolveBrandIcon(name);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 object-contain",
          inverted && iconStyle === "mono" && "invert",
          className,
        )}
      />
    );
  }
  return <Mail className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}
