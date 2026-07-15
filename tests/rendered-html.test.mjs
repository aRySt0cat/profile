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
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps activity content data-driven", async () => {
  const [page, data, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/data/activities.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<ActivityList \/>/);
  assert.match(data, /type: "book"/);
  assert.match(data, /type: "paper"/);
  assert.match(data, /type: "talk"/);
  assert.match(data, /sort_date/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
