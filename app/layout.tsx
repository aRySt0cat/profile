import type { Metadata, Viewport } from "next";
import "./globals.css";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "下垣内 隆太",
  alternateName: "Ryuta Shimogauchi",
  jobTitle: "取締役CAIO",
  worksFor: {
    "@type": "Organization",
    name: "株式会社Elith",
    url: "https://www.elith.ai/",
  },
  sameAs: [
    "https://github.com/aRySt0cat",
    "https://x.com/eta1ia",
    "https://www.linkedin.com/in/ryuta-shimogauchi/",
    "https://www.instagram.com/et_a11a/",
    "https://www.youtube.com/@elithofficial",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aryst0cat.github.io/profile/"),
  title: "下垣内 隆太 | Ryuta Shimogauchi",
  description:
    "株式会社Elith 取締役CAIO、下垣内隆太の公式プロフィール。学歴、書籍、研究論文、登壇実績を日本語と英語で掲載しています。",
  authors: [{ name: "Ryuta Shimogauchi" }],
  alternates: {
    canonical: "https://aryst0cat.github.io/profile/",
    languages: {
      "ja-JP": "https://aryst0cat.github.io/profile/",
      "en-US": "https://aryst0cat.github.io/profile/?lang=en",
    },
  },
  icons: {
    icon: "/profile/assets/profile.webp",
    shortcut: "/profile/assets/profile.webp",
  },
  openGraph: {
    type: "profile",
    locale: "ja_JP",
    alternateLocale: ["en_US"],
    url: "https://aryst0cat.github.io/profile/",
    title: "下垣内 隆太 | Ryuta Shimogauchi",
    description: "株式会社Elith 取締役CAIO、下垣内隆太のプロフィールと活動実績。",
    siteName: "Ryuta Shimogauchi",
    images: [
      {
        url: "https://aryst0cat.github.io/profile/assets/profile.webp",
        width: 1024,
        height: 1024,
        alt: "Ryuta Shimogauchi",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "下垣内 隆太 | Ryuta Shimogauchi",
    description: "株式会社Elith 取締役CAIO、下垣内隆太のプロフィールと活動実績。",
    images: ["https://aryst0cat.github.io/profile/assets/profile.webp"],
  },
};

const fontStylesheet =
  "https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,300..500&family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap";

// Marks the document as scripted before first paint so reveal effects can
// start hidden. If the page's scripts never start, content is shown anyway.
const motionBootstrap = `document.documentElement.classList.add("js");setTimeout(function(){if(!document.documentElement.dataset.motion)document.documentElement.classList.remove("js")},2500);`;

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="stylesheet" href={fontStylesheet} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
