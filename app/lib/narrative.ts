import type { Activity, ActivityType } from "../../src/data/activities";

export type ActivityFilter = "all" | ActivityType;
export const ACTIVITIES_CONTENTS = 2;
export const ACTIVITY_START = 3;
export const lastMoment = (count: number) => Math.max(0, count - 1) + 0.3;
export const filteredActivities = (
  items: Activity[],
  filter: ActivityFilter,
) => (filter === "all" ? items : items.filter((item) => item.type === filter));

export function timelineTime(
  scroll: number,
  start: number,
  distance: number,
  count: number,
) {
  return Math.max(
    0,
    Math.min(
      lastMoment(count),
      ((scroll - start) / Math.max(1, distance)) * lastMoment(count),
    ),
  );
}

export function chapterAt(time: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(time + 0.5)));
}

export function sceneOpacity(time: number, index: number, count: number) {
  if (index === count - 1 && time >= index) return 1;
  const value = Math.max(0, Math.min(1, (0.6 - Math.abs(time - index)) / 0.2));
  return value * value * (3 - 2 * value);
}

export function spreadForHash(hash: string, items: Activity[]) {
  if (hash === "top" || hash === "profile" || !hash) return 0;
  if (hash === "education") return 1;
  const index = items.findIndex((item) => item.id === hash);
  return index >= 0 ? index + ACTIVITY_START : ACTIVITIES_CONTENTS;
}
