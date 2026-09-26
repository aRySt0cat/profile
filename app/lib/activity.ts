import type {
  Activity,
  ActivityType,
  Language,
} from "../../src/data/activities";

export type ActivityFilter = "all" | ActivityType;

export const filterOptions = [
  { value: "all", hash: "all", ja: "すべて", en: "All" },
  { value: "book", hash: "books", ja: "書籍", en: "Books" },
  { value: "paper", hash: "papers", ja: "論文", en: "Papers" },
  { value: "talk", hash: "talks", ja: "登壇", en: "Talks" },
] as const satisfies readonly ({
  value: ActivityFilter;
  hash: string;
} & Record<Language, string>)[];

export const categoryLabels: Record<ActivityType, Record<Language, string>> = {
  book: { ja: "書籍", en: "Book" },
  paper: { ja: "論文", en: "Paper" },
  talk: { ja: "登壇", en: "Talk" },
};

export const filteredActivities = (items: Activity[], filter: ActivityFilter) =>
  filter === "all" ? items : items.filter((item) => item.type === filter);

export function localized(activity: Activity, language: Language) {
  const en = language === "en";
  return {
    title: (en && activity.title_en) || activity.title,
    subtitle: (en && activity.subtitle_en) || activity.subtitle,
    authors: (en && activity.authors_en) || activity.authors,
    publisher: (en && activity.publisher_en) || activity.publisher,
    venue: (en && activity.venue_en) || activity.venue,
    event: (en && activity.event_en) || activity.event,
  };
}

/**
 * Formats `sort_date` as `YYYY.MM.DD`, but never more precisely than the
 * editor's `display_date` states: a paper shown as "2025" stays "2025" even
 * when its sort key carries a month.
 */
export function formatDate(activity: Activity) {
  const parts = activity.sort_date.split("-");
  const shown = /日/.test(activity.display_date)
    ? 3
    : /月/.test(activity.display_date)
      ? 2
      : 1;
  return parts.slice(0, shown).join(".");
}

export const activityYear = (activity: Activity) =>
  activity.sort_date.slice(0, 4);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** The page on this site that presents a talk's deck. */
export const talkPath = (slug: string) => `${basePath}/talks/${slug}/`;

/** The built deck itself, for opening it on its own. */
export const deckPath = (slug: string, page = 1) =>
  `${basePath}/slides/${slug}/index.html#/${page}`;

export type ActivityLink = {
  label: string;
  href: string;
  /** Links on this site open in place; everything else opens a new tab. */
  internal: boolean;
};

export function activityLinks(activity: Activity): ActivityLink[] {
  const deck = activity.deck && talkPath(activity.deck.slug);
  return [
    ["Amazon", activity.amazon_url],
    ["Publisher", activity.publisher_url],
    ["News", activity.announcement_url],
    ["Paper", activity.paper_url],
    ["DOI", activity.doi && `https://doi.org/${activity.doi}`],
    ["Slides", deck ?? activity.slides_url],
    ["Event", activity.event_url],
    ["Video", activity.video_url],
  ]
    .filter((link): link is [string, string] => Boolean(link[1]))
    .map(([label, href]) => ({ label, href, internal: href === deck }));
}

/** The link a reader most likely wants when they choose the title itself. */
export function primaryLink(activity: Activity): ActivityLink | undefined {
  const links = activityLinks(activity);
  const preferred = {
    book: ["Publisher", "Amazon"],
    paper: ["Paper"],
    talk: ["Slides", "Event", "Video"],
  }[activity.type];
  for (const label of preferred) {
    const link = links.find((candidate) => candidate.label === label);
    if (link) return link;
  }
}

export function filterForHash(hash: string) {
  return filterOptions.find((option) => option.hash === hash)?.value;
}
