import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages export uses the repository base path", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /下垣内 隆太/);
  assert.match(html, /LANGUAGE/);
  assert.match(html, />EN</);
  assert.match(html, /\/profile\/_next\//);
  assert.match(html, /\/profile\/assets\/profile\.webp/);
  assert.match(html, /\/profile\/assets\/books\/llm-agent\.webp/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("exports the portrait and book covers it links to", async () => {
  for (const asset of [
    "assets/profile.webp",
    "assets/books/llm-agent.webp",
    "assets/books/llm-from-scratch.webp",
  ]) {
    const image = await readFile(new URL(`../out/${asset}`, import.meta.url));
    assert.equal(image.toString("ascii", 8, 12), "WEBP", asset);
  }
});

test("exports each talk page with its built deck", async () => {
  const page = await readFile(
    new URL("../out/talks/ml15min-116/index.html", import.meta.url),
    "utf8",
  );
  assert.match(page, /人生の操作権限をAIに渡してみた/);
  assert.match(page, /href="\/profile\/#talk-ml15min-116-2026"/);

  const deck = await readFile(
    new URL("../out/slides/ml15min-116/index.html", import.meta.url),
    "utf8",
  );
  // Assets resolve relative to the deck, whatever path it is served from.
  assert.match(deck, /src="\.\/assets\//);
  const manifest = JSON.parse(
    await readFile(
      new URL("../out/slides/ml15min-116/deck.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.pages.length > 0, true);
  assert.equal(manifest.pages[0].no, 1);
});
