import type { Language } from "../../src/data/activities";
import { socialLinks } from "../../src/data/profile";

const copy = {
  ja: { kicker: "公開アカウント", backToTop: "ページ上部へ" },
  en: { kicker: "Public profiles", backToTop: "Back to top" },
} satisfies Record<Language, Record<string, string>>;

export function SiteFooter({ language }: { language: Language }) {
  const text = copy[language];

  return (
    <footer className="site-footer" aria-labelledby="links-title">
      <div className="wrap">
        <header className="section-head">
          <h2 className="section-title" id="links-title" data-reveal="rise">
            <span data-shift="-0.05">Links</span>
          </h2>
          <div className="section-aside" data-reveal="">
            <p
              className={language === "ja" ? "section-kicker" : "section-note"}
            >
              {text.kicker}
            </p>
          </div>
        </header>

        <ul className="footer-links">
          {socialLinks.map((link) => (
            <li key={link.label} data-reveal="">
              <a href={link.href} target="_blank" rel="noreferrer noopener">
                <span className="footer-link-label">{link.label}</span>
                <span className="footer-link-host" aria-hidden="true">
                  {new URL(link.href).host.replace(/^www\./, "")}
                </span>
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="colophon">
          <span>© 2026 Ryuta Shimogauchi</span>
          <a className="quiet-link" href="#profile">
            <span>{text.backToTop}</span>
            <span className="arrow arrow-up" aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
