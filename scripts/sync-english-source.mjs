import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const englishPath = path.join(root, 'en', 'index.html');
const mapPath = path.join(root, 'scripts', 'portfolio-en.json');
const [vietnamese, english, mapSource, builder] = await Promise.all([
  readFile(path.join(root, 'index.html'), 'utf8'),
  readFile(englishPath, 'utf8'),
  readFile(mapPath, 'utf8'),
  readFile(path.join(root, 'scripts', 'localize-portfolio.mjs'), 'utf8')
]);
const translations = JSON.parse(mapSource);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

try {
  const page = await browser.newPage();
  const result = await page.evaluate(({ vietnamese, english, translations }) => {
    const vi = new DOMParser().parseFromString(vietnamese, 'text/html');
    const en = new DOMParser().parseFromString(english, 'text/html');
    const viElements = [...vi.querySelectorAll('*')];
    const enElements = [...en.querySelectorAll('*')];
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    if (viElements.length !== enElements.length || viElements.some((el, index) => el.tagName !== enElements[index]?.tagName)) {
      throw new Error('The two HTML documents have different structures. No source files were updated.');
    }

    function selectorFor(element) {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const gallery = element.closest('[data-gallery]');
      if (gallery) {
        const number = [...gallery.parentElement.querySelectorAll(':scope > [data-gallery]')].indexOf(gallery) + 1;
        const base = `#workflow-tools-automation > [data-gallery]:nth-of-type(${number})`;
        if (element.matches('.workflow-caption p')) return `${base} .workflow-caption p`;
        if (element.matches('.workflow-caption strong')) return `${base} .workflow-caption strong`;
        if (element.matches('.workflow-journey > li')) return `${base} .workflow-journey > li:nth-of-type(${[...element.parentElement.children].indexOf(element) + 1})`;
        if (element.matches('.workflow-thumbnail')) return `${base} .workflow-thumbnail:nth-of-type(${[...element.parentElement.children].indexOf(element) + 1})`;
      }
      const parts = [];
      let current = element;
      while (current && !current.id) {
        if (!current.parentElement) {
          parts.unshift(current.localName);
          break;
        }
        const sameTag = [...current.parentElement.children].filter(el => el.tagName === current.tagName);
        parts.unshift(`${current.localName}:nth-of-type(${sameTag.indexOf(current) + 1})`);
        current = current.parentElement;
      }
      if (current) parts.unshift(`#${CSS.escape(current.id)}`);
      return parts.join(' > ');
    }

    const pairs = [];
    viElements.forEach((element, index) => {
      if (element.closest('script,style')) return;
      const textNodes = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && normalize(node.textContent));
      const englishText = [...enElements[index].childNodes].filter(node => node.nodeType === Node.TEXT_NODE && normalize(node.textContent));
      if (textNodes.length !== englishText.length) throw new Error(`Text structure differs at ${element.tagName}, element ${index}`);
      textNodes.forEach((node, textNode) => pairs.push({ key: normalize(node.textContent), value: normalize(englishText[textNode].textContent), selector: selectorFor(element), textNode }));
      const attributes = ['aria-label', 'alt', 'title', 'data-label', 'data-alt', 'data-caption', 'data-email-subject', 'data-series-name'];
      if (element.matches('meta[name="description"]')) attributes.push('content');
      attributes.forEach(attribute => {
        const key = normalize(element.getAttribute(attribute) || '');
        if (key) pairs.push({ key, value: normalize(enElements[index].getAttribute(attribute) || ''), selector: selectorFor(element), attribute });
      });
    });

    const groups = new Map();
    pairs.forEach(pair => {
      if (!groups.has(pair.key)) groups.set(pair.key, []);
      groups.get(pair.key).push(pair);
    });
    const next = { ...translations };
    delete next.$overrides;
    const changes = [];
    const overrides = [];
    for (const [key, entries] of groups) {
      const variants = [...new Set(entries.map(entry => entry.value))];
      const value = variants.includes(translations[key]) ? translations[key] : entries[0].value;
      if (Object.hasOwn(translations, key) || value !== key) {
        next[key] = value;
        if (translations[key] !== value) changes.push({ source: key, previous: translations[key], value });
      }
      for (const entry of entries.filter(entry => entry.value !== value)) {
        const override = { selector: entry.selector, source: entry.key, value: entry.value };
        if (entry.attribute) override.attribute = entry.attribute;
        else override.textNode = entry.textNode;
        overrides.push(override);
      }
    }
    if (overrides.length) next.$overrides = overrides;
    return { next, changes, overrides, comparedPairs: pairs.length, elements: viElements.length };
  }, { vietnamese, english, translations });

  // Use the real page builder in memory so validation never overwrites the source HTML.
  const functionSource = builder.slice(builder.indexOf('function translateDocument('), builder.indexOf('\nfunction localizeDemo('));
  const rebuilt = await page.evaluate(`(${functionSource})(${JSON.stringify({ source: vietnamese, translations: result.next })})`);
  assert.deepEqual(rebuilt.remaining, [], 'The map is missing source text');
  const differences = await page.evaluate(({ expected, actual }) => {
    const a = new DOMParser().parseFromString(expected, 'text/html');
    const b = new DOMParser().parseFromString(actual, 'text/html');
    const normalize = value => value.replace(/\s+/g, ' ').trim();
    const aa = [...a.querySelectorAll('*')];
    const bb = [...b.querySelectorAll('*')];
    const changes = [];
    if (aa.length !== bb.length) return ['Element count changed'];
    aa.forEach((element, index) => {
      const other = bb[index];
      if (element.tagName !== other.tagName) changes.push(`Element ${index}: tag changed`);
      if (!element.closest('script,style')) {
        const text = node => [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).map(child => normalize(child.textContent)).filter(Boolean);
        if (JSON.stringify(text(element)) !== JSON.stringify(text(other))) changes.push(`Element ${index}: text differs`);
      }
      for (const attribute of element.attributes) {
        if (normalize(attribute.value) !== normalize(other.getAttribute(attribute.name) || '')) changes.push(`Element ${index}: ${attribute.name} differs`);
      }
      if (element.attributes.length !== other.attributes.length) changes.push(`Element ${index}: attribute count differs`);
    });
    return changes;
  }, { expected: english, actual: rebuilt.html });
  assert.deepEqual(differences, [], `Rebuilding would change the English source: ${differences.join(', ')}`);

  if (process.argv.includes('--sync')) await writeFile(mapPath, JSON.stringify(result.next, null, 2) + '\n');
  assert.equal(await readFile(englishPath, 'utf8'), english, 'The English HTML must remain untouched');
  console.log(JSON.stringify({ written: process.argv.includes('--sync'), comparedPairs: result.comparedPairs, elements: result.elements, updatedEntries: result.changes.length, contextualOverrides: result.overrides.length, rebuiltContentMatches: true, englishFileUnchanged: true, englishSha256: createHash('sha256').update(english).digest('hex'), ...(process.argv.includes('--verbose') ? { changes: result.changes, overrides: result.overrides } : {}) }, null, 2));
} finally {
  await browser.close();
}
