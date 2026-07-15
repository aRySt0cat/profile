"use client";

import { useEffect, useMemo, useState } from "react";
import {
  activities,
  type Activity,
  type ActivityType,
  type Language,
} from "../../src/data/activities";

type Filter = "all" | ActivityType;

const filterOptions: {
  value: Filter;
  label: Record<Language, string>;
  hash: string;
}[] = [
  { value: "all", label: { ja: "すべて", en: "All" }, hash: "all" },
  { value: "book", label: { ja: "書籍", en: "Books" }, hash: "books" },
  { value: "paper", label: { ja: "論文", en: "Papers" }, hash: "papers" },
  { value: "talk", label: { ja: "登壇", en: "Talks" }, hash: "talks" },
];

const typeLabels: Record<ActivityType, string> = {
  book: "BOOK",
  paper: "PAPER",
  talk: "TALK",
};

const activityCopy = {
  ja: {
    filterLabel: "活動種別で絞り込む",
    relatedLinks: "の関連リンク",
    publisher: "出版社",
    bookCover: "の書影",
  },
  en: {
    filterLabel: "Filter activities by type",
    relatedLinks: " — related links",
    publisher: "Publisher",
    bookCover: " — book cover",
  },
} satisfies Record<Language, Record<string, string>>;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function isSelf(name: string) {
  return name === "下垣内 隆太" || name === "Ryuta Shimogauchi";
}

function AuthorList({ authors }: { authors: string[] }) {
  return (
    <p className="activity-authors">
      {authors.map((author, index) => (
        <span key={author}>
          {isSelf(author) ? <strong>{author}</strong> : author}
          {index < authors.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="text-link" href={href} target="_blank" rel="noreferrer noopener">
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function ActivityLinks({
  activity,
  language,
  title,
}: {
  activity: Activity;
  language: Language;
  title: string;
}) {
  const copy = activityCopy[language];

  return (
    <div className="activity-links" aria-label={`${title}${copy.relatedLinks}`}>
      {activity.amazon_url && <ExternalLink href={activity.amazon_url}>Amazon</ExternalLink>}
      {activity.publisher_url && <ExternalLink href={activity.publisher_url}>Publisher</ExternalLink>}
      {activity.announcement_url && <ExternalLink href={activity.announcement_url}>News</ExternalLink>}
      {activity.paper_url && <ExternalLink href={activity.paper_url}>Paper</ExternalLink>}
      {activity.doi && <ExternalLink href={`https://doi.org/${activity.doi}`}>DOI</ExternalLink>}
      {activity.slides_url && <ExternalLink href={activity.slides_url}>Slides</ExternalLink>}
      {activity.event_url && <ExternalLink href={activity.event_url}>Event</ExternalLink>}
      {activity.video_url && <ExternalLink href={activity.video_url}>Video</ExternalLink>}
    </div>
  );
}

function ActivityItem({
  activity,
  index,
  language,
}: {
  activity: Activity;
  index: number;
  language: Language;
}) {
  const copy = activityCopy[language];
  const title = language === "en" ? activity.title_en ?? activity.title : activity.title;
  const subtitle =
    language === "en" ? activity.subtitle_en ?? activity.subtitle : activity.subtitle;
  const authors =
    language === "en" ? activity.authors_en ?? activity.authors : activity.authors;
  const displayDate =
    language === "en" ? activity.display_date_en ?? activity.display_date : activity.display_date;
  const publisher =
    language === "en" ? activity.publisher_en ?? activity.publisher : activity.publisher;
  const venue = language === "en" ? activity.venue_en ?? activity.venue : activity.venue;
  const event = language === "en" ? activity.event_en ?? activity.event : activity.event;

  return (
    <article className={`activity-item activity-${activity.type}`}>
      <div className="activity-rail">
        <span className="activity-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="activity-type">{typeLabels[activity.type]}</span>
      </div>

      <div className="activity-date">
        <time dateTime={activity.sort_date}>{displayDate}</time>
      </div>

      <div className="activity-copy">
        <h3>{title}</h3>
        {subtitle && <p className="activity-subtitle">{subtitle}</p>}
        {authors && <AuthorList authors={authors} />}

        {activity.type === "book" && (
          <dl className="activity-meta">
            <div>
              <dt>{copy.publisher}</dt>
              <dd>{publisher}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{activity.isbn}</dd>
            </div>
          </dl>
        )}

        {activity.type === "paper" && (
          <p className="activity-venue">
            {venue}
            {activity.pages ? `, pp. ${activity.pages}` : ""}
            {activity.year ? `, ${activity.year}` : ""}.
          </p>
        )}

        {activity.type === "talk" && <p className="activity-event">{event}</p>}

        <ActivityLinks activity={activity} language={language} title={title} />
      </div>

      {activity.cover_image && (
        <figure className="book-cover-wrap">
          <img
            className="book-cover"
            src={`${basePath}/${activity.cover_image}`}
            alt={language === "ja" ? `『${title}』${copy.bookCover}` : `${title}${copy.bookCover}`}
            width="360"
            height="480"
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}
    </article>
  );
}

export function ActivityList({ language }: { language: Language }) {
  const [filter, setFilter] = useState<Filter>("all");
  const copy = activityCopy[language];

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.slice(1);
      const option = filterOptions.find((item) => item.hash === hash);
      if (option) setFilter(option.value);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const counts = useMemo(
    () => ({
      all: activities.length,
      book: activities.filter((item) => item.type === "book").length,
      paper: activities.filter((item) => item.type === "paper").length,
      talk: activities.filter((item) => item.type === "talk").length,
    }),
    [],
  );

  const visibleActivities =
    filter === "all" ? activities : activities.filter((item) => item.type === filter);

  const selectFilter = (nextFilter: Filter, hash: string) => {
    setFilter(nextFilter);
    const url = new URL(window.location.href);
    url.hash = nextFilter === "all" ? "" : hash;
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <div className="activity-controls" aria-label={copy.filterLabel}>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="filter-button"
            aria-pressed={filter === option.value}
            onClick={() => selectFilter(option.value, option.hash)}
          >
            <span>{option.label[language]}</span>
            <span className="filter-count">{String(counts[option.value]).padStart(2, "0")}</span>
          </button>
        ))}
        <p className="filter-status" aria-live="polite">
          {language === "ja"
            ? `${visibleActivities.length}件`
            : `${visibleActivities.length} ${visibleActivities.length === 1 ? "item" : "items"}`}
        </p>
      </div>

      <div className="activity-list">
        {visibleActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            index={index}
            language={language}
          />
        ))}
      </div>
    </>
  );
}
