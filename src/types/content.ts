import { z } from "zod";

/**
 * A YAML list. Leaving it empty (`items:`), writing `null` or omitting it all
 * mean "no items", so the owner can clear a list without breaking the build.
 */
export function yamlList<T extends z.ZodTypeAny>(item: T) {
  return z
    .array(item)
    .nullish()
    .transform((value): z.output<T>[] => value ?? []);
}

/** An optional YAML value: leaving it empty, writing `null` or omitting it all mean "not set". */
export function yamlOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform((value): z.output<T> | undefined => value ?? undefined);
}

export const languages = ["en", "zh-TW"] as const;
export type Lang = (typeof languages)[number];

export const BilingualObjectSchema = z.object({
  en: z.string().min(1),
  "zh-TW": z.string().min(1),
});

export const LocalizedSchema = z.union([
  z.string().min(1),
  BilingualObjectSchema,
  z.object({
    en: z.string().optional(),
    "zh-TW": z.string().optional(),
  }),
]);

export type Localized = z.infer<typeof LocalizedSchema>;
export type BilingualText = z.infer<typeof BilingualObjectSchema>;

export const HttpsUrlSchema = z
  .string()
  .url()
  .refine((val) => val.startsWith("https://"), {
    message: "URL must use https://",
  });

export const HttpsOrMailtoSchema = z.string().refine(
  (val) => {
    if (val.startsWith("mailto:")) {
      return val.length > "mailto:".length && val.includes("@");
    }
    try {
      const parsed = new URL(val);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  },
  { message: "Must be a valid https:// or mailto: URL" },
);

export const YearMonthOrDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Date must be YYYY-MM or YYYY-MM-DD");

export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const PeriodSchema = z.object({
  start: YearMonthOrDateSchema,
  end: YearMonthOrDateSchema.nullable(),
});

export type Period = z.infer<typeof PeriodSchema>;

export const NavIconNameSchema = z.enum([
  "User",
  "Braces",
  "Briefcase",
  "FolderGit2",
  "PenLine",
  "Users",
  "Mail",
]);

export type NavIconName = z.infer<typeof NavIconNameSchema>;

export const pageIds = [
  "about",
  "skills",
  "experience",
  "projects",
  "blog",
  "friends",
  "contact",
] as const;
export const PageIdSchema = z.enum(pageIds);
export type PageId = z.infer<typeof PageIdSchema>;

export const NavItemSchema = z.object({
  id: PageIdSchema,
  icon: NavIconNameSchema,
  label: BilingualObjectSchema,
  description: BilingualObjectSchema,
});

export const BlogTagIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Tag ids are lowercase words joined by hyphens");

export const BlogSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs are lowercase words joined by hyphens");

export type NavItem = z.infer<typeof NavItemSchema>;

export const FooterSchema = z.object({
  links: yamlList(PageIdSchema),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  bottomLink: z
    .object({
      page: yamlOptional(PageIdSchema),
      url: yamlOptional(HttpsOrMailtoSchema),
      label: BilingualObjectSchema,
    })
    .refine((link) => (link.page === undefined) !== (link.url === undefined), {
      message: "footer.bottomLink needs exactly one of `page` or `url`",
    }),
});

export type FooterContent = z.infer<typeof FooterSchema>;

export const SiteContentSchema = z.object({
  meta: z.object({
    siteName: BilingualObjectSchema,
    title: BilingualObjectSchema,
    description: BilingualObjectSchema,
    url: HttpsUrlSchema,
    repoUrl: HttpsUrlSchema,
  }),
  nav: z.array(NavItemSchema).min(1),
  blogTags: z
    .record(BlogTagIdSchema, BilingualObjectSchema)
    .nullish()
    .transform((value) => value ?? {}),
  footer: FooterSchema,
  shortcuts: z.object({
    recentDays: z.number().int().min(0),
    limit: z.number().int().min(1),
    /** Show the self-introduction (`md/about.<lang>.md`) under the name on the home page. */
    about: z.boolean().default(true),
  }),
  embedAllowlist: yamlList(z.string()),
  ui: z.object({
    brand: z.string().min(1),
    brandHome: LocalizedSchema,
    pageTitleTemplate: BilingualObjectSchema,
    brandAriaLabel: BilingualObjectSchema,
    mainNavAriaLabel: BilingualObjectSchema,
    mobileMenuAriaLabel: BilingualObjectSchema,
    langSwitchAriaLabel: BilingualObjectSchema,
    githubAriaLabel: BilingualObjectSchema,
    languages: z.object({
      en: z.string().min(1),
      "zh-TW": z.string().min(1),
    }),
    notFound: z.object({
      comment: z.string().min(1),
      title: BilingualObjectSchema,
      message: BilingualObjectSchema,
      homeLink: BilingualObjectSchema,
    }),
    redirect: z.object({
      message: BilingualObjectSchema,
      chooseLanguage: BilingualObjectSchema,
    }),
    hero: z.object({
      prompt: z.string().min(1),
      metaTemplate: BilingualObjectSchema,
    }),
    shortcuts: z.object({
      comment: BilingualObjectSchema,
      kinds: z.object({
        project: BilingualObjectSchema,
        post: BilingualObjectSchema,
      }),
      pinned: BilingualObjectSchema,
    }),
    status: z.object({
      statusEyebrow: BilingualObjectSchema,
      clockEyebrow: BilingualObjectSchema,
      timezoneTemplate: BilingualObjectSchema,
      marqueeAriaLabel: BilingualObjectSchema,
    }),
    sections: z.object({
      about: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        terminalTitle: z.string().min(1),
      }),
      skills: z.object({
        empty: BilingualObjectSchema,
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        tabsAriaLabel: BilingualObjectSchema,
      }),
      experience: z.object({
        empty: BilingualObjectSchema,
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        present: BilingualObjectSchema,
        ended: BilingualObjectSchema,
        periodTemplate: BilingualObjectSchema,
        highlightsToggle: BilingualObjectSchema,
      }),
      projects: z.object({
        empty: BilingualObjectSchema,
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        prompt: z.string().min(1),
        listAriaLabel: BilingualObjectSchema,
        terminalTitleTemplate: z.string().min(1),
        coverAltTemplate: BilingualObjectSchema,
        statuses: z.object({
          active: BilingualObjectSchema,
          wip: BilingualObjectSchema,
          archived: BilingualObjectSchema,
        }),
        linkTypes: z.object({
          github: BilingualObjectSchema,
          demo: BilingualObjectSchema,
          docs: BilingualObjectSchema,
        }),
      }),
      blog: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        empty: BilingualObjectSchema,
        emptyTag: BilingualObjectSchema,
        allTags: BilingualObjectSchema,
        tagFilterAriaLabel: BilingualObjectSchema,
        postTagsAriaLabel: BilingualObjectSchema,
        backToList: BilingualObjectSchema,
      }),
      friends: z.object({
        empty: BilingualObjectSchema,
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        avatarAltTemplate: BilingualObjectSchema,
        badgeAltTemplate: BilingualObjectSchema,
        exchangeTitle: BilingualObjectSchema,
        exchangeSubtitle: BilingualObjectSchema,
        fields: z.object({
          name: BilingualObjectSchema,
          url: BilingualObjectSchema,
          description: BilingualObjectSchema,
          avatar: BilingualObjectSchema,
          badge: BilingualObjectSchema,
        }),
        copyFieldAriaLabel: BilingualObjectSchema,
        copyBadgeHtml: BilingualObjectSchema,
        rulesTitle: BilingualObjectSchema,
        applyCta: BilingualObjectSchema,
      }),
      contact: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        lead: BilingualObjectSchema,
        copyEmail: BilingualObjectSchema,
        sendEmail: BilingualObjectSchema,
        copyHandleAriaLabel: BilingualObjectSchema,
      }),
    }),
    embed: z.object({
      playYoutubeAriaLabel: BilingualObjectSchema,
      youtubeThumbnailAlt: BilingualObjectSchema,
      youtubeDefaultTitle: BilingualObjectSchema,
      externalLinkAriaLabel: BilingualObjectSchema,
      diagramAlt: BilingualObjectSchema,
    }),
    markdown: z.object({
      alerts: z.object({
        note: BilingualObjectSchema,
        tip: BilingualObjectSchema,
        important: BilingualObjectSchema,
        warning: BilingualObjectSchema,
        caution: BilingualObjectSchema,
      }),
    }),
    toast: z.object({
      copiedTitle: BilingualObjectSchema,
      copiedDescription: BilingualObjectSchema,
      closeAriaLabel: BilingualObjectSchema,
    }),
    footer: z.object({
      navHeading: BilingualObjectSchema,
      license: BilingualObjectSchema,
      licenseTooltip: BilingualObjectSchema,
      licenseUrl: HttpsUrlSchema,
      wordCount: BilingualObjectSchema,
    }),
  }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

export const StatusColorSchema = z.enum(["green", "yellow", "red", "gray"]);
export type StatusColor = z.infer<typeof StatusColorSchema>;

export const StatusPresetSchema = z.object({
  color: StatusColorSchema,
  label: BilingualObjectSchema,
  text: BilingualObjectSchema,
});
export type StatusPreset = z.infer<typeof StatusPresetSchema>;

/** `presets` holds every saved status; `enable` names the one shown on the home page. */
export const ProfileStatusSchema = z
  .object({
    enable: z.string().min(1),
    presets: z.record(z.string(), StatusPresetSchema),
  })
  .refine((status) => status.enable in status.presets, {
    message: "status.enable must name one of the keys under status.presets",
    path: ["enable"],
  });

export const ProfileContentSchema = z.object({
  name: LocalizedSchema,
  title: BilingualObjectSchema,
  location: BilingualObjectSchema,
  timezone: z.string().min(1),
  tagline: BilingualObjectSchema,
  status: ProfileStatusSchema,
  stats: yamlList(
    z.object({
      value: z.number(),
      label: BilingualObjectSchema,
    }),
  ),
  about: z.string().min(1),
});

export type ProfileContent = z.infer<typeof ProfileContentSchema>;

export const SkillsContentSchema = z.object({
  groups: yamlList(
    z.object({
      name: LocalizedSchema,
      items: yamlList(z.string().min(1)),
    }),
  ),
  marquee: yamlList(z.string().min(1)),
});

export type SkillsContent = z.infer<typeof SkillsContentSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: LocalizedSchema,
  role: BilingualObjectSchema,
  period: PeriodSchema,
  highlights: yamlList(BilingualObjectSchema),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

/** One titled block on the Experience page (e.g. education, competitions, communities). */
export const ExperienceGroupSchema = z.object({
  id: z.string().min(1),
  title: BilingualObjectSchema,
  items: yamlList(ExperienceItemSchema),
});

export type ExperienceGroup = z.infer<typeof ExperienceGroupSchema>;

export const ExperienceContentSchema = z.object({
  groups: yamlList(ExperienceGroupSchema),
});

export type ExperienceContent = z.infer<typeof ExperienceContentSchema>;

export const ProjectStatusSchema = z.enum(["active", "wip", "archived"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectLinkTypeSchema = z.enum(["github", "demo", "docs"]);
export type ProjectLinkType = z.infer<typeof ProjectLinkTypeSchema>;

export const EmbedRatioSchema = z.enum(["video", "wide", "square"]);
export type EmbedRatio = z.infer<typeof EmbedRatioSchema>;

export const ProjectEmbedSchema = z.object({
  kind: z.enum(["card", "youtube", "iframe"]),
  url: HttpsUrlSchema,
  title: yamlOptional(LocalizedSchema),
  description: yamlOptional(LocalizedSchema),
  ratio: yamlOptional(EmbedRatioSchema),
});

export type ProjectEmbed = z.infer<typeof ProjectEmbedSchema>;

export const ProjectItemSchema = z.object({
  id: z.string().min(1),
  name: LocalizedSchema,
  status: ProjectStatusSchema,
  period: PeriodSchema,
  featured: yamlOptional(z.boolean()),
  /** Last update (YYYY-MM or YYYY-MM-DD); falls back to `period.start` for the home shortcuts. */
  updated: yamlOptional(YearMonthOrDateSchema),
  /** Always show this project in the home shortcuts. */
  pinned: yamlOptional(z.boolean()),
  tags: yamlList(z.string().min(1)),
  cover: yamlOptional(z.string().min(1)),
  summary: BilingualObjectSchema,
  links: yamlList(
    z.object({
      type: ProjectLinkTypeSchema,
      url: HttpsUrlSchema,
      label: yamlOptional(LocalizedSchema),
    }),
  ),
  embeds: yamlList(ProjectEmbedSchema),
  body: yamlOptional(z.string().min(1)),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const ProjectsContentSchema = z.object({
  items: yamlList(ProjectItemSchema),
});

export type ProjectsContent = z.infer<typeof ProjectsContentSchema>;

export const FriendItemSchema = z.object({
  name: LocalizedSchema,
  url: HttpsUrlSchema,
  description: BilingualObjectSchema,
  avatar: yamlOptional(z.string().min(1)),
  badge: yamlOptional(z.string().min(1)),
  tags: yamlList(z.string().min(1)),
});

export type FriendItem = z.infer<typeof FriendItemSchema>;

export const FriendsContentSchema = z.object({
  intro: BilingualObjectSchema,
  items: yamlList(FriendItemSchema),
  // Leave empty or remove to hide the link-exchange card.
  exchange: yamlOptional(
    z.object({
      name: LocalizedSchema,
      url: HttpsUrlSchema,
      description: BilingualObjectSchema,
      avatar: HttpsUrlSchema,
      badge: yamlOptional(HttpsUrlSchema),
      apply: HttpsOrMailtoSchema,
      rules: BilingualObjectSchema,
    }),
  ),
});

export type FriendsContent = z.infer<typeof FriendsContentSchema>;

export const ContactLinkSchema = z
  .object({
    label: LocalizedSchema,
    /** File name in `src/assets/brands/` (svg, png, webp or jpg); the extension is optional. */
    icon: z.string().min(1),
    /** `mono` icons are light and get inverted on light surfaces; `color` icons keep their colors. */
    iconStyle: z
      .enum(["mono", "color"])
      .nullish()
      .transform((value) => value ?? "mono"),
    /** Opens a page (`https://`) or an email (`mailto:`). */
    url: yamlOptional(HttpsOrMailtoSchema),
    /** Shown and copied on click instead of opening a link, e.g. a Discord username. */
    text: yamlOptional(z.string().min(1)),
  })
  .refine((link) => (link.url === undefined) !== (link.text === undefined), {
    message: "Each contact link needs exactly one of `url` or `text`",
  });

export type ContactLink = z.infer<typeof ContactLinkSchema>;

export const ContactContentSchema = z.object({
  email: z.string().email(),
  links: yamlList(ContactLinkSchema),
});

export type ContactContent = z.infer<typeof ContactContentSchema>;

export const BlogFrontMatterSchema = z.object({
  title: z.string().min(1),
  date: IsoDateSchema,
  description: yamlOptional(z.string().min(1)),
  tags: yamlList(BlogTagIdSchema),
  draft: yamlOptional(z.boolean()),
  /** Last update (YYYY-MM-DD); falls back to `date` for the home shortcuts. */
  updated: yamlOptional(IsoDateSchema),
  /** Always show this post in the home shortcuts. */
  pinned: yamlOptional(z.boolean()),
});

export type BlogFrontMatter = z.infer<typeof BlogFrontMatterSchema>;

export interface BlogPost {
  slug: string;
  lang: Lang;
  title: string;
  date: string;
  description?: string;
  tags: string[];
  draft: boolean;
  updated?: string;
  pinned: boolean;
  body: string;
}

export const OgEntrySchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  siteName: z.string().optional(),
  fetchedAt: z.string(),
});

export type OgEntry = z.infer<typeof OgEntrySchema>;
export const OgCacheSchema = z.record(z.string(), OgEntrySchema);
export type OgCache = z.infer<typeof OgCacheSchema>;
