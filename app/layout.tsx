import type { Metadata } from "next";
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
    "株式会社Elith 取締役CAIO、下垣内隆太の公式プロフィール。学歴、書籍、研究論文、登壇実績、公開アカウントを掲載しています。",
  authors: [{ name: "Ryuta Shimogauchi" }],
  icons: {
    icon: "/profile/assets/profile.webp",
    shortcut: "/profile/assets/profile.webp",
  },
  openGraph: {
    type: "profile",
    locale: "ja_JP",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
