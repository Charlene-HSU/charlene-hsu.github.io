import { SectionShell } from "@/components/layout/section-shell";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/ui/tabs";
import { site, skills } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function SkillsSection() {
  const { t } = useI18n();
  // Tabs are keyed by position, not by the translated name, so the selection
  // survives a language switch (the page is not remounted when `lang` changes).
  const defaultTab = skills.groups.length > 0 ? 0 : undefined;

  return (
    <SectionShell
      id="skills"
      comment={t(site.ui.sections.skills.comment)}
      title={t(site.ui.sections.skills.title)}
    >
      <TabsRoot defaultValue={defaultTab}>
        <TabsList aria-label={t(site.ui.sections.skills.tabsAriaLabel)}>
          {skills.groups.map((group, idx) => (
            <TabsTab key={idx} value={idx}>
              {t(group.name)}
            </TabsTab>
          ))}
        </TabsList>

        {skills.groups.map((group, idx) => (
          <TabsPanel key={idx} value={idx}>
            <div className="flex flex-wrap gap-2.5">
              {group.items.map((skill) => (
                <Badge key={skill} variant="outline" className="px-3 py-1.5 text-body">
                  {skill}
                </Badge>
              ))}
            </div>
          </TabsPanel>
        ))}
      </TabsRoot>
    </SectionShell>
  );
}
