import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = [];

try {
  for (const width of [1440, 390]) {
    for (const initial of ['vi', 'en']) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      let documentNavigations = 0;
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentNavigations++; });
      await page.goto(`${base}/${initial === 'en' ? 'en/' : ''}#top`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.locator('[role="tab"]').nth(2).click();
      await page.locator('.workflow-step').nth(4).click();
      for (let index = 0; index < 3; index++) {
        await page.locator('[data-gallery]').nth(index).locator('.workflow-thumbnail').nth(index + 2).click();
      }

      const reading = page.locator('[data-gallery]').nth(1).locator('.workflow-main-media');
      await reading.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const marker = document.querySelector('.site-header').getBoundingClientRect().bottom + 24;
        window.scrollTo({ top: scrollY + rect.top + rect.height * 0.3 - marker, behavior: 'instant' });
      });
      await page.waitForTimeout(100);
      const before = await reading.evaluate(el => ({ top: el.getBoundingClientRect().top, y: scrollY, timeOrigin: performance.timeOrigin }));
      await page.evaluate(() => { window.originalPortfolioBody = document.body; window.originalChart = document.querySelector('.line-chart'); });

      const opposite = initial === 'en' ? 'vi' : 'en';
      const positions = [];
      for (const language of [opposite, initial, opposite]) {
        await page.locator(`.language-switch [lang="${language}"]`).click();
        await page.waitForFunction(lang => document.documentElement.lang === lang, language);
        await page.waitForTimeout(100);
        const after = await reading.evaluate(el => ({ top: el.getBoundingClientRect().top, y: scrollY, timeOrigin: performance.timeOrigin }));
        const drift = Math.abs(after.top - before.top);
        assert.ok(drift <= 2, `${width}px ${initial}->${language}: reading position moved by ${drift}px`);
        assert.equal(after.timeOrigin, before.timeOrigin, 'A full document reload occurred');
        assert.equal(await page.evaluate(() => document.body === window.originalPortfolioBody && document.querySelector('.line-chart') === window.originalChart), true);
        assert.equal(new URL(page.url()).pathname, language === 'en' ? '/en/' : '/');
        assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), '2');
        assert.equal(await page.locator('.workflow-step.is-current').evaluate(el => [...el.parentNode.querySelectorAll('.workflow-step')].indexOf(el)), 4);
        for (let index = 0; index < 3; index++) {
          const gallery = page.locator('[data-gallery]').nth(index);
          assert.equal(await gallery.locator('.workflow-thumbnail.is-active').evaluate(el => [...el.parentNode.children].indexOf(el)), index + 2);
          assert.match(await gallery.locator('.workflow-caption-step').textContent(), language === 'en' ? /STEP/ : /BƯỚC/);
          const image = gallery.locator('.workflow-main-image');
          await image.evaluate(async img => { if (!img.complete) await new Promise(resolve => img.addEventListener('load', resolve, { once: true })); });
          assert.equal(await image.evaluate(img => img.naturalWidth), 1600);
          const imageUrl = await image.getAttribute('src');
          assert.equal(new URL(imageUrl).pathname.startsWith('/en/workflow/'), language === 'en');
        }
        positions.push({ language, drift, scrollY: after.y });
      }

      await page.goBack();
      await page.waitForFunction(lang => document.documentElement.lang === lang, initial);
      await page.waitForTimeout(100);
      assert.ok(Math.abs(await reading.evaluate(el => el.getBoundingClientRect().top) - before.top) <= 2);
      await page.goForward();
      await page.waitForFunction(lang => document.documentElement.lang === lang, opposite);
      await page.waitForTimeout(100);
      assert.ok(Math.abs(await reading.evaluate(el => el.getBoundingClientRect().top) - before.top) <= 2);
      assert.equal(documentNavigations, 1, 'Language buttons must not navigate the document');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(root, 'qa', `language-position-${width}-${initial}.png`) });
      report.push({ width, initial, positions, documentNavigations, historyPreservesPosition: true, selectionPreserved: true, errors });
      await page.close();
    }
  }

  const nested = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await nested.route(`${base}/senior-seo-portfolio/**`, async route => {
    const url = new URL(route.request().url());
    url.pathname = url.pathname.replace('/senior-seo-portfolio', '');
    const response = await route.fetch({ url: url.href });
    await route.fulfill({ response });
  });
  await nested.goto(`${base}/senior-seo-portfolio/#contact`, { waitUntil: 'networkidle' });
  await nested.locator('.language-switch [lang="en"]').click();
  await nested.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(new URL(nested.url()).pathname, '/senior-seo-portfolio/en/');
  assert.match(await nested.locator('.workflow-main-image').first().getAttribute('src'), /\/senior-seo-portfolio\/en\/workflow\//);
  await nested.locator('.language-switch [lang="vi"]').click();
  await nested.waitForFunction(() => document.documentElement.lang === 'vi');
  assert.equal(new URL(nested.url()).pathname, '/senior-seo-portfolio/');
  report.push({ githubProjectPath: true });
  await nested.close();

  const failure = await browser.newPage({ reducedMotion: 'reduce' });
  await failure.goto(`${base}/#career`, { waitUntil: 'networkidle' });
  const failureY = await failure.evaluate(() => scrollY);
  await failure.route(`${base}/en/`, route => route.abort());
  await failure.locator('.language-switch [lang="en"]').click();
  await failure.locator('.language-switch[data-error]').waitFor();
  assert.equal(await failure.locator('html').getAttribute('lang'), 'vi');
  assert.ok(Math.abs(await failure.evaluate(() => scrollY) - failureY) < 2);
  report.push({ networkFailureKeepsCurrentPage: true });
  await failure.close();

  await writeFile(path.join(root, 'qa', 'language-position-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
