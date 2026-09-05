import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVITY_START,
  ACTIVITIES_CONTENTS,
  chapterAt,
  sceneOpacity,
  timelineTime,
  lastMoment,
  filteredActivities,
  spreadForHash,
} from "../app/lib/narrative.ts";
import { activities } from "../src/data/activities.ts";

test("all and filtered timelines retain every activity exactly once", () => {
  const grouped = ["book", "paper", "talk"].map((filter) =>
    filteredActivities(activities, filter),
  );
  assert.equal(grouped.reduce((total, items) => total + items.length, 0), activities.length);
  assert.deepEqual(
    new Set(grouped.flat().map((item) => item.id)),
    new Set(activities.map((item) => item.id)),
  );
  assert.deepEqual(filteredActivities(activities, "all"), activities);
});

test("timelines clamp overscroll and chapter selection for each filter", () => {
  for (const count of [ACTIVITY_START, ...["all", "book", "paper", "talk"].map((filter) => filteredActivities(activities, filter).length + ACTIVITY_START)]) {
    assert.equal(timelineTime(-100, 0, 5000, count), 0);
    assert.equal(timelineTime(9000, 0, 5000, count), lastMoment(count));
    assert.ok(Number.isFinite(timelineTime(0, 0, 0, count)));
    assert.equal(chapterAt(-5, count), 0);
    assert.equal(chapterAt(100, count), count - 1);
    for (let target = 0; target < count; target++) {
      const scroll = 100 + (target / lastMoment(count)) * 5000;
      const t = timelineTime(scroll, 100, 5000, count);
      assert.equal(chapterAt(t, count), target);
      for (let index = 0; index < count; index++)
        assert.equal(sceneOpacity(t, index, count), index === target ? 1 : 0);
    }
  }
});

test("page turning is reversible and always exposes the active spread", () => {
  const count = activities.length + ACTIVITY_START;
  for (let i = 0; i <= Math.round(lastMoment(count) * 100); i++) {
    const t = i / 100;
    const opacity = sceneOpacity(t, chapterAt(t, count), count);
    assert.ok(opacity >= 0.49 && opacity <= 1);
    const scroll = (t / lastMoment(count)) * 5000;
    const back = timelineTime(scroll, 0, 5000, count);
    assert.ok(Math.abs(t - back) < 1e-10);
  }
});

test("legacy section and category links enter the integrated book", () => {
  assert.equal(spreadForHash("top", activities), 0);
  assert.equal(spreadForHash("profile", activities), 0);
  assert.equal(spreadForHash("education", activities), 1);
  for (const hash of ["activities", "works", "books", "papers", "talks", "all"])
    assert.equal(spreadForHash(hash, activities), 2);
  activities.forEach((item, index) =>
    assert.equal(spreadForHash(item.id, activities), index + ACTIVITY_START),
  );
});

test("filtered contents and detail links use the same page order", () => {
  for (const filter of ["all", "book", "paper", "talk"]) {
    const items = filteredActivities(activities, filter);
    const count = items.length + ACTIVITY_START;
    assert.equal(spreadForHash("activities", items), ACTIVITIES_CONTENTS);
    items.forEach((item, index) => {
      const destination = spreadForHash(item.id, items);
      assert.equal(destination, index + ACTIVITY_START);
      assert.ok(destination > ACTIVITIES_CONTENTS && destination < count);
      assert.equal(items[destination - ACTIVITY_START].id, item.id);
    });
  }
});
