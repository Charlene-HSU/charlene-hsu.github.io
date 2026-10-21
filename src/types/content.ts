import { z } from "zod";

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
  links: z.array(PageIdSchema).min(1),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  bottomLink: z
    .object({
      page: PageIdSchema.optional(),
      url: HttpsOrMailtoSchema.optional(),
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
  blogTags: z.record(BlogTagIdSchema, BilingualObjectSchema),
  footer: FooterSchema,
  embedAllowlist: z.array(z.string()),
  ui: z.object({
    brand: z.string().min(1),
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
    status: z.object({
      statusEyebrow: BilingualObjectSchema,
      clockEyebrow: BilingualObjectSchema,
      timezoneTemplate: BilingualObjectSchema,
      marqueeAriaLabel: BilingualObjectSchema,
      states: z.object({
        open: BilingualObjectSchema,
        busy: BilingualObjectSchema,
        away: BilingualObjectSchema,
      }),
    }),
    sections: z.object({
      about: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        terminalTitle: z.string().min(1),
      }),
      skills: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        tabsAriaLabel: BilingualObjectSchema,
      }),
      experience: z.object({
        comment: BilingualObjectSchema,
        title: BilingualObjectSchema,
        present: BilingualObjectSchema,
        ended: BilingualObjectSchema,
        periodTemplate: BilingualObjectSchema,
        highlightsToggle: BilingualObjectSchema,
      }),
      projects: z.object({
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
    }),
    toast: z.object({
      copiedTitle: BilingualObjectSchema,
      copiedDescription: BilingualObjectSchema,
      closeAriaLabel: BilingualObjectSchema,
    }),
    footer: z.object({
      navHeading: BilingualObjectSchema,
      license: BilingualObjectSchema,
    }),
  }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

export const ProfileStateSchema = z.enum(["open", "busy", "away"]);
export type ProfileState = z.infer<typeof ProfileStateSchema>;

export const ProfileContentSchema = z.object({
  name: LocalizedSchema,
  title: BilingualObjectSchema,
  location: BilingualObjectSchema,
  timezone: z.string().min(1),
  tagline: BilingualObjectSchema,
  status: z.object({
    state: ProfileStateSchema,
    text: BilingualObjectSchema,
  }),
  stats: z.array(
    z.object({
      value: z.number(),
      label: BilingualObjectSchema,
    }),
  ),
  about: z.string().min(1),
});

export type ProfileContent = z.infer<typeof ProfileContentSchema>;

export const SkillsContentSchema = z.object({
  groups: z
    .array(
      z.object({
        name: LocalizedSchema,
        items: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  marquee: z.array(z.string().min(1)).min(1),
});

export type SkillsContent = z.infer<typeof SkillsContentSchema>;

export const ExperienceItemSchema = z.object({
  id: z.string().min(1),
  company: LocalizedSchema,
  role: BilingualObjectSchema,
  period: PeriodSchema,
  // May be left empty (`highlights:`) or omitted; both mean "no highlights".
  highlights: z
    .array(BilingualObjectSchema)
    .nullish()
    .transform((value) => value ?? []),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const ExperienceContentSchema = z.object({
  items: z.array(ExperienceItemSchema),
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
  title: LocalizedSchema.optional(),
  description: LocalizedSchema.optional(),
  ratio: EmbedRatioSchema.optional(),
});

export type ProjectEmbed = z.infer<typeof ProjectEmbedSchema>;

export const ProjectItemSchema = z.object({
  id: z.string().min(1),
  name: LocalizedSchema,
  status: ProjectStatusSchema,
  period: PeriodSchema,
  featured: z.boolean().optional(),
  tags: z.array(z.string().min(1)),
  cover: z.string().min(1).optional(),
  summary: BilingualObjectSchema,
  links: z
    .array(
      z.object({
        type: ProjectLinkTypeSchema,
        url: HttpsUrlSchema,
        label: LocalizedSchema.optional(),
      }),
    )
    .default([]),
  embeds: z.array(ProjectEmbedSchema).default([]),
  body: z.string().min(1).optional(),
});

export type ProjectItem = z.infer<typeof ProjectItemSchema>;

export const ProjectsContentSchema = z.object({
  items: z.array(ProjectItemSchema).min(1),
});

export type ProjectsContent = z.infer<typeof ProjectsContentSchema>;

export const FriendItemSchema = z.object({
  name: LocalizedSchema,
  url: HttpsUrlSchema,
  description: BilingualObjectSchema,
  avatar: z.string().min(1).optional(),
  badge: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).default([]),
});

export type FriendItem = z.infer<typeof FriendItemSchema>;

export const FriendsContentSchema = z.object({
  intro: BilingualObjectSchema,
  items: z.array(FriendItemSchema),
  exchange: z.object({
    name: LocalizedSchema,
    url: HttpsUrlSchema,
    description: BilingualObjectSchema,
    avatar: HttpsUrlSchema,
    badge: HttpsUrlSchema.optional(),
    apply: HttpsOrMailtoSchema,
    rules: BilingualObjectSchema,
  }),
});

export type FriendsContent = z.infer<typeof FriendsContentSchema>;

export const ContactLinkSchema = z
  .object({
    label: LocalizedSchema,
    /** File name in `src/assets/brands/` (svg, png, webp or jpg); the extension is optional. */
    icon: z.string().min(1),
    /** `mono` icons are light and get inverted on light surfaces; `color` icons keep their colors. */
    iconStyle: z.enum(["mono", "color"]).default("mono"),
    /** Opens a page (`https://`) or an email (`mailto:`). */
    url: HttpsOrMailtoSchema.optional(),
    /** Shown and copied on click instead of opening a link, e.g. a Discord username. */
    text: z.string().min(1).optional(),
  })
  .refine((link) => (link.url === undefined) !== (link.text === undefined), {
    message: "Each contact link needs exactly one of `url` or `text`",
  });

export type ContactLink = z.infer<typeof ContactLinkSchema>;

export const ContactContentSchema = z.object({
  email: z.string().email(),
  links: z.array(ContactLinkSchema),
});

export type ContactContent = z.infer<typeof ContactContentSchema>;

export const BlogFrontMatterSchema = z.object({
  title: z.string().min(1),
  date: IsoDateSchema,
  description: z.string().min(1).optional(),
  tags: z.array(BlogTagIdSchema).default([]),
  draft: z.boolean().optional(),
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
