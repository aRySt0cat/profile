"use client";

import { useEffect, useMemo, useState } from "react";
import { activities, type Activity, type ActivityType } from "../../src/data/activities";

type Filter = "all" | ActivityType;

const filterOptions: { value: Filter; label: string; hash: string }[] = [
  { value: "all", label: "All", hash: "all" },
  { value: "book", label: "Books", hash: "books" },
  { value: "paper", label: "Papers", hash: "papers" },
  { value: "talk", label: "Talks", hash: "talks" },
];

const typeLabels: Record<ActivityType, string> = {
  book: "BOOK",
  paper: "PAPER",
  talk: "TALK",
};

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

function ActivityLinks({ activity }: { activity: Activity }) {
  return (
    <div className="activity-links" aria-label={`${activity.title}の関連リンク`}>
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

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  return (
    <article className={`activity-item activity-${activity.type}`}>
      <div className="activity-rail">
        <span className="activity-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="activity-type">{typeLabels[activity.type]}</span>
      </div>

      <div className="activity-date">
        <time dateTime={activity.sort_date}>{activity.display_date}</time>
      </div>

      <div className="activity-copy">
        <h3>{activity.title}</h3>
        {activity.subtitle && <p className="activity-subtitle">{activity.subtitle}</p>}
        {activity.authors && <AuthorList authors={activity.authors} />}

        {activity.type === "book" && (
          <dl className="activity-meta">
            <div>
              <dt>Publisher</dt>
              <dd>{activity.publisher}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{activity.isbn}</dd>
            </div>
          </dl>
        )}

        {activity.type === "paper" && (
          <p className="activity-venue">
            {activity.venue}
            {activity.pages ? `, pp. ${activity.pages}` : ""}
            {activity.year ? `, ${activity.year}` : ""}.
          </p>
        )}

        {activity.type === "talk" && <p className="activity-event">{activity.event}</p>}

        <ActivityLinks activity={activity} />
      </div>

      {activity.cover_image && (
        <figure className="book-cover-wrap">
          <img
            className="book-cover"
            src={`${basePath}/${activity.cover_image}`}
            alt={`『${activity.title}』の書影`}
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

export function ActivityList() {
  const [filter, setFilter] = useState<Filter>("all");

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
      <div className="activity-controls" aria-label="活動種別で絞り込む">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="filter-button"
            aria-pressed={filter === option.value}
            onClick={() => selectFilter(option.value, option.hash)}
          >
            <span>{option.label}</span>
            <span className="filter-count">{String(counts[option.value]).padStart(2, "0")}</span>
          </button>
        ))}
        <p className="filter-status" aria-live="polite">
          {visibleActivities.length}件
        </p>
      </div>

      <div className="activity-list">
        {visibleActivities.map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </>
  );
}
