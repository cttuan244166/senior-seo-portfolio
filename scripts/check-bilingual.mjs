import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const runtime = 'C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(`${runtime}/playwright`);
const sharp = require(`${runtime}/sharp`);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = { coverage: {}, viewports: [], interactions: [], demoImages: [], errors: [] };
const getLayout = () => {
  const headings = [...document.querySelectorAll('h1,h2,h3,.hero-agenda a,.language-switch a')].filter(el => el.getBoundingClientRect().height);
  const horizontalOverflow = headings.filter(el => el.scrollWidth > el.clientWidth + 2).map(el => el.textContent.trim());
  const header = [...document.querySelectorAll('.site-header > :not(.nav-links)')].map(el => ({ text: el.textContent.trim(), rect: el.getBoundingClientRect().toJSON() }));
  return { overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), horizontalOverflow, header };
};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => report.errors.push(error.message));
  const sources = await Promise.all(['index.html', 'en/index.html'].map(name => readFile(path.join(root, name), 'utf8')));
  const coverage = await page.evaluate((documents) => documents.map(source => {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const text = doc.body.textContent;
    return {
      structure: [...doc.querySelectorAll('*')].map(el => el.tagName),
      numbers: text.match(/\d+(?:[.,]\d+)*/g),
      charts: [...doc.querySelectorAll('.line-chart,.multi-line-chart')].map(el => ({ id: el.closest('article').id, values: el.dataset.values, series: el.dataset.series, labels: el.dataset.labels })),
      counters: [...doc.querySelectorAll('[data-counter]')].map(el => [el.dataset.value, el.dataset.prefix, el.dataset.suffix]),
      experience: doc.querySelectorAll('.experience-panel').length,
      galleries: [...doc.querySelectorAll('[data-gallery]')].map(el => el.querySelectorAll('.workflow-thumbnail').length)
    };
  }), sources);
  assert.deepEqual(coverage[0], coverage[1], 'English must preserve all structure, numeric content and chart data');
  report.coverage = { identicalStructure: true, identicalNumbersAndDates: true, identicalChartData: true, experience: coverage[1].experience, galleries: coverage[1].galleries };

  for (const lang of ['vi', 'en']) {
    const url = lang === 'en' ? `${base}/en/` : `${base}/`;
    for (const [width, height] of [[1440, 1000], [1024, 768], [820, 1180], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(getLayout);
      report.viewports.push({ lang, width, height, ...layout });
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(root, 'qa', `${lang}-${width}-hero.png`) });
      assert.equal(layout.overflow, 0, `${lang} page overflows at ${width}px`);
      assert.equal(layout.horizontalOverflow.length, 0, `${lang} headings overflow at ${width}px: ${layout.horizontalOverflow.join('; ')}`);
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/en/#workflow-tools-automation`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  for (let index = 0; index < 4; index++) {
    await page.locator('[role="tab"]').nth(index).click();
    assert.equal(await page.locator('.experience-panel:not([hidden]).is-active').count(), 1);
  }
  report.interactions.push('All 4 experience tabs work.');
  const galleries = page.locator('[data-gallery]');
  for (let index = 0; index < 3; index++) {
    const gallery = galleries.nth(index);
    const thumbnails = gallery.locator('.workflow-thumbnail');
    const total = await thumbnails.count();
    for (let step = 0; step < total; step++) {
      await thumbnails.nth(step).click();
      await gallery.locator('.workflow-main-image').evaluate(async (img) => { if (!img.complete) await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }); });
      assert.match(await gallery.locator('.workflow-caption-step').textContent(), new RegExp(`STEP ${String(step + 1).padStart(2, '0')}`));
      assert.equal(await gallery.locator('.workflow-main-image').evaluate(img => img.naturalWidth), 1600);
    }
    await gallery.locator('[data-gallery-next]').click();
    assert.match(await gallery.locator('.workflow-caption-step').textContent(), /STEP 01/);
    await gallery.locator('[data-gallery-prev]').click();
    assert.match(await gallery.locator('.workflow-caption-step').textContent(), new RegExp(`STEP ${String(total).padStart(2, '0')}`));
  }
  report.interactions.push('All 16 English images load; thumbnails and previous/next wrap correctly.');
  await page.locator('[data-gallery]').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(root, 'qa', 'en-workflow-desktop.png') });

  await page.goto(`${base}/en/#case-studies`, { waitUntil: 'networkidle' });
  await page.locator('.language-switch [lang="vi"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'vi');
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(new URL(page.url()).hash, '#case-studies');
  await page.locator('.language-switch [lang="en"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(new URL(page.url()).pathname, '/en/');
  assert.equal(new URL(page.url()).hash, '#case-studies');
  report.interactions.push('VI/EN switching retains the current section.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/en/#top`, { waitUntil: 'networkidle' });
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.locator('.nav-links a[href="#process"]').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
  report.interactions.push('Mobile navigation opens, navigates and closes.');
  await page.locator('[data-gallery]').first().scrollIntoViewIfNeeded();
  await page.locator('.workflow-main-image').first().evaluate(async (img) => { if (!img.complete) await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }); });
  await page.locator('.workflow-main-image:not(.is-changing)').first().waitFor();
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(root, 'qa', 'en-workflow-mobile.png') });

  const urls = await page.evaluate(() => [...new Set([...document.querySelectorAll('img[src],link[rel="stylesheet"],script[src], [data-src]')].map(el => new URL(el.getAttribute('src') || el.getAttribute('href') || el.dataset.src, location.href).href))]);
  for (const url of urls.filter(url => url.startsWith(base))) {
    const response = await page.request.get(url);
    assert.equal(response.status(), 200, `Asset missing: ${url}`);
  }
  report.interactions.push('All referenced local assets return HTTP 200.');

  const motionPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  motionPage.on('pageerror', error => report.errors.push(error.message));
  await motionPage.goto(`${base}/en/#case-avakids`, { waitUntil: 'networkidle' });
  await motionPage.locator('#case-avakids .line-chart').scrollIntoViewIfNeeded();
  await motionPage.waitForTimeout(1000);
  await motionPage.locator('#case-avakids .line-chart').hover({ position: { x: 120, y: 130 } });
  await motionPage.waitForTimeout(100);
  assert.equal(await motionPage.locator('.chart-tooltip.is-visible').count(), 1);
  assert.match(await motionPage.locator('.chart-tooltip').textContent(), /Organic Sessions/);
  assert.equal(await motionPage.locator('.spotlight-card').count(), 14);
  assert.equal(await motionPage.locator('.tilt-card').count(), 9);
  const tiltStyle = await motionPage.locator('#case-avakids').getAttribute('style');
  assert.match(tiltStyle, /rotateX/);
  await motionPage.goto(`${base}/en/#workflow`, { waitUntil: 'networkidle' });
  await motionPage.locator('.workflow').scrollIntoViewIfNeeded();
  await motionPage.waitForTimeout(1000);
  await motionPage.mouse.move(0, 0);
  const stepBefore = await motionPage.locator('.workflow-step.is-current h3').textContent();
  await motionPage.waitForTimeout(3300);
  const stepAfter = await motionPage.locator('.workflow-step.is-current h3').textContent();
  if (stepBefore === stepAfter) console.log(await motionPage.locator('.workflow').evaluate(el => ({ rect: el.getBoundingClientRect().toJSON(), hover: el.matches(':hover'), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches })));
  assert.notEqual(stepBefore, stepAfter);
  report.interactions.push('English chart tooltip, spotlight, tilt and current 3-second workflow timer work.');
  await motionPage.close();

  const groups = [
    ['rank-checker', 'rank-checker-screens.html', ['01-sheet-dau-vao', '02-chay-test-console', '03-chrome-mobile-serp', '04-sheet-ket-qua', '05-captcha-resume'], '.grid td, .sheet-tab span, .mobile-search, .serp-row, .terminal-body, .btab, .doc-name, .address .url'],
    ['avakids-infobox-v6', 'infobox-screens.html', ['01-sheet-webhook', '02-research-cache', '03-write-article', '04-qc-repair', '05-output-sheet'], '.sgrid td, .json, .safe-preview strong, .safe-preview p, .safe-preview .preview-h'],
    ['seo-content-app', 'app-screens.html', ['01-project-context', '02-keyword-workspace', '03-serp-evidence', '04-intent-gaps', '05-outline-review', '06-article-editor'], '.input, .query, .source b, .article-preview, .outline-left b, .intent-card h2, .intent-card p']
  ];
  for (const [folder, file, names, preserve] of groups) {
    for (let index = 0; index < names.length; index++) {
      const captured = [];
      for (const prefix of ['', 'en/']) {
        await page.goto(`${pathToFileURL(path.join(root, prefix, 'workflow', folder, file)).href}?screen=${index + 1}`);
        captured.push(await page.locator('.scene.active').locator(preserve).allTextContents());
      }
      assert.deepEqual(captured[0], captured[1], `Demo data changed in ${folder}/${names[index]}`);
      const metadata = await sharp(path.join(root, 'en', 'workflow', folder, `${names[index]}.webp`)).metadata();
      assert.equal(metadata.width, 1600);
      assert.equal(metadata.height, 900);
      report.demoImages.push({ file: `${folder}/${names[index]}.webp`, width: metadata.width, height: metadata.height, originalDemoDataPreserved: true });
    }
  }
  assert.equal(report.errors.length, 0, 'Unexpected JavaScript errors');
  await writeFile(path.join(root, 'qa', 'bilingual-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ coverage: report.coverage, responsiveChecks: report.viewports.length, demoImages: report.demoImages.length, interactions: report.interactions, errors: report.errors }, null, 2));
} finally {
  await browser.close();
}
