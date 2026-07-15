import { ActivityList } from "./components/ActivityList";
import { AmbientField } from "./components/AmbientField";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/aRySt0cat" },
  { label: "X", href: "https://x.com/eta1ia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ryuta-shimogauchi/" },
  { label: "Instagram", href: "https://www.instagram.com/et_a11a/" },
  { label: "YouTube — Elith Official", href: "https://www.youtube.com/@elithofficial" },
];

const education = [
  {
    year: "2020",
    school: "東京大学大学院",
    course: "情報理工学系研究科 電子情報学専攻",
    degree: "修士",
  },
  {
    year: "2017",
    school: "東京大学",
    course: "工学部 電子情報工学科",
    degree: "学士",
  },
  {
    year: "2012",
    school: "神戸市立工業高等専門学校",
    course: "電子工学科",
    degree: "準学士",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>
      <AmbientField />

      <header className="site-header">
        <a className="site-mark" href="#top" aria-label="ページ上部へ">
          <span>RS</span>
          <span>35.6812° N</span>
        </a>
        <nav aria-label="メインナビゲーション">
          <a href="#profile">Profile</a>
          <a href="#education">Education</a>
          <a href="#activities">Activities</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="profile-name">
          <div className="hero-orbit" aria-hidden="true">
            <span>01</span>
            <span>PROFILE</span>
          </div>

          <div className="hero-copy" id="profile">
            <p className="eyebrow">Board Director &amp; CAIO, Elith Inc.</p>
            <h1 id="profile-name">
              <span className="name-ja">下垣内 隆太</span>
              <span className="name-en">Ryuta Shimogauchi</span>
            </h1>
            <p className="role">株式会社Elith 取締役CAIO</p>

            <ul className="social-links" aria-label="公開アカウント">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <figure className="portrait-frame">
            <div className="portrait-layer" aria-hidden="true" />
            <img
              src={`${basePath}/assets/profile.webp`}
              alt="プロフィール画像"
              width="1024"
              height="1024"
              decoding="async"
              fetchPriority="high"
            />
            <figcaption>
              <span>PROFILE IMAGE</span>
              <span>01 / 03</span>
            </figcaption>
          </figure>

          <a className="scroll-cue" href="#education">
            <span>Scroll to explore</span>
            <span className="scroll-line" aria-hidden="true" />
          </a>
        </section>

        <section className="education-section" id="education" aria-labelledby="education-title">
          <div className="section-heading education-heading">
            <p className="section-index">02 / EDUCATION</p>
            <h2 id="education-title">Education</h2>
            <p className="section-note">Academic background</p>
          </div>

          <ol className="education-list">
            {education.map((item) => (
              <li key={item.year}>
                <time>{item.year}</time>
                <div>
                  <h3>{item.school}</h3>
                  <p>{item.course}</p>
                </div>
                <p className="degree">{item.degree}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="activities-section" id="activities" aria-labelledby="activities-title">
          <div className="section-heading activities-heading">
            <p className="section-index">03 / ACTIVITIES</p>
            <h2 id="activities-title">Activities</h2>
            <p className="section-note">出版・研究・登壇を新しい順に掲載</p>
          </div>
          <ActivityList />
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Ryuta Shimogauchi</p>
        <a href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>

    </>
  );
}
