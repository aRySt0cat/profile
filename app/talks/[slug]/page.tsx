import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activities } from "../../../src/data/activities";
import { TalkView } from "../../components/TalkView";

const talks = activities.filter((activity) => activity.deck);
const findTalk = (slug: string) =>
  talks.find((activity) => activity.deck?.slug === slug);

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return talks.map((activity) => ({ slug: activity.deck!.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const talk = findTalk((await params).slug);
  if (!talk) return {};
  const url = `https://aryst0cat.github.io/profile/talks/${talk.deck!.slug}/`;
  const title = `${talk.title} | 下垣内 隆太`;
  const description = [talk.subtitle, talk.event].filter(Boolean).join(" — ");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Ryuta Shimogauchi",
      images: ["https://aryst0cat.github.io/profile/assets/profile.webp"],
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function TalkPage({ params }: Props) {
  const talk = findTalk((await params).slug);
  if (!talk) notFound();
  return <TalkView activity={talk} />;
}
