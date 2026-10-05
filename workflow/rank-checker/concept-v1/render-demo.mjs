import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const folder = path.dirname(fileURLToPath(import.meta.url));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const names = ['01-tong-quan', '02-van-hanh', '03-logic-do-rank', '04-checkpoint-ket-qua'];
const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  for (let i = 1; i <= 4; i++) {
    const url = new URL(pathToFileURL(path.join(folder, 'rank-checker-demo.html')));
    url.searchParams.set('slide', String(i));
    await page.goto(url.href);
    await page.screenshot({ path: path.join(folder, `${names[i - 1]}.png`) });
    await sharp(path.join(folder, `${names[i - 1]}.png`)).webp({ quality: 88 }).toFile(path.join(folder, `${names[i - 1]}.webp`));
  }
} finally {
  await browser.close();
}
