/**
 * Record a 3:2 scroll/interaction demo — EN + Obsidian.
 * Usage: node scripts/record-demo.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync, renameSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'demos');
const BASE = process.argv[2] || 'http://127.0.0.1:5175';
const W = 1500;
const H = 1000; // 3:2
const WEBM = join(OUT_DIR, 'meridian-en-obsidian-3x2.webm');
const MP4 = join(OUT_DIR, 'meridian-en-obsidian-3x2.mp4');

mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findFfmpeg() {
  const which = spawnSync('where.exe', ['ffmpeg'], { encoding: 'utf8' });
  if (which.status === 0) {
    const first = which.stdout.split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (first) return first;
  }
  return 'ffmpeg';
}

function encodeMp4AndCleanup(webmPath) {
  const ff = findFfmpeg();
  const enc = spawnSync(
    ff,
    [
      '-y',
      '-i',
      webmPath,
      '-vf',
      'fps=60,scale=1200:800:flags=lanczos',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '28',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      MP4,
    ],
    { encoding: 'utf8' },
  );
  if (enc.status !== 0) {
    console.error(enc.stderr || enc.stdout || 'ffmpeg failed');
    process.exit(1);
  }
  // Drop heavy intermediates / stray frames so they don't linger on disk
  for (const p of [webmPath, join(OUT_DIR, 'meridian-en-obsidian-3x2.prev.webm')]) {
    if (existsSync(p)) unlinkSync(p);
  }
  console.log(`OK ${MP4}`);
}

async function smoothScroll(page, toY, steps = 24) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i++) {
    const y = from + ((toY - from) * i) / steps;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(40);
  }
}

async function scrollBy(page, delta, steps = 18) {
  const from = await page.evaluate(() => window.scrollY);
  await smoothScroll(page, from + delta, steps);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    locale: 'en-US',
    recordVideo: { dir: OUT_DIR, size: { width: W, height: H } },
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('meridian-lang', 'en');
  });

  // —— HOME ——
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(800);

  // Force EN if switcher exists
  const enBtn = page.locator('[data-lang="en"]');
  if (await enBtn.count()) {
    await enBtn.first().click().catch(() => {});
    await sleep(400);
  }

  // Obsidian via surface menu / plate
  const surfaceBtn = page.locator('#btn-surface-menu');
  if (await surfaceBtn.count()) {
    await surfaceBtn.click();
    await sleep(350);
    await page.locator('[data-set-surface="obsidian"]').first().click();
    await sleep(600);
  } else {
    await page.locator('[data-set-surface="obsidian"]').first().click().catch(() => {});
    await sleep(500);
  }

  // Hero hold
  await sleep(900);
  await scrollBy(page, 700);
  await sleep(500);

  // Edition plates — click Obsidian again for emphasis
  const obsidianPlate = page.locator('.edition-plate[data-set-surface="obsidian"]');
  if (await obsidianPlate.count()) {
    await obsidianPlate.first().scrollIntoViewIfNeeded();
    await sleep(400);
    await obsidianPlate.first().click();
    await sleep(700);
  }

  // História essay ambient on home
  const histSec = page.locator('#historia');
  if (await histSec.count()) {
    await histSec.scrollIntoViewIfNeeded();
    await sleep(600);
    await scrollBy(page, 900, 28);
    await sleep(500);
    await scrollBy(page, 900, 28);
    await sleep(500);
  }

  // Motions / hold
  const hold = page.locator('#btn-hold-confirm');
  if (await hold.count()) {
    await hold.scrollIntoViewIfNeeded();
    await sleep(400);
    await hold.hover();
    await page.mouse.down();
    await sleep(900);
    await page.mouse.up();
    await sleep(500);
  }

  // Globe controls
  const globe = page.locator('#btn-globe-spin');
  if (await globe.count()) {
    await globe.scrollIntoViewIfNeeded();
    await sleep(400);
    await page.locator('#btn-globe-reset').click().catch(() => {});
    await sleep(400);
    await globe.click().catch(() => {});
    await sleep(800);
  }

  // Atelier
  const atelier = page.locator('#atelier');
  if (await atelier.count()) {
    await atelier.scrollIntoViewIfNeeded();
    await sleep(700);
    await page.locator('#btn-atelier-replay').click().catch(() => {});
    await sleep(1800);
    await page.locator('#btn-atelier-seed').click().catch(() => {});
    await sleep(1400);
  }

  // —— HISTÓRIA PAGE ——
  await page.goto(`${BASE}/historia.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(700);

  if (await enBtn.count()) {
    await page.locator('[data-lang="en"]').first().click().catch(() => {});
    await sleep(400);
  }

  const chromaObsidian = page.locator('[data-chroma="obsidian"]');
  if (await chromaObsidian.count()) {
    await chromaObsidian.first().click();
    await sleep(700);
  }

  // Scroll chapters to reveal plotter / ambient animations
  const maxY = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const stops = [0.12, 0.28, 0.45, 0.62, 0.78, 0.92].map((p) => Math.floor(maxY * p));
  for (const y of stops) {
    await smoothScroll(page, y, 22);
    await sleep(650);
  }

  // Rail chapter click if present
  const railLink = page.locator('.gann-rail a, .hist-rail a, [data-chapter]').first();
  if (await railLink.count()) {
    await railLink.click().catch(() => {});
    await sleep(1200);
  }

  await sleep(1000);

  const videoPath = await page.video()?.path();
  await page.close();
  await context.close();
  await browser.close();

  if (!videoPath) {
    console.error('No video path returned');
    process.exit(1);
  }

  if (existsSync(WEBM)) {
    try {
      renameSync(WEBM, join(OUT_DIR, 'meridian-en-obsidian-3x2.prev.webm'));
    } catch {}
  }
  renameSync(videoPath, WEBM);
  encodeMp4AndCleanup(WEBM);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
