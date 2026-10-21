(() => {
  if (!['http:', 'https:'].includes(location.protocol)) return;

  const navigation = document.querySelector('.language-switch');
  const links = [...document.querySelectorAll('[data-language-link]')];
  if (!navigation || links.length !== 2) return;

  const languageUrls = new Map(links.map(link => [link.lang, new URL(link.getAttribute('href'), location.href)]));
  const elements = [...document.body.querySelectorAll('*')];
  const documents = new Map([[document.documentElement.lang, Promise.resolve(document.cloneNode(true))]]);
  const labels = ['aria-label', 'alt', 'title', 'data-label', 'data-alt', 'data-caption', 'data-email-subject', 'data-series-name'];
  let requestId = 0;

  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  document.body.append(status);
  history.scrollRestoration = 'manual';

  function updateLinks() {
    links.forEach(link => {
      const url = new URL(languageUrls.get(link.lang));
      url.hash = location.hash;
      link.href = url.href;
      if (link.lang === document.documentElement.lang) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function captureReadingPosition() {
    const marker = Math.min((document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 24, innerHeight / 3);
    const center = innerWidth / 2;
    const candidates = [...document.querySelectorAll('main [id], main h1, main h2, main h3, main p, .workflow-main-media, .workflow-caption, .workflow-product-head, .workflow-thumbnails, .workflow-step, .chart-stage, .ranking-chart-stage, .credentials-grid article')]
      .filter(el => !el.closest('[hidden], .reveal:not(.is-visible)'))
      .map(el => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.height > 0 && rect.width > 0 && rect.bottom > marker && rect.top < innerHeight && rect.left <= center && rect.right >= center);
    const crossing = candidates.filter(({ rect }) => rect.top <= marker).sort((a, b) => a.rect.height - b.rect.height);
    const anchor = crossing[0] || candidates.sort((a, b) => Math.abs(a.rect.top - marker) - Math.abs(b.rect.top - marker))[0];
    if (!anchor) return { x: scrollX, y: scrollY };
    return {
      el: anchor.el,
      top: anchor.rect.top,
      progress: anchor.rect.top <= marker ? (marker - anchor.rect.top) / anchor.rect.height : null,
      marker,
      x: scrollX,
      y: scrollY
    };
  }

  async function loadDocument(language) {
    if (!documents.has(language)) {
      const pending = fetch(languageUrls.get(language), { cache: 'no-cache' }).then(async response => {
        if (!response.ok) throw new Error(`Language document returned ${response.status}`);
        const source = new DOMParser().parseFromString(await response.text(), 'text/html');
        if (source.documentElement.lang !== language || source.body.querySelectorAll('*').length !== elements.length) {
          throw new Error('Language document structure does not match this portfolio');
        }
        return source;
      }).catch(error => {
        documents.delete(language);
        throw error;
      });
      documents.set(language, pending);
    }
    return documents.get(language);
  }

  function applyDocument(source, language) {
    const reading = captureReadingPosition();
    const sourceUrl = languageUrls.get(language);
    const translated = [...source.body.querySelectorAll('*')];
    document.documentElement.classList.add('is-switching-language');

    // Patch the original elements so charts, focus, timers and event listeners survive.
    elements.forEach((element, index) => {
      const template = translated[index];
      if (element.matches('script')) return;
      if (!element.closest('svg, [data-counter], .workflow-caption, [data-gallery-count]')) {
        const currentText = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
        const translatedText = [...template.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
        currentText.forEach((node, textIndex) => {
          if (translatedText[textIndex]) node.textContent = translatedText[textIndex].textContent;
        });
      }
      labels.forEach(name => {
        if (template.hasAttribute(name)) element.setAttribute(name, template.getAttribute(name));
      });
      if (element.matches('img:not(.workflow-main-image)')) {
        element.src = new URL(template.getAttribute('src'), sourceUrl).href;
      }
      if (template.hasAttribute('data-src')) {
        element.dataset.src = new URL(template.dataset.src, sourceUrl).href;
      }
    });

    document.documentElement.lang = language;
    document.title = source.title;
    document.querySelector('meta[name="description"]').content = source.querySelector('meta[name="description"]').content;
    document.querySelector('link[rel="canonical"]').href = source.querySelector('link[rel="canonical"]').href;
    window.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { language } }));

    const rect = reading.el?.getBoundingClientRect();
    const y = rect
      ? scrollY + rect.top - (reading.progress === null ? reading.top : reading.marker - rect.height * reading.progress)
      : reading.y;
    window.scrollTo({ left: reading.x, top: y, behavior: 'instant' });
    requestAnimationFrame(() => document.documentElement.classList.remove('is-switching-language'));
  }

  async function switchLanguage(language, fromHistory = false) {
    const token = ++requestId;
    if (language === document.documentElement.lang) {
      navigation.removeAttribute('aria-busy');
      return;
    }
    navigation.setAttribute('aria-busy', 'true');
    navigation.removeAttribute('data-error');
    try {
      const source = await loadDocument(language);
      if (token !== requestId) return;
      applyDocument(source, language);
      if (!fromHistory) {
        const url = new URL(languageUrls.get(language));
        url.hash = location.hash;
        history.pushState({ ...history.state, portfolioLanguage: language }, '', url);
      }
      updateLinks();
      status.textContent = language === 'en' ? 'Language changed to English.' : 'Đã chuyển sang tiếng Việt.';
    } catch (error) {
      if (token !== requestId) return;
      const message = document.documentElement.lang === 'en' ? 'Unable to load this language. Please try again.' : 'Chưa tải được ngôn ngữ này. Vui lòng thử lại.';
      status.textContent = message;
      navigation.dataset.error = message;
      console.warn('Language switch failed:', error);
    } finally {
      if (token === requestId) navigation.removeAttribute('aria-busy');
    }
  }

  links.forEach(link => link.addEventListener('click', event => {
    updateLinks();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void switchLanguage(link.lang);
  }));
  window.addEventListener('hashchange', updateLinks);
  window.addEventListener('popstate', () => {
    const language = location.pathname === languageUrls.get('en').pathname ? 'en' : 'vi';
    void switchLanguage(language, true);
  });
  updateLinks();
})();
