import type { Language } from "../../src/data/activities";
import { education } from "../../src/data/profile";

const copy = {
  ja: { kicker: "学歴", note: "入学・編入・進学の年" },
  en: { kicker: null, note: "Year of entry" },
} satisfies Record<Language, { kicker: string | null; note: string }>;

export function EducationSection({ language }: { language: Language }) {
  const text = copy[language];

  return (
    <section
      className="section education"
      id="education"
      aria-labelledby="education-title"
    >
      <div className="wrap">
        <header className="section-head">
          <h2
            className="section-title"
            id="education-title"
            data-reveal="rise"
          >
            <span data-shift="0.06">Education</span>
          </h2>
          <div className="section-aside" data-reveal="">
            {text.kicker && (
              <p className="section-kicker" lang="ja">
                {text.kicker}
              </p>
            )}
            <p className="section-note">{text.note}</p>
          </div>
        </header>

        <ol className="schools">
          {education.map((item) => {
            const school = item[language];
            return (
              <li
                className="school"
                id={item.id}
                key={item.id}
                data-year={item.year}
                data-reveal=""
              >
                <time className="school-year" dateTime={item.year}>
                  {[...item.year].map((digit, index) => (
                    <span
                      key={index}
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      {digit}
                    </span>
                  ))}
                </time>
                <div className="school-body">
                  <h3>{school.school}</h3>
                  <p>{school.course}</p>
                  <p className="school-degree">{school.degree}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
