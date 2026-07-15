import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages export uses the repository base path", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /下垣内 隆太/);
  assert.match(html, /LANGUAGE/);
  assert.match(html, />EN</);
  assert.match(html, /\/profile\/_next\//);
  assert.match(html, /\/profile\/assets\/profile\.webp/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});
