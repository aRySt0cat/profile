import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete profile", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ja">/i);
  assert.match(html, /<title>下垣内 隆太 \| Ryuta Shimogauchi<\/title>/i);
  assert.match(html, /株式会社Elith 取締役CAIO/);
  assert.match(html, /東京大学大学院/);
  assert.match(html, /Activities/);
  assert.match(html, /作ってわかる大規模言語モデルの仕組み/);
  assert.match(html, /Non-Monotonicity and Catastrophic Risk/);
  assert.match(html, /AIエージェントは何に使うべきか/);
  assert.match(html, /LANGUAGE/);
  assert.match(html, />JA</);
  assert.match(html, />EN</);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(
    html,
    /codex-preview|Your site is taking shape|react-loading-skeleton/i,
  );
  assert.doesNotMatch(
    html,
    /知は、|Always becoming|Layers of understanding|Knowledge in circulation|SCROLL TO EVOLVE|archive-section/,
  );
  const data = await readFile(
    new URL("../src/data/activities.ts", import.meta.url),
    "utf8",
  );
  const activityIds = [...data.matchAll(/id: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  const works = html.match(
    /<section[^>]*id="activities"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(works, "Activities has its own section");
  for (const id of activityIds)
    assert.ok(works.includes(`id="${id}"`), `activity entry: ${id}`);
  assert.equal(
    (works.match(/class="work work-/g) ?? []).length,
    activityIds.length,
  );
  for (const label of ["すべて", "書籍", "論文", "登壇"])
    assert.match(works, new RegExp(`aria-pressed="(true|false)"[^>]*>${label}`));

  const schools = html.match(
    /<section[^>]*id="education"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(schools, "Education has its own section");
  for (const year of ["2020", "2017", "2012"])
    assert.ok(schools.includes(`data-year="${year}"`), `education ${year}`);

  // Every entry is readable without scripts; motion only hides content once
  // the bootstrap script has marked the document.
  assert.match(html, /classList\.add\("js"\)/);
  assert.doesNotMatch(html, /<html[^>]*class="[^"]*\bjs\b/);
  assert.doesNotMatch(html, /sculpture|open-book/);
});

test("keeps activity content data-driven", async () => {
  const [page, data, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/activities.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<ActivitySection/);
  assert.match(page, /useSyncExternalStore/);
  assert.match(page, /profile-language/);
  assert.match(data, /type: "book"/);
  assert.match(data, /type: "paper"/);
  assert.match(data, /type: "talk"/);
  assert.match(data, /sort_date/);
  assert.match(data, /title_en/);
  assert.match(data, /authors_en/);
  assert.match(data, /display_date_en/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
