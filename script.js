(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.page-progress span');
  const navToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const sectionIds = ['experience', 'case-studies', 'process', 'career', 'contact'];

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    header?.classList.toggle('is-scrolled', scrollTop > 18);
    if (progress) progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
  }

  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      updateScrollUI();
      scrollFrame = 0;
    });
  }, { passive: true });
  updateScrollUI();

  if (navToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    navToggle.addEventListener('click', () => {
      const open = !navLinks.classList.contains('is-open');
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 70}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const allSectionLinks = document.querySelectorAll('.nav-links a, .hero-agenda a');
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveSection = (id) => {
    allSectionLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  let navSectionFrame = 0;
  const updateActiveNavSection = () => {
    const marker = window.scrollY + window.innerHeight * 0.32;
    let activeId = sections[0]?.id;
    sections.forEach((section) => {
      if (marker >= section.offsetTop) activeId = section.id;
    });
    if (activeId) setActiveSection(activeId);
  };
  window.addEventListener('scroll', () => {
    if (navSectionFrame) return;
    navSectionFrame = requestAnimationFrame(() => {
      updateActiveNavSection();
      navSectionFrame = 0;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActiveNavSection);
  updateActiveNavSection();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('.experience-panel[data-panel]')];

  function activateTab(tab) {
    const panelIndex = tab.dataset.tab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === panelIndex;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  const emailAction = document.querySelector('[data-email-user][data-email-domain]');
  if (emailAction) {
    const tld = emailAction.dataset.emailTld ? `.${emailAction.dataset.emailTld}` : '';
    const email = `${emailAction.dataset.emailUser}@${emailAction.dataset.emailDomain}${tld}`;
    emailAction.href = `mailto:${email}`;
    emailAction.setAttribute('aria-label', `Gửi email đến ${email}`);
  }

  function animateCounter(element) {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.value || 0);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 3000;
    const formatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

    if (reduceMotion) {
      element.textContent = `${prefix}${formatter.format(target)}${suffix}`;
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progressValue = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progressValue, 4);
      const value = Math.round(target * eased);
      element.textContent = `${prefix}${formatter.format(value)}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const makeSvg = (name, attributes = {}) => {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  const chartTooltip = document.createElement('div');
  chartTooltip.className = 'chart-tooltip';
  chartTooltip.setAttribute('aria-hidden', 'true');
  document.body.append(chartTooltip);

  const multiChartColors = ['#d1ffca', '#8ad7ff', '#ffd166', '#ff8c78', '#c6a7ff', '#f5f5f5'];
  const formatNumber = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);

  function buildChart(svg) {
    const rawValues = (svg.dataset.values || '').split(',').map(Number).filter(Number.isFinite);
    const labels = (svg.dataset.labels || '').split(',').map((label) => label.trim());
    if (rawValues.length < 2) return;

    const width = 760;
    const height = 320;
    const padding = { top: 28, right: 25, bottom: 46, left: 52 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const minValue = Math.min(...rawValues);
    const maxValue = Math.max(...rawValues);
    const range = Math.max(maxValue - minValue, 1);
    const baseline = Math.max(0, minValue - range * 0.16);
    const ceiling = maxValue + range * 0.12;
    const valueRange = ceiling - baseline;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    if (!svg.hasAttribute('aria-label')) svg.setAttribute('aria-label', 'Biểu đồ tăng trưởng SEO');
    svg.replaceChildren();

    for (let index = 0; index <= 4; index += 1) {
      const y = padding.top + (innerHeight / 4) * index;
      svg.append(makeSvg('line', {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        class: 'chart-grid-line'
      }));
    }

    const points = rawValues.map((value, index) => {
      const x = padding.left + (innerWidth * index) / (rawValues.length - 1);
      const y = padding.top + innerHeight - ((value - baseline) / valueRange) * innerHeight;
      return { x, y, value, label: labels[index] || `Mốc ${index + 1}` };
    });

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
    const path = makeSvg('path', { d: pathData, class: 'chart-path' });
    svg.append(path);

    points.forEach((point, index) => {
      const dot = makeSvg('circle', {
        cx: point.x,
        cy: point.y,
        r: 5,
        class: 'chart-dot'
      });
      dot.style.setProperty('--dot-delay', `${300 + index * 70}ms`);
      svg.append(dot);

      if (index === 0 || index === points.length - 1) {
        const valueText = makeSvg('text', {
          x: point.x,
          y: point.y - 14,
          class: 'chart-value',
          'text-anchor': index === 0 ? 'start' : 'end'
        });
        valueText.textContent = `${point.value}%`;
        svg.append(valueText);
      }

      if (labels[index] && (index % 2 === 0 || index === labels.length - 1)) {
        const label = makeSvg('text', {
          x: point.x,
          y: height - 17,
          class: 'chart-label',
          'text-anchor': 'middle'
        });
        label.textContent = labels[index];
        svg.append(label);
      }
    });

    svg.append(makeSvg('line', {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      class: 'chart-hover-line'
    }));
    svg.append(makeSvg('circle', { r: 6, class: 'chart-hover-dot' }));

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduceMotion ? '0' : `${length}`;
    svg._chartData = {
      points,
      width,
      height,
      padding,
      seriesName: svg.dataset.seriesName || 'Giá trị',
      unit: svg.dataset.unit || ''
    };
    svg.dataset.ready = 'true';
  }

  function parseMultiSeries(value) {
    return value
      .split(';')
      .map((item) => {
        const separator = item.indexOf(':');
        if (separator < 0) return null;
        const name = item.slice(0, separator).trim();
        const values = item.slice(separator + 1).split(',').map(Number).filter(Number.isFinite);
        return name && values.length ? { name, values } : null;
      })
      .filter(Boolean);
  }

  function buildMultiChart(svg) {
    const series = parseMultiSeries(svg.dataset.series || '');
    const labels = (svg.dataset.labels || '').split(',').map((label) => label.trim());
    if (!series.length) return;

    const width = 900;
    const height = 360;
    const padding = { top: 30, right: 34, bottom: 48, left: 48 };
    const chartRight = width - padding.right;
    const chartBottom = height - padding.bottom;
    const allValues = series.flatMap((item) => item.values);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = Math.max(maxValue - minValue, 1);
    const baseline = Math.max(0, minValue - range * 0.08);
    const ceiling = maxValue + range * 0.08;
    const valueRange = ceiling - baseline;
    const maxLength = Math.max(...series.map((item) => item.values.length));
    const step = (chartRight - padding.left) / Math.max(maxLength - 1, 1);
    const pointsBySeries = [];

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();

    for (let index = 0; index <= 4; index += 1) {
      const y = padding.top + ((chartBottom - padding.top) / 4) * index;
      svg.append(makeSvg('line', {
        x1: padding.left,
        y1: y,
        x2: chartRight,
        y2: y,
        class: 'chart-grid-line'
      }));
    }

    series.forEach((item, seriesIndex) => {
      const color = multiChartColors[seriesIndex % multiChartColors.length];
      const points = item.values.map((value, index) => ({
        x: padding.left + index * step,
        y: padding.top + (chartBottom - padding.top) - ((value - baseline) / valueRange) * (chartBottom - padding.top),
        value
      }));
      pointsBySeries.push(points);

      const group = makeSvg('g', { class: 'multi-chart-series', 'data-series-index': seriesIndex });
      const pathData = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ');
      const path = makeSvg('path', { d: pathData, class: 'multi-chart-path', stroke: color });
      group.append(path);

      points.forEach((point, index) => {
        if (index % 4 !== 0 && index !== points.length - 1) return;
        const dot = makeSvg('circle', {
          cx: point.x,
          cy: point.y,
          r: 3.8,
          class: 'multi-chart-dot',
          fill: color
        });
        dot.style.setProperty('--dot-delay', `${300 + index * 35}ms`);
        group.append(dot);
      });
      svg.append(group);
    });

    [0, Math.floor((maxLength - 1) / 2), maxLength - 1].forEach((index) => {
      if (!labels[index]) return;
      const label = makeSvg('text', {
        x: padding.left + index * step,
        y: height - 16,
        class: 'chart-label',
        'text-anchor': 'middle'
      });
      label.textContent = labels[index];
      svg.append(label);
    });

    svg.append(makeSvg('line', {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: chartBottom,
      class: 'multi-hover-line'
    }));
    series.forEach((_, index) => {
      svg.append(makeSvg('circle', {
        r: 5.5,
        class: 'multi-hover-dot',
        stroke: multiChartColors[index % multiChartColors.length]
      }));
    });

    svg.querySelectorAll('.multi-chart-path').forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = reduceMotion ? '0' : `${length}`;
    });

    svg._multiChartData = {
      labels,
      series,
      pointsBySeries,
      width,
      height,
      chartLeft: padding.left,
      chartRight,
      chartTop: padding.top,
      chartBottom,
      step
    };
    svg.dataset.ready = 'true';
  }

  const charts = document.querySelectorAll('.line-chart, .multi-line-chart');
  charts.forEach((chart) => {
    if (chart.classList.contains('multi-line-chart')) buildMultiChart(chart);
    else buildChart(chart);
  });

  const drawChart = (svg) => {
    if (svg.dataset.drawn === 'true') return;
    svg.dataset.drawn = 'true';
    svg.classList.add('is-drawn');
    const paths = svg.querySelectorAll('.chart-path, .multi-chart-path');
    if (!paths.length) return;
    if (reduceMotion) {
      paths.forEach((path) => { path.style.strokeDashoffset = '0'; });
      return;
    }
    requestAnimationFrame(() => {
      paths.forEach((path, index) => {
        path.style.transition = `stroke-dashoffset 1.8s cubic-bezier(.22,.8,.3,1) ${index * 70}ms`;
        path.style.strokeDashoffset = '0';
      });
    });
  };

  function positionTooltip(clientX, clientY) {
    chartTooltip.classList.add('is-visible');
    chartTooltip.setAttribute('aria-hidden', 'false');
    const halfWidth = Math.min(chartTooltip.offsetWidth / 2, 145);
    const tooltipHeight = chartTooltip.offsetHeight;
    const placeBelow = clientY < tooltipHeight + 96;
    chartTooltip.classList.toggle('is-below', placeBelow);
    chartTooltip.style.left = `${clamp(clientX, halfWidth + 14, window.innerWidth - halfWidth - 14)}px`;
    chartTooltip.style.top = `${clamp(clientY, 88, window.innerHeight - 20)}px`;
  }

  function hideChartTooltip(svg) {
    svg.classList.remove('is-hovering');
    svg.querySelectorAll('.multi-chart-series').forEach((group) => group.classList.remove('is-focus'));
    chartTooltip.classList.remove('is-visible');
    chartTooltip.setAttribute('aria-hidden', 'true');
  }

  function updateLineTooltip(svg, event) {
    const data = svg._chartData;
    if (!data?.points?.length) return;
    const rect = svg.getBoundingClientRect();
    const chartX = ((event.clientX - rect.left) / rect.width) * data.width;
    const step = data.points.length > 1 ? data.points[1].x - data.points[0].x : 1;
    const index = clamp(Math.round((chartX - data.padding.left) / step), 0, data.points.length - 1);
    const point = data.points[index];
    const hoverLine = svg.querySelector('.chart-hover-line');
    const hoverDot = svg.querySelector('.chart-hover-dot');
    hoverLine?.setAttribute('x1', point.x);
    hoverLine?.setAttribute('x2', point.x);
    hoverDot?.setAttribute('cx', point.x);
    hoverDot?.setAttribute('cy', point.y);
    chartTooltip.innerHTML = `<strong>${point.label}</strong><span><span><i style="background:#d1ffca"></i>${data.seriesName}</span><b>${formatNumber(point.value)}${data.unit}</b></span>`;
    svg.classList.add('is-hovering');
    positionTooltip(rect.left + (point.x / data.width) * rect.width, rect.top + (point.y / data.height) * rect.height);
  }

  function updateMultiTooltip(svg, event) {
    const data = svg._multiChartData;
    if (!data?.labels?.length) return;
    const rect = svg.getBoundingClientRect();
    const chartX = ((event.clientX - rect.left) / rect.width) * data.width;
    const index = clamp(Math.round((chartX - data.chartLeft) / data.step), 0, data.labels.length - 1);
    const x = data.chartLeft + index * data.step;
    const chartY = ((event.clientY - rect.top) / rect.height) * data.height;
    const yValues = data.pointsBySeries.map((points) => points[index]?.y ?? data.chartBottom);
    const focusIndex = yValues.reduce((closest, y, seriesIndex) =>
      Math.abs(y - chartY) < Math.abs(yValues[closest] - chartY) ? seriesIndex : closest, 0);

    const hoverLine = svg.querySelector('.multi-hover-line');
    hoverLine?.setAttribute('x1', x);
    hoverLine?.setAttribute('x2', x);
    svg.querySelectorAll('.multi-hover-dot').forEach((dot, seriesIndex) => {
      const point = data.pointsBySeries[seriesIndex]?.[index];
      if (!point) return;
      dot.setAttribute('cx', point.x);
      dot.setAttribute('cy', point.y);
    });
    svg.querySelectorAll('.multi-chart-series').forEach((group, seriesIndex) => {
      group.classList.toggle('is-focus', seriesIndex === focusIndex);
    });
    chartTooltip.innerHTML = `<strong>${data.labels[index]}</strong>${data.series.map((item, seriesIndex) =>
      `<span><span><i style="background:${multiChartColors[seriesIndex % multiChartColors.length]}"></i>${item.name}</span><b>${formatNumber(item.values[index] || 0)}</b></span>`).join('')}`;
    svg.classList.add('is-hovering');
    positionTooltip(rect.left + (x / data.width) * rect.width, rect.top + (Math.min(...yValues) / data.height) * rect.height);
  }

  charts.forEach((svg) => {
    const update = (event) => svg.classList.contains('multi-line-chart')
      ? updateMultiTooltip(svg, event)
      : updateLineTooltip(svg, event);
    svg.addEventListener('pointermove', update);
    svg.addEventListener('pointerdown', update);
    svg.addEventListener('pointerleave', () => hideChartTooltip(svg));
    svg.addEventListener('pointercancel', () => hideChartTooltip(svg));
  });
  window.addEventListener('scroll', () => {
    chartTooltip.classList.remove('is-visible');
    chartTooltip.setAttribute('aria-hidden', 'true');
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const chartObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        drawChart(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    charts.forEach((chart) => chartObserver.observe(chart));
  } else {
    charts.forEach(drawChart);
  }

  const workflow = document.querySelector('.workflow');
  if (workflow) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      workflow.classList.add('is-active');
    } else {
      const workflowObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        workflow.classList.add('is-active');
        observer.disconnect();
      }, { threshold: 0.28 });
      workflowObserver.observe(workflow);
    }

    const steps = [...workflow.querySelectorAll('.workflow-step')];
    let activeStep = 0;
    let stepTimer = 0;
    let workflowInView = false;
    let workflowPaused = false;

    const setActiveStep = (index) => {
      activeStep = (index + steps.length) % steps.length;
      steps.forEach((step, stepIndex) => {
        const active = stepIndex === activeStep;
        step.classList.toggle('is-current', active);
        step.setAttribute('aria-current', active ? 'step' : 'false');
      });
    };

    const scheduleStep = () => {
      window.clearTimeout(stepTimer);
      if (reduceMotion || !workflowInView || workflowPaused) return;
      stepTimer = window.setTimeout(() => {
        setActiveStep(activeStep + 1);
        scheduleStep();
      }, 3000);
    };

    steps.forEach((step, index) => {
      step.tabIndex = 0;
      step.addEventListener('click', () => {
        setActiveStep(index);
        scheduleStep();
      });
      step.addEventListener('focus', () => {
        workflowPaused = true;
        setActiveStep(index);
        window.clearTimeout(stepTimer);
      });
      step.addEventListener('blur', () => {
        workflowPaused = false;
        scheduleStep();
      });
    });

    workflow.addEventListener('pointerenter', () => {
      workflowPaused = true;
      window.clearTimeout(stepTimer);
    });
    workflow.addEventListener('pointerleave', () => {
      workflowPaused = false;
      scheduleStep();
    });

    if ('IntersectionObserver' in window) {
      const autoStepObserver = new IntersectionObserver((entries) => {
        workflowInView = entries[0].isIntersecting;
        scheduleStep();
      }, { threshold: 0.32 });
      autoStepObserver.observe(workflow);
    } else {
      workflowInView = true;
    }

    setActiveStep(0);
    scheduleStep();
  }

  const workflowGalleries = document.querySelectorAll('[data-gallery]');
  workflowGalleries.forEach((gallery) => {
    const mainImage = gallery.querySelector('.workflow-main-image');
    const captionStep = gallery.querySelector('.workflow-caption-step');
    const captionTitle = gallery.querySelector('.workflow-caption strong');
    const captionText = gallery.querySelector('.workflow-caption p');
    const count = gallery.querySelector('[data-gallery-count]');
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const thumbnailStrip = gallery.querySelector('.workflow-thumbnails');
    const thumbnails = [...gallery.querySelectorAll('.workflow-thumbnail')];
    let currentIndex = 0;

    if (!mainImage || !thumbnails.length) return;

    const padStep = (value) => String(value).padStart(2, '0');

    const updateGallery = (nextIndex, moveFocus = false) => {
      currentIndex = (nextIndex + thumbnails.length) % thumbnails.length;
      const selected = thumbnails[currentIndex];
      const total = padStep(thumbnails.length);
      const current = padStep(currentIndex + 1);

      mainImage.classList.add('is-changing');
      mainImage.alt = selected.dataset.alt || '';
      mainImage.src = selected.dataset.src || mainImage.src;

      const finishTransition = () => requestAnimationFrame(() => mainImage.classList.remove('is-changing'));
      if (mainImage.complete) finishTransition();
      else mainImage.addEventListener('load', finishTransition, { once: true });

      if (captionStep) captionStep.textContent = `BƯỚC ${current} / ${total}`;
      if (captionTitle) captionTitle.textContent = selected.dataset.label || '';
      if (captionText) captionText.textContent = selected.dataset.caption || '';
      if (count) count.textContent = `${current} / ${total}`;

      thumbnails.forEach((thumbnail, index) => {
        const active = index === currentIndex;
        thumbnail.classList.toggle('is-active', active);
        thumbnail.setAttribute('aria-pressed', String(active));
      });

      if (thumbnailStrip?.scrollTo) {
        const centeredLeft = selected.offsetLeft - (thumbnailStrip.clientWidth - selected.clientWidth) / 2;
        thumbnailStrip.scrollTo({ left: Math.max(centeredLeft, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      if (moveFocus) selected.focus({ preventScroll: true });
    };

    previous?.addEventListener('click', () => updateGallery(currentIndex - 1));
    next?.addEventListener('click', () => updateGallery(currentIndex + 1));
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => updateGallery(index));
      thumbnail.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') updateGallery(0, true);
        if (event.key === 'End') updateGallery(thumbnails.length - 1, true);
        if (event.key === 'ArrowLeft') updateGallery(index - 1, true);
        if (event.key === 'ArrowRight') updateGallery(index + 1, true);
      });
    });

    updateGallery(0);
  });

  const hero = document.querySelector('.hero');
  const portrait = document.querySelector('#heroPortrait');
  if (hero && portrait && finePointer && !reduceMotion) {
    let portraitFrame = 0;
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
      cancelAnimationFrame(portraitFrame);
      portraitFrame = requestAnimationFrame(() => {
        portrait.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      portrait.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        button.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    const pointerLight = document.querySelector('.pointer-light');
    if (pointerLight) {
      let lightFrame = 0;
      window.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(lightFrame);
        lightFrame = requestAnimationFrame(() => {
          pointerLight.style.opacity = '1';
          pointerLight.style.transform = `translate3d(${event.clientX - 10}px, ${event.clientY - 10}px, 0) rotate(45deg)`;
        });
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => {
        pointerLight.style.opacity = '0';
      });
    }

    const spotlightCards = document.querySelectorAll('.kpi-item, .case-study, .ranking-study, .workflow-product, .automation-panel, .credentials-grid article');
    spotlightCards.forEach((card) => {
      card.classList.add('spotlight-card');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
    });

    document.querySelectorAll('.kpi-item, .case-study, .workflow-product').forEach((card) => {
      card.classList.add('tilt-card');
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
        const ratioY = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateY = ratioX * 3;
        const rotateX = ratioY * -3;
        const moveX = ratioX * 3;
        const moveY = ratioY * 3;
        card.style.transform = `perspective(1200px) translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'perspective(1200px) translate3d(0, 0, 0) rotateX(0) rotateY(0)';
      });
    });
  }
})();
