"use client";

import type { Activity, Language } from "../../src/data/activities";
import { ACTIVITY_START } from "../lib/narrative";

const categories = {
  book: { ja: "書籍", en: "Book" },
  paper: { ja: "論文", en: "Paper" },
  talk: { ja: "登壇", en: "Talk" },
};

export function ActivityContents({
  items,
  language,
  onSelect,
}: {
  items: Activity[];
  language: Language;
  onSelect: (id: string) => void;
}) {
  const midpoint = Math.ceil(items.length / 2);
  const columns = [items.slice(0, midpoint), items.slice(midpoint)];

  return (
    <>
      {columns.map((column, side) => (
        <div
          className={`paper-page ${side === 0 ? "page-left" : "page-right"}`}
          key={side}
        >
          <div className="page-inner contents-page" tabIndex={0}>
            {side === 0 ? (
              <>
                <p className="page-label">Activities</p>
                <div className="contents-heading">
                  <h2 id="activities-title">
                    {language === "ja" ? "目次" : "Contents"}
                  </h2>
                  <span aria-live="polite">
                    {language === "ja"
                      ? `${items.length}件`
                      : `${items.length} items`}
                  </span>
                </div>
              </>
            ) : (
              <p className="contents-continuation">
                {language === "ja" ? "目次" : "Contents"}
              </p>
            )}
            <ol className="contents-list" start={side === 0 ? 1 : midpoint + 1}>
              {column.map((item, localIndex) => {
                const index = localIndex + (side === 0 ? 0 : midpoint);
                const title =
                  language === "en"
                    ? (item.title_en ?? item.title)
                    : item.title;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onSelect(item.id);
                      }}
                      title={title}
                    >
                      <div className="contents-entry">
                        <span className="contents-meta">
                          <time dateTime={item.sort_date}>
                            {item.sort_date.slice(0, 4)}
                          </time>
                          <span>{categories[item.type][language]}</span>
                        </span>
                        <span className="contents-title">{title}</span>
                      </div>
                      <span
                        className="contents-folio"
                        aria-label={
                          language === "ja"
                            ? `${index + ACTIVITY_START + 1}ページ`
                            : `Page ${index + ACTIVITY_START + 1}`
                        }
                      >
                        {String(index + ACTIVITY_START + 1).padStart(2, "0")}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ))}
    </>
  );
}
