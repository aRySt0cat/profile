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

export function activityLinks(activity: Activity) {
  return [
    ["Amazon", activity.amazon_url],
    ["Publisher", activity.publisher_url],
    ["News", activity.announcement_url],
    ["Paper", activity.paper_url],
    ["DOI", activity.doi && `https://doi.org/${activity.doi}`],
    ["Slides", activity.slides_url],
    ["Event", activity.event_url],
    ["Video", activity.video_url],
  ].filter((link): link is [string, string] => Boolean(link[1]));
}

/** The link a reader most likely wants when they choose the title itself. */
export function primaryLink(activity: Activity) {
  if (activity.type === "book")
    return activity.publisher_url ?? activity.amazon_url;
  if (activity.type === "paper") return activity.paper_url;
  return activity.slides_url ?? activity.event_url ?? activity.video_url;
}

export function filterForHash(hash: string) {
  return filterOptions.find((option) => option.hash === hash)?.value;
}
