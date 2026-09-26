/**
 * Builds every Slidev deck attached to a talk in src/data/activities.ts into
 * public/slides/<slug>/, where the talk page at /talks/<slug>/ embeds it.
 *
 *   npm run slides              build every deck
 *   npm run slides -- <slug>    build one deck
 *
 * Each deck is fetched at the commit pinned in its `deck.ref`, so the site
 * always publishes a known version. Private repositories are read with the
 * token in SLIDES_REPO_TOKEN when it is set (CI), and with the local git
 * credentials otherwise.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { activities } from "../src/data/activities.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = join(root, ".slides-cache");
const outputRoot = join(root, "public", "slides");
const only = process.argv.slice(2);

const talks = activities.filter(
  (activity) => activity.deck && (!only.length || only.includes(activity.deck.slug)),
);
if (only.length && talks.length !== only.length)
  fail(`Unknown deck slug in: ${only.join(", ")}`);
if (!talks.length) {
  console.log("No decks to build.");
  process.exit(0);
}

for (const talk of talks) await buildDeck(talk);

async function buildDeck(talk) {
  const { slug, repo, ref, entry = "slides.md", notes = false } = talk.deck;
  const source = join(cacheRoot, slug);
  const output = join(outputRoot, slug);
  console.log(`\n▸ ${slug}  ${repo}@${ref.slice(0, 7)}`);

  checkout(source, repo, ref);
  install(source);

  const pkg = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
  // Decks may generate assets before building (QR codes, for example).
  if (pkg.scripts?.prebuild) run(packageManager(source), ["run", "prebuild"], source);

  rmSync(output, { recursive: true, force: true });
  run(
    join(source, "node_modules", ".bin", "slidev"),
    [
      "build",
      entry,
      // A relative base lets one build work under /slides/ locally and
      // /profile/slides/ on GitHub Pages; hash routing keeps deep links
      // working on a static host.
      "--base",
      "./",
      "--router-mode",
      "hash",
      "--out",
      output,
      ...(notes ? [] : ["--without-notes"]),
    ],
    source,
  );

  // Redirect files for other hosts do nothing inside a subdirectory.
  for (const file of ["_redirects", "404.html"])
    rmSync(join(output, file), { force: true });
  const rewritten = relativizePublicPaths(source, output);
  const manifest = await writeManifest(source, entry, output, talk);
  console.log(
    `  ${manifest.pages.length} slides → public/slides/${slug}/ (${rewritten} files adjusted)`,
  );
}

function checkout(source, repo, ref) {
  mkdirSync(source, { recursive: true });
  if (!existsSync(join(source, ".git"))) {
    git(source, ["init", "--quiet"]);
    git(source, ["remote", "add", "origin", `https://github.com/${repo}.git`]);
  }
  git(source, ["fetch", "--quiet", "--depth", "1", "origin", ref], true);
  git(source, ["checkout", "--quiet", "--force", "FETCH_HEAD"]);
  // Start from a clean tree, but keep installed dependencies.
  git(source, ["clean", "-ffdx", "--quiet", "-e", "node_modules"]);
}

function git(cwd, args, remote = false) {
  const token = process.env.SLIDES_REPO_TOKEN;
  const auth =
    remote && token
      ? [
          "-c",
          `http.https://github.com/.extraheader=AUTHORIZATION: basic ${Buffer.from(
            `x-access-token:${token}`,
          ).toString("base64")}`,
        ]
      : [];
  const result = spawnSync("git", [...auth, ...args], {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_LFS_SKIP_SMUDGE: "1" },
  });
  if (result.status !== 0)
    fail(
      remote
        ? `Could not fetch the deck. For a private repository, set SLIDES_REPO_TOKEN to a token that can read it.`
        : `git ${args[0]} failed`,
    );
}

function packageManager(source) {
  if (existsSync(join(source, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(source, "yarn.lock"))) return "yarn";
  return "npm";
}

function install(source) {
  const manager = packageManager(source);
  const lockfile = {
    npm: "package-lock.json",
    pnpm: "pnpm-lock.yaml",
    yarn: "yarn.lock",
  }[manager];
  const lock = join(source, lockfile);
  const hash = existsSync(lock)
    ? createHash("sha256").update(readFileSync(lock)).digest("hex")
    : "none";
  const marker = join(source, "node_modules", ".profile-install");
  if (existsSync(marker) && readFileSync(marker, "utf8") === hash) return;
  const args = {
    npm: existsSync(lock) ? ["ci", "--no-audit", "--no-fund"] : ["install"],
    pnpm: ["install", "--frozen-lockfile"],
    yarn: ["install", "--frozen-lockfile"],
  }[manager];
  run(manager, args, source);
  writeFileSync(marker, hash);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      // Export tooling is not needed to build the web version.
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
      PUPPETEER_SKIP_DOWNLOAD: "1",
    },
  });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed`);
}

/**
 * Decks usually reference their public folder with absolute paths
 * (`/images/cover.png`), which would point at the site root once the deck
 * lives in a subdirectory. Rewrite exactly those references to be relative
 * to the deck, leaving every other string alone.
 */
function relativizePublicPaths(source, output) {
  const publicDir = join(source, "public");
  if (!existsSync(publicDir)) return 0;
  const names = readdirSync(publicDir)
    .filter((name) => !name.startsWith("."))
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!names.length) return 0;
  const target = `(${names.join("|")})(?=[/"'\`?#)\\s])`;
  const inScript = new RegExp(`(["'\`])/${target}`, "g");
  const inCss = new RegExp(`(url\\(\\s*["']?)/${target}`, "g");

  let changed = 0;
  for (const file of walk(output)) {
    const isCss = file.endsWith(".css");
    if (!isCss && !/\.(m?js|html)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    const prefix = isCss
      ? `${relative(dirname(file), output).split(sep).join("/") || "."}/`
      : "./";
    const next = text
      .replace(inScript, (_, quote, name) => `${quote}${prefix}${name}`)
      .replace(inCss, (_, open, name) => `${open}${prefix}${name}`);
    if (next !== text) {
      writeFileSync(file, next);
      changed += 1;
    }
  }
  return changed;
}

function* walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** Slide titles and count, so the talk page can show an index and progress. */
async function writeManifest(source, entry, output, talk) {
  const parser = join(source, "node_modules", "@slidev", "parser", "dist", "fs.mjs");
  const { load } = await import(pathToFileURL(parser).href);
  const data = await load(source, join(source, entry));
  const manifest = {
    slug: talk.deck.slug,
    repo: talk.deck.repo,
    ref: talk.deck.ref,
    aspectRatio: aspectRatio(data.headmatter?.aspectRatio),
    pages: data.slides
      .filter((slide) => !slide.frontmatter?.hide && !slide.frontmatter?.disabled)
      .map((slide, index) => ({
        no: index + 1,
        title: String(slide.title ?? slide.frontmatter?.title ?? "").trim(),
      })),
  };
  writeFileSync(join(output, "deck.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** Slidev accepts "16/9", "16:9" or a number; the page wants a number. */
function aspectRatio(value) {
  if (typeof value === "number" && value > 0) return value;
  const match = /^\s*([\d.]+)\s*[/:]\s*([\d.]+)\s*$/.exec(String(value ?? ""));
  return match ? Number(match[1]) / Number(match[2]) : 16 / 9;
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}
