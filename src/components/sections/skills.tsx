import { SectionShell } from "@/components/layout/section-shell";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/ui/tabs";
import { site, skills } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function SkillsSection() {
  const { t } = useI18n();
  const defaultTab = skills.groups[0] ? t(skills.groups[0].name) : "";

  return (
    <SectionShell
      id="skills"
      comment={t(site.ui.sections.skills.comment)}
      title={t(site.ui.sections.skills.title)}
    >
      <TabsRoot defaultValue={defaultTab}>
        <TabsList aria-label={t(site.ui.sections.skills.tabsAriaLabel)}>
          {skills.groups.map((group) => {
            const groupName = t(group.name);
            return (
              <TabsTab key={groupName} value={groupName}>
                {groupName}
              </TabsTab>
            );
          })}
        </TabsList>

        {skills.groups.map((group) => {
          const groupName = t(group.name);
          return (
            <TabsPanel key={groupName} value={groupName}>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((skill) => (
                  <Badge key={skill} variant="outline" className="px-3 py-1.5 text-body">
                    {skill}
                  </Badge>
                ))}
              </div>
            </TabsPanel>
          );
        })}
      </TabsRoot>
    </SectionShell>
  );
}
