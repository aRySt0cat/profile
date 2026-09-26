import assert from "node:assert/strict";
import test from "node:test";
import {
  activityLinks,
  activityYear,
  filterForHash,
  filteredActivities,
  filterOptions,
  formatDate,
  localized,
  primaryLink,
  talkPath,
} from "../app/lib/activity.ts";
import { activities } from "../src/data/activities.ts";

test("every filter keeps each activity exactly once", () => {
  const grouped = ["book", "paper", "talk"].map((filter) =>
    filteredActivities(activities, filter),
  );
  assert.equal(
    grouped.reduce((total, items) => total + items.length, 0),
    activities.length,
  );
  assert.deepEqual(
    new Set(grouped.flat().map((item) => item.id)),
    new Set(activities.map((item) => item.id)),
  );
  assert.deepEqual(filteredActivities(activities, "all"), activities);
});

test("activities are listed newest first", () => {
  for (let index = 1; index < activities.length; index++)
    assert.ok(
      activities[index - 1].sort_date >= activities[index].sort_date,
      `${activities[index - 1].id} before ${activities[index].id}`,
    );
});

test("dates never claim more precision than the editor gave", () => {
  const byId = Object.fromEntries(activities.map((item) => [item.id, item]));
  assert.equal(formatDate(byId["talk-ipros-ai-2026"]), "2026.07.29");
  assert.equal(formatDate(byId["talk-jdla-llm-2024"]), "2024.12");
  // Sorted by month, but published as a year only.
  assert.equal(formatDate(byId["paper-dynamic-knowledge-jsai-2025"]), "2025");
  for (const item of activities)
    assert.ok(formatDate(item).startsWith(activityYear(item)), item.id);
});

test("legacy filter hashes still select a filter", () => {
  assert.deepEqual(
    filterOptions.map((option) => filterForHash(option.hash)),
    ["all", "book", "paper", "talk"],
  );
  assert.equal(filterForHash("activities"), undefined);
});

test("every activity offers a working link and English copy", () => {
  for (const item of activities) {
    const links = activityLinks(item);
    assert.ok(links.length > 0, item.id);
    for (const link of links)
      assert.ok(
        link.internal
          ? link.href.startsWith("/talks/")
          : link.href.startsWith("https://"),
        `${item.id}: ${link.href}`,
      );
    const primary = primaryLink(item);
    if (primary)
      assert.ok(
        links.some((link) => link.href === primary.href),
        item.id,
      );
    assert.ok(localized(item, "en").title, item.id);
  }
});

test("talks with a deck link to their own page on this site", () => {
  const talks = activities.filter((item) => item.deck);
  assert.ok(talks.length > 0);
  const slugs = talks.map((item) => item.deck.slug);
  assert.equal(new Set(slugs).size, slugs.length, "deck slugs are unique");
  for (const talk of talks) {
    const { slug, repo, ref } = talk.deck;
    assert.match(slug, /^[a-z0-9][a-z0-9-]*$/, slug);
    assert.match(repo, /^[\w.-]+\/[\w.-]+$/, repo);
    // A full commit keeps every build of the site publishing the same deck.
    assert.match(ref, /^[0-9a-f]{40}$/, `${slug} ref`);
    assert.equal(talk.type, "talk");
    const slides = activityLinks(talk).find((link) => link.label === "Slides");
    assert.deepEqual(slides, {
      label: "Slides",
      href: talkPath(slug),
      internal: true,
    });
    assert.deepEqual(primaryLink(talk), slides);
  }
});
