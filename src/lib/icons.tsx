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
import githubSvg from "@/assets/brands/github.svg";
import linkedinSvg from "@/assets/brands/linkedin.svg";
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

const brandSvgAllowlist: Record<string, string> = {
  github: githubSvg,
  linkedin: linkedinSvg,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const IconComponent = navIconAllowlist[name];
  return <IconComponent className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}

export function BrandIcon({
  name,
  className,
  inverted = false,
}: {
  name: string;
  className?: string;
  inverted?: boolean;
}) {
  const svgSrc = brandSvgAllowlist[name.toLowerCase()];
  if (svgSrc) {
    return (
      <img
        src={svgSrc}
        alt=""
        aria-hidden="true"
        className={cn("size-4 shrink-0", inverted && "invert", className)}
      />
    );
  }
  return <Mail className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}
