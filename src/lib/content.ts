import siteRaw from "@/content/site.yaml";
import profileRaw from "@/content/profile.yaml";
import skillsRaw from "@/content/skills.yaml";
import experienceRaw from "@/content/experience.yaml";
import projectsRaw from "@/content/projects.yaml";
import friendsRaw from "@/content/friends.yaml";
import contactRaw from "@/content/contact.yaml";
import ogCacheRaw from "@/content/.generated/og.json";
import {
  ContactContentSchema,
  ExperienceContentSchema,
  FriendsContentSchema,
  OgCacheSchema,
  ProfileContentSchema,
  ProjectsContentSchema,
  SiteContentSchema,
  SkillsContentSchema,
  type ContactContent,
  type ExperienceContent,
  type FriendsContent,
  type OgCache,
  type OgEntry,
  type Period,
  type ProfileContent,
  type ProjectItem,
  type ProjectStatus,
  type ProjectsContent,
  type SiteContent,
  type SkillsContent,
} from "@/types/content";
import type { ResponsiveImageOutput } from "@/types/responsive";

export const site: SiteContent = SiteContentSchema.parse(siteRaw);
export const profile: ProfileContent = ProfileContentSchema.parse(profileRaw);
export const skills: SkillsContent = SkillsContentSchema.parse(skillsRaw);
export const experience: ExperienceContent = ExperienceContentSchema.parse(experienceRaw);
export const projects: ProjectsContent = ProjectsContentSchema.parse(projectsRaw);
export const friends: FriendsContent = FriendsContentSchema.parse(friendsRaw);
export const contact: ContactContent = ContactContentSchema.parse(contactRaw);
export const ogCache: OgCache = OgCacheSchema.parse(ogCacheRaw);

export type PeriodStatus = "present" | "ended";

export function computePeriodStatus(period: Period): PeriodStatus {
  return period.end === null ? "present" : "ended";
}

export function computeProjectBadgeStatus(project: ProjectItem): ProjectStatus {
  if (project.status === "archived") {
    return "archived";
  }
  if (project.period.end !== null && project.status !== "wip") {
    return "archived";
  }
  return project.status;
}

export function normalizeUrlForOg(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

export function getOgEntry(url: string): OgEntry | undefined {
  const normalized = normalizeUrlForOg(url);
  return (
    ogCache[normalized] ??
    ogCache[url] ??
    ogCache[normalized.replace(/\/$/, "")] ??
    ogCache[`${normalized.replace(/\/$/, "")}/`]
  );
}

const projectCoverModules = import.meta.glob<ResponsiveImageOutput | string>(
  "/src/assets/projects/*.{webp,png,jpg,jpeg}",
  {
    query: "?responsive",
    import: "default",
    eager: true,
  },
);

const friendAvatarModules = import.meta.glob<ResponsiveImageOutput | string>(
  "/src/assets/friends/*.{webp,png,jpg,jpeg}",
  {
    query: "?responsive",
    import: "default",
    eager: true,
  },
);

const friendBadgeModules = import.meta.glob<string>(
  "/src/assets/friends/badges/*.{gif,png,webp,svg}",
  {
    import: "default",
    eager: true,
  },
);

const blogImageModules = import.meta.glob<ResponsiveImageOutput | string>(
  "/src/assets/blog/**/*.{webp,png,jpg,jpeg}",
  {
    query: "?responsive",
    import: "default",
    eager: true,
  },
);

export function getProjectCoverAsset(
  filename?: string,
): ResponsiveImageOutput | string | undefined {
  if (!filename) return undefined;
  return projectCoverModules[`/src/assets/projects/${filename}`];
}

export function getFriendAvatarAsset(
  filename?: string,
): ResponsiveImageOutput | string | undefined {
  if (!filename) return undefined;
  return friendAvatarModules[`/src/assets/friends/${filename}`];
}

export function getFriendBadgeAsset(filename?: string): string | undefined {
  if (!filename) return undefined;
  return friendBadgeModules[`/src/assets/friends/badges/${filename}`];
}

export function getMarkdownAsset(
  src: string,
  blogSlug?: string,
): ResponsiveImageOutput | string | undefined {
  const cleanSrc = src.replace(/^\.\//, "");
  if (blogSlug) {
    const blogKey = `/src/assets/blog/${blogSlug}/${cleanSrc}`;
    if (blogImageModules[blogKey]) {
      return blogImageModules[blogKey];
    }
  }
  const projectKey = `/src/assets/projects/${cleanSrc}`;
  if (projectCoverModules[projectKey]) {
    return projectCoverModules[projectKey];
  }
  const directBlogKey = `/src/assets/blog/${cleanSrc}`;
  if (blogImageModules[directBlogKey]) {
    return blogImageModules[directBlogKey];
  }
  return undefined;
}
