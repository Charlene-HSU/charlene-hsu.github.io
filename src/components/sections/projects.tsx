import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Embed } from "@/components/embed";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { ResponsiveImage } from "@/components/responsive-image";
import { Terminal } from "@/components/terminal";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/collapsible";
import { computeProjectBadgeStatus, getProjectCoverAsset, projects, site } from "@/lib/content";
import { formatTemplate, useI18n } from "@/lib/i18n";
import { BrandIcon } from "@/lib/icons";
import { getMarkdownContent } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import type { ProjectItem, ProjectStatus } from "@/types/content";

const statusVariantMap: Record<ProjectStatus, BadgeVariant> = {
  active: "green",
  wip: "yellow",
  archived: "red",
};

function getDesktopTileCornerClasses(index: number, total: number): string {
  if (total === 1) {
    return "rounded-l-xl rounded-r-sm";
  }
  if (index === 0) {
    return "rounded-tl-xl rounded-tr-sm rounded-b-sm";
  }
  if (index === total - 1) {
    return "rounded-bl-xl rounded-br-sm rounded-t-sm";
  }
  return "rounded-sm";
}

function getMobileTileCornerClasses(index: number, total: number): string {
  if (total === 1) {
    return "rounded-xl";
  }
  if (index === 0) {
    return "rounded-t-xl rounded-b-sm";
  }
  if (index === total - 1) {
    return "rounded-t-sm rounded-b-xl";
  }
  return "rounded-sm";
}

function ProjectDetailContent({
  project,
  isFirstProject,
}: {
  project: ProjectItem;
  isFirstProject: boolean;
}) {
  const { lang, t, tf } = useI18n();
  const coverAsset = getProjectCoverAsset(project.cover);
  const bodyMarkdown = project.body ? getMarkdownContent(project.body, lang) : "";
  const projectName = t(project.name);

  return (
    <div className="flex flex-col gap-6">
      {coverAsset ? (
        <ResponsiveImage
          image={coverAsset}
          alt={tf(site.ui.sections.projects.coverAltTemplate, { name: projectName })}
          sizes="(min-width: 960px) 540px, 100vw"
          loading={isFirstProject ? "eager" : "lazy"}
          fetchPriority={isFirstProject ? "high" : "auto"}
          className="aspect-video w-full rounded-md border border-rule"
        />
      ) : null}

      <p className="font-sans text-lead text-foreground">{t(project.summary)}</p>

      {project.links.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {project.links.map((link) => {
            const label = link.label
              ? t(link.label)
              : t(site.ui.sections.projects.linkTypes[link.type]);
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: link.type === "demo" ? "primary" : "outline",
                })}
              >
                {link.type === "github" ? <BrandIcon name="github" /> : null}
                <span>{label}</span>
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      ) : null}

      {bodyMarkdown ? <Markdown content={bodyMarkdown} /> : null}

      {project.embeds.length > 0 ? (
        <div className="flex flex-col gap-4">
          {project.embeds.map((embed) => (
            <Embed key={embed.url} embed={embed} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProjectsSection() {
  const { lang, t } = useI18n();
  const search = useSearch({ strict: false }) as { p?: string };
  const navigate = useNavigate();

  const selectedProject = projects.items.find((item) => item.id === search.p) ?? projects.items[0];

  const handleSelectProject = (projectId: string) => {
    void navigate({
      to: "/$lang/",
      params: { lang },
      search: { p: projectId },
      hash: "projects",
      replace: true,
    });
  };

  return (
    <SectionShell
      id="projects"
      comment={t(site.ui.sections.projects.comment)}
      title={t(site.ui.sections.projects.title)}
      headerRight={
        <span className="font-mono text-body text-gray">{site.ui.sections.projects.prompt}</span>
      }
    >
      {/* Desktop Split Layout: Left Stacked Tiles + Right Terminal Detail Panel */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-2">
        <div
          role="group"
          aria-label={t(site.ui.sections.projects.listAriaLabel)}
          className="flex flex-col gap-2 md:col-span-5"
        >
          {projects.items.map((item, idx) => {
            const isSelected = item.id === selectedProject.id;
            const badgeStatus = computeProjectBadgeStatus(item);
            return (
              <Button
                key={item.id}
                variant="outline"
                onClick={() => handleSelectProject(item.id)}
                aria-pressed={isSelected}
                className={cn(
                  "h-auto w-full flex-col items-start justify-start gap-3 p-5 text-left",
                  getDesktopTileCornerClasses(idx, projects.items.length),
                  isSelected && "border-green bg-surface",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-mono text-h2 font-bold",
                      isSelected ? "text-green" : "text-foreground",
                    )}
                  >
                    {t(item.name)}
                  </span>
                  <Badge variant={statusVariantMap[badgeStatus]}>
                    {t(site.ui.sections.projects.statuses[badgeStatus])}
                  </Badge>
                </div>
                <p className="line-clamp-2 font-sans text-body font-normal text-gray">
                  {t(item.summary)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Button>
            );
          })}
        </div>

        <div className="md:col-span-7">
          {selectedProject ? (
            <Terminal
              title={formatTemplate(site.ui.sections.projects.terminalTitleTemplate, {
                id: selectedProject.id,
              })}
              className="h-full rounded-l-sm rounded-r-xl"
            >
              <ProjectDetailContent
                project={selectedProject}
                isFirstProject={selectedProject.id === projects.items[0]?.id}
              />
            </Terminal>
          ) : null}
        </div>
      </div>

      {/* Mobile Accordion Layout */}
      <div className="md:hidden">
        <AccordionRoot
          value={selectedProject ? [selectedProject.id] : []}
          onValueChange={(openValues) => {
            const nextId = openValues[0] as string | undefined;
            if (nextId) {
              handleSelectProject(nextId);
            }
          }}
        >
          {projects.items.map((item, idx) => {
            const badgeStatus = computeProjectBadgeStatus(item);
            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={getMobileTileCornerClasses(idx, projects.items.length)}
              >
                <AccordionHeader>
                  <AccordionTrigger>
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-h2 font-bold text-foreground">
                          {t(item.name)}
                        </span>
                        <Badge variant={statusVariantMap[badgeStatus]}>
                          {t(site.ui.sections.projects.statuses[badgeStatus])}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronDown className="size-4 shrink-0 text-gray" aria-hidden="true" />
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel>
                  <ProjectDetailContent project={item} isFirstProject={idx === 0} />
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </div>
    </SectionShell>
  );
}
