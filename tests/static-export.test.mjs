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
  assert.match(html, /\/profile\/assets\/sculpture\/open-book-preview\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("exports a self-contained sculpture and its still fallback", async () => {
  const glb = await readFile(
    new URL("../out/assets/sculpture/open-book.glb", import.meta.url),
  );
  const png = await readFile(
    new URL("../out/assets/sculpture/open-book-preview.png", import.meta.url),
  );
  assert.equal(glb.toString("ascii", 0, 4), "glTF");
  assert.equal(glb.readUInt32LE(4), 2);
  assert.equal(glb.readUInt32LE(8), glb.length);
  const jsonLength = glb.readUInt32LE(12);
  const model = JSON.parse(glb.toString("utf8", 20, 20 + jsonLength));
  for (const name of [
    "WhiteBook",
    "LeftWritingPage",
    "RightWritingPage",
    "TurningLeaf",
    "LeftCover",
    "RightCover",
  ])
    assert.ok(
      model.nodes.some((node) => node.name === name),
      name,
    );
  assert.ok(model.buffers.every((buffer) => !buffer.uri));
  assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
});
