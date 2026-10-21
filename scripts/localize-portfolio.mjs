import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const runtime = 'C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(`${runtime}/playwright`);
const sharp = require(`${runtime}/sharp`);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const groups = [
  { folder: 'rank-checker', source: 'rank-checker-screens.html', names: ['01-sheet-dau-vao', '02-chay-test-console', '03-chrome-mobile-serp', '04-sheet-ket-qua', '05-captcha-resume'], preserve: '.grid td, .sheet-tab span, .mobile-search, .serp-row, .terminal-body, .btab, .doc-name, .address .url' },
  { folder: 'avakids-infobox-v6', source: 'infobox-screens.html', names: ['01-sheet-webhook', '02-research-cache', '03-write-article', '04-qc-repair', '05-output-sheet'], preserve: '.sgrid td, .json, .safe-preview strong, .safe-preview p, .safe-preview .preview-h' },
  { folder: 'seo-content-app', source: 'app-screens.html', names: ['01-project-context', '02-keyword-workspace', '03-serp-evidence', '04-intent-gaps', '05-outline-review', '06-article-editor'], preserve: '.input, .query, .source b, .article-preview, .outline-left b, .intent-card h2, .intent-card p' }
];

function translateDocument({ source, translations }) {
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const remaining = new Set();
  const properNames = new Set(['Châu Thanh Tuấn', 'CHÂU THANH', 'TUẤN', 'Đào Xuân Hưng', 'Trần Ngọc Hùng Quân', 'Châu Thanh Tuấn · SEO Portfolio', 'Châu Thanh Tuấn | Senior SEO Specialist & SEO Leader']);
  const overrides = (translations.$overrides || []).map(override => {
    const matches = doc.querySelectorAll(override.selector);
    if (matches.length !== 1) throw new Error(`Translation override must match one element: ${override.selector}`);
    const element = matches[0];
    const node = override.attribute ? null : [...element.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && normalize(child.textContent))[override.textNode];
    const original = override.attribute ? element.getAttribute(override.attribute) : node?.textContent;
    if (normalize(original || '') !== override.source) throw new Error(`Translation override source changed: ${override.selector}`);
    return { ...override, element, node };
  });
  const vietnamese = /[ăâđêôơưĂÂĐÊÔƠƯàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/;
  const translate = (text) => {
    const key = normalize(text);
    if (Object.hasOwn(translations, key)) return text.replace(key === text ? text : /\S[\s\S]*\S|\S/, translations[key]);
    if (vietnamese.test(key) && !properNames.has(key)) remaining.add(key);
    return text;
  };
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('style,script')) continue;
    node.textContent = translate(node.textContent);
  }
  doc.querySelectorAll('*').forEach((el) => {
    ['aria-label', 'alt', 'title', 'data-label', 'data-alt', 'data-caption', 'data-email-subject', 'data-series-name'].forEach((name) => {
      if (el.hasAttribute(name)) el.setAttribute(name, translate(el.getAttribute(name)));
    });
    if (el.matches('meta[name="description"]')) el.content = translate(el.content);
  });
  overrides.forEach(({ element, node, attribute, value }) => {
    if (attribute) element.setAttribute(attribute, value);
    else node.textContent = node.textContent.replace(/\S[\s\S]*\S|\S/, value);
  });
  doc.documentElement.lang = 'en';
  doc.querySelector('link[rel="canonical"]').href = 'https://cttuan244166.github.io/senior-seo-portfolio/en/';
  doc.querySelectorAll('[href], [src]').forEach((el) => {
    ['href', 'src'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (value && /^(assets\/|styles\.css|script\.js|language-switch\.js)/.test(value)) el.setAttribute(attr, `../${value}`);
    });
  });
  doc.querySelectorAll('[data-language-link]').forEach((link) => {
    const active = link.lang === 'en';
    link.setAttribute('href', active ? './' : '../');
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  return { html: '<!doctype html>\n' + doc.documentElement.outerHTML + '\n', remaining: [...remaining] };
}

function localizeDemo({ translations, preserve }) {
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const unmatched = new Set();
  const vietnamese = /[ăâđêôơưĂÂĐÊÔƠƯàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest(`script,style,${preserve}`)) continue;
    const key = normalize(node.textContent);
    let translated = translations[key];
    if (!translated && /^(AVAKIDS RANK CHECKER|AVAKIDS SEO INFOBOX V6|SEO CONTENT WORKFLOW) \/ BƯỚC /.test(key)) {
      translated = key.replace('BƯỚC', 'STEP').replace('MÔ PHỎNG UI / DỮ LIỆU DEMO', 'SIMULATED UI / DEMO DATA');
    }
    if (translated) node.textContent = node.textContent.replace(/\S[\s\S]*\S|\S/, translated);
    else if (vietnamese.test(key)) unmatched.add(key);
  }
  document.documentElement.lang = 'en';
  document.querySelectorAll('.scene').forEach((scene) => {
    const annotations = [...scene.querySelectorAll('.stage > .annot')];
    const width = (1472 - 40 - Math.max(0, annotations.length - 1) * 16) / annotations.length;
    annotations.forEach((annotation, index) => {
      Object.assign(annotation.style, { left: `${20 + index * (width + 16)}px`, top: 'auto', bottom: scene.querySelector('.sheets') ? '52px' : '20px', width: `${width}px` });
    });
  });
  document.body.dataset.untranslated = JSON.stringify([...unmatched]);
}

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  if (process.argv.includes('--inventory')) {
    const original = await readFile(path.join(root, 'index.html'), 'utf8');
    const main = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'text/html');
      const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
      const texts = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement?.closest('script,style')) continue;
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        if (text) texts.add(text);
      }
      const attrs = new Set();
      doc.querySelectorAll('*').forEach((el) => {
        ['aria-label', 'alt', 'title', 'data-label', 'data-alt', 'data-caption', 'data-email-subject'].forEach((name) => {
          const text = el.getAttribute(name)?.replace(/\s+/g, ' ').trim();
          if (text) attrs.add(text);
        });
        if (el.matches('meta[name="description"]')) attrs.add(el.content);
      });
      return { texts: [...texts], attributes: [...attrs] };
    }, original);
    const demos = {};
    for (const group of groups) {
      const texts = new Map();
      for (let i = 0; i < group.names.length; i++) {
        await page.goto(`${pathToFileURL(path.join(root, 'workflow', group.folder, group.source)).href}?screen=${i + 1}`);
        const list = await page.evaluate((preserve) => {
          const walker = document.createTreeWalker(document.querySelector('.scene.active'), NodeFilter.SHOW_TEXT);
          const result = [];
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent.replace(/\s+/g, ' ').trim();
            if (text) result.push({ text, preserved: Boolean(node.parentElement.closest(preserve)) });
          }
          return result;
        }, group.preserve);
        list.forEach((entry) => texts.set(entry.text, entry));
      }
      demos[group.folder] = [...texts.values()];
    }
    await mkdir(path.join(root, 'qa'), { recursive: true });
    await writeFile(path.join(root, 'qa', 'localization-inventory.json'), JSON.stringify({ main, demos }, null, 2));
    console.log('Saved localization inventory.');
  }
  if (process.argv.includes('--build') || process.argv.includes('--page')) {
    const translations = JSON.parse(await readFile(path.join(root, 'scripts', 'portfolio-en.json'), 'utf8'));
    const source = await readFile(path.join(root, 'index.html'), 'utf8');
    const output = await page.evaluate(translateDocument, { source, translations });
    if (output.remaining.length) throw new Error(`Untranslated page content: ${JSON.stringify(output.remaining)}`);
    await mkdir(path.join(root, 'en'), { recursive: true });
    await writeFile(path.join(root, 'en', 'index.html'), output.html);
    console.log('Built en/index.html.');

    const demoTranslations = JSON.parse(await readFile(path.join(root, 'scripts', 'portfolio-demo-en.json'), 'utf8'));
    for (const group of process.argv.includes('--page') ? [] : groups) {
      const directory = path.join(root, 'en', 'workflow', group.folder);
      await mkdir(directory, { recursive: true });
      const sourceDemo = await readFile(path.join(root, 'workflow', group.folder, group.source), 'utf8');
      const localization = `<link rel="stylesheet" href="../../demo-layout.css"><script>(${localizeDemo.toString()})(${JSON.stringify({ translations: demoTranslations, preserve: group.preserve })});</script>`;
      await writeFile(path.join(directory, group.source), sourceDemo.replace('</body>', `${localization}</body>`));
      for (let i = 0; i < group.names.length; i++) {
        await page.goto(`${pathToFileURL(path.join(directory, group.source)).href}?screen=${i + 1}`);
        await page.evaluate(() => document.fonts.ready);
        const unmatched = await page.evaluate(() => JSON.parse(document.body.dataset.untranslated || '[]'));
        if (unmatched.length) throw new Error(`Untranslated ${group.folder}: ${JSON.stringify(unmatched)}`);
        const annotationOverlap = await page.evaluate(() => {
          const rects = [...document.querySelectorAll('.scene.active .annot')].map(el => el.getBoundingClientRect());
          return rects.some((a, i) => rects.slice(i + 1).some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
        });
        if (annotationOverlap) throw new Error(`Overlapping annotations in ${group.folder}/${group.names[i]}`);
        const png = await page.screenshot();
        await sharp(png).webp({ quality: 92 }).toFile(path.join(directory, `${group.names[i]}.webp`));
        console.log(`Rendered ${group.folder}/${group.names[i]}.webp (1600x900).`);
      }
    }
  }
} finally {
  await browser.close();
}
