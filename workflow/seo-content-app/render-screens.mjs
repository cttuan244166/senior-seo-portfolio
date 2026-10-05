import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const folder = path.dirname(fileURLToPath(import.meta.url));
const names = ['01-project-context', '02-keyword-workspace', '03-serp-evidence', '04-intent-gaps', '05-outline-review', '06-article-editor'];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => console.error(error.message));
  for (let i = 1; i <= names.length; i++) {
    const url = new URL(pathToFileURL(path.join(folder, 'app-screens.html')));
    url.searchParams.set('screen', String(i));
    await page.goto(url.href);
    const png = path.join(folder, `${names[i - 1]}.png`);
    await page.screenshot({ path: png });
    await sharp(png).webp({ quality: 88 }).toFile(path.join(folder, `${names[i - 1]}.webp`));
  }
} finally {
  await browser.close();
}
