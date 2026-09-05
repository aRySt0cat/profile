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
  for (const id of activityIds) assert.ok(html.includes(`id="${id}"`), id);
  const contents = html.match(
    /<section[^>]*id="activities"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(contents, "Activities has its own contents spread");
  assert.match(contents, /目次/);
  for (const id of activityIds)
    assert.ok(contents.includes(`href="#${id}"`), `contents link: ${id}`);
  assert.equal(
    (html.match(/class="contents-back"/g) ?? []).length,
    activityIds.length,
  );

  assert.equal(
    (html.match(/data-spread="/g) ?? []).length,
    activityIds.length + 3,
  );
});

test("keeps activity content data-driven", async () => {
  const [page, data, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/activities.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<ActivitySpread/);
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
