const progress = document.querySelector(".page-progress span");
const reveals = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const counters = document.querySelectorAll("[data-counter]");
const charts = document.querySelectorAll(".line-chart");
const multiLineCharts = document.querySelectorAll(".multi-line-chart");
const mascot = document.querySelector(".mascot-guide");
const mascotImage = document.querySelector("#mascotImage");
const mascotMessage = document.querySelector("#mascotMessage");
const guideSections = document.querySelectorAll("[data-guide]");
const canvas = document.querySelector("#ambientCanvas");
const ctx = canvas?.getContext("2d");
const mobileAccordionItems = document.querySelectorAll("#workflow .workflow-step, .credential-list article");
const mobileMedia = window.matchMedia("(max-width: 660px)");
const experienceTabs = document.querySelectorAll(".experience-tab");
const experiencePanels = document.querySelectorAll(".experience-detail");
const emailActions = document.querySelectorAll(".email-action");
const detailButtons = document.querySelectorAll("[data-modal]");
const experienceModal = document.querySelector("#experienceModal");
const modalTitle = document.querySelector("#modalTitle");
const modalEyebrow = document.querySelector("#modalEyebrow");
const modalBody = document.querySelector("#modalBody");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const chartTooltip = document.createElement("div");

let canvasWidth = 0;
let canvasHeight = 0;
let particles = [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeGuideSection = null;
const mascotPoses = {
  intro: "assets/mascot-intro.png",
  about: "assets/mascot-about.png",
  timeline: "assets/mascot-timeline.png",
  kpi: "assets/mascot-kpi.png",
  chart: "assets/mascot-chart.png",
  thanks: "assets/mascot-thanks.png"
};
const mascotAlt = {
  intro: "Mascot Tuấn khoanh tay tự tin giới thiệu bản thân",
  about: "Mascot Tuấn mở tay chào hỏi",
  timeline: "Mascot Tuấn chỉ vào timeline",
  kpi: "Mascot Tuấn giơ hai tay ăn mừng KPI",
  chart: "Mascot Tuấn chỉ vào biểu đồ tăng trưởng",
  thanks: "Mascot Tuấn vẫy tay cảm ơn"
};
const multiChartColors = ["#287d78", "#b66f29", "#3f6f9f", "#7a8b4d", "#9a5f7b", "#5d6f75"];
const experienceDetails = {
  avakids: {
    eyebrow: "09/2024 - 06/2026 · SEO Specialist",
    title: "Chuỗi Mẹ & Bé AVAKids (MWG)",
    html: `
      <p>Xây dựng và triển khai chiến lược SEO tổng thể từ 6-12 tháng với mục tiêu tăng 21% Organic Sessions, cải thiện thứ hạng và doanh thu từ SEO cho 786 URL danh mục và sản phẩm.</p>
      <h3>Kết quả chính</h3>
      <ul>
        <li>Hoàn thành gần 91% so với mục tiêu đề ra.</li>
        <li>Tăng 83% Organic Sessions trong 5 tháng đầu.</li>
        <li>Hơn 45% bộ từ khóa sản phẩm mục tiêu nằm trong Top 1-3 và 35% keywords Top 4-10.</li>
      </ul>
      <h3>Phạm vi công việc</h3>
      <ul>
        <li>Phối hợp với Ngành hàng, Content, PM, Design để tối ưu SEO, nội dung, doanh thu và trải nghiệm người dùng.</li>
        <li>Research keywords, phân tích đối thủ, xây dựng guideline content, internal link, outline và tối ưu nội dung cho trang danh mục, sản phẩm bằng Ahrefs, Keyword Planner và Keywordtool.io.</li>
        <li>Audit website định kỳ bằng Ahrefs, Screaming Frog, GSC và GA4 để phát hiện lỗi technical, ranking, traffic và đề xuất hướng xử lý.</li>
        <li>Xây dựng Dashboard, Report bằng Looker Studio, GA4, GSC và Google Sheets để theo dõi sức khỏe website, hiệu suất SEO và tiến độ mục tiêu.</li>
        <li>Kết hợp App Script, Google Sheets, Codex, n8n và AI tools để tạo workflow đo rank, viết content infobox và tối ưu content sản phẩm theo keyword và URL.</li>
      </ul>
    `
  },
  routine: {
    eyebrow: "08/2022 - 06/2024 · SEO Executive",
    title: "ROUTINE",
    html: `
      <p>Triển khai SEO cho website thương hiệu thời trang, tập trung tăng Organic Traffic, mở rộng bộ từ khóa sản phẩm và cải thiện hiệu quả chuyển đổi.</p>
      <h3>Kết quả chính</h3>
      <ul>
        <li>Quản lý danh sách 53 URL sản phẩm, tăng từ 200 keywords lên khoảng 850 keywords sản phẩm.</li>
        <li>27% bộ từ khóa sản phẩm mục tiêu nằm trong Top 1-3 và 22% keywords Top 4-10.</li>
        <li>Tăng 117% Organic Traffic trong 6 tháng đầu.</li>
        <li>Sau 1 năm tăng hơn 243% Organic Sessions và 250% Click.</li>
      </ul>
      <h3>Phạm vi công việc</h3>
      <ul>
        <li>Quản lý đội ngũ content full-time, intern và freelancer để lên kế hoạch, research, ý tưởng hằng tháng và tối ưu nội dung.</li>
        <li>Tối ưu blog, sản phẩm, internal link và mô tả các nội dung technical để cải thiện SEO.</li>
        <li>Phối hợp Design, IT và Developer để cải thiện SEO, layout website và tăng tỷ lệ chuyển đổi.</li>
        <li>Audit, báo cáo hiệu suất SEO, theo dõi keyword ranking, traffic, competitor và đề xuất kế hoạch cải thiện định kỳ.</li>
      </ul>
    `
  },
  drcheck: {
    eyebrow: "11/2020 - 06/2022 · SEO Executive",
    title: "Dr. Check Clinic",
    html: `
      <p>Resume hiện chưa có mô tả chi tiết nhiệm vụ, KPI hoặc dự án nổi bật cho giai đoạn này.</p>
      <ul>
        <li>Có thể giữ ngắn để không làm loãng portfolio.</li>
        <li>Nếu muốn làm mạnh hơn, nên bổ sung loại website, scope công việc, chỉ số traffic/ranking và công cụ đã dùng.</li>
      </ul>
    `
  },
  devi: {
    eyebrow: "04/2020 - 11/2020 · Digital Marketing",
    title: "DEVI Kids Import-Export Company",
    html: `
      <p>Resume hiện chưa có mô tả chi tiết kênh phụ trách, KPI hoặc dự án nổi bật cho giai đoạn Digital Marketing đầu tiên.</p>
      <ul>
        <li>Có thể giữ như một mốc khởi đầu nghề nghiệp.</li>
        <li>Nếu bổ sung sau, nên thêm kênh triển khai, loại nội dung, ngân sách hoặc kết quả đo được.</li>
      </ul>
    `
  }
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
);

const chartObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-drawn");
        chartObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

const guideObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveGuide();
    });
  },
  { threshold: 0.08, rootMargin: "-10% 0px -16% 0px" }
);

chartTooltip.className = "chart-tooltip";
chartTooltip.setAttribute("aria-hidden", "true");
document.body.appendChild(chartTooltip);

reveals.forEach((element) => revealObserver.observe(element));
counters.forEach((element) => counterObserver.observe(element));
charts.forEach((chart) => {
  drawChart(chart);
  chartObserver.observe(chart);
});
multiLineCharts.forEach((chart) => {
  drawMultiLineChart(chart);
  chartObserver.observe(chart);
});
guideSections.forEach((section) => guideObserver.observe(section));
setupMobileAccordions();
setupExperienceMorph();
setupEmailActions();
setupExperienceModal();
setupMultiChartTooltips();

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const value = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${Math.min(value, 100)}%`;

  if (mascot && !prefersReducedMotion) {
    const float = Math.sin(scrollTop / 170) * 7;
    const sway = Math.sin(scrollTop / 230) * 2.8;
    mascot.style.setProperty("--guide-float", `${float}px`);
    mascot.style.setProperty("--guide-sway", `${sway}deg`);
  }

  updateActiveGuide();
  runViewportAnimations();
}

function updateHeroMorph(event) {
  if (!heroVisual || window.matchMedia("(max-width: 980px)").matches) return;

  const rect = heroVisual.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  heroVisual.style.setProperty("--tilt-x", `${y * -8}deg`);
  heroVisual.style.setProperty("--tilt-y", `${x * 10}deg`);
}

function animateCounter(element) {
  if (element.dataset.animated === "true") return;
  element.dataset.animated = "true";

  const target = Number(element.dataset.count || 0);
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";
  const duration = prefersReducedMotion ? 1 : 1350;
  const startTime = performance.now();

  function setValue(value) {
    element.textContent = `${prefix}${value}${suffix}`;
  }

  if (prefersReducedMotion) {
    setValue(target);
    return;
  }

  const timer = window.setInterval(() => {
    const now = performance.now();
    const progressValue = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const value = Math.round(target * eased);
    setValue(value);

    if (progressValue >= 1) {
      setValue(target);
      window.clearInterval(timer);
    }
  }, 16);
}

function activateGuide(section) {
  if (!section || activeGuideSection === section || !mascot || !mascotMessage) return;

  const index = [...guideSections].indexOf(section);
  const side = getGuideSide(section, index);
  const pose = section.dataset.pose || "intro";
  activeGuideSection = section;
  mascot.dataset.side = side;
  mascot.dataset.section = section.id || "section";
  mascot.dataset.pose = pose;
  mascotMessage.textContent = section.dataset.guide;

  if (mascotImage && mascotPoses[pose] && !mascotImage.src.endsWith(mascotPoses[pose])) {
    mascot.classList.add("is-switching");
    window.setTimeout(() => {
      mascotImage.src = mascotPoses[pose];
      mascotImage.alt = mascotAlt[pose] || "Mascot Tuấn 3D";
      mascot.classList.remove("is-switching");
    }, prefersReducedMotion ? 0 : 140);
  }
}

function updateActiveGuide() {
  if (!guideSections.length) return;
  const targetLine = window.innerHeight * 0.6;
  let active = guideSections[0];

  guideSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= targetLine && rect.bottom > targetLine) {
      active = section;
    }
  });

  activateGuide(active);
}

function getGuideSide(section, index) {
  if (section.id === "charts" || section.id === "workflow") return "left";
  if (section.id === "timeline" || section.id === "certificates") return "right";
  return index % 2 === 0 ? "right" : "left";
}

function isInViewport(element, offset = 0.88) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * offset && rect.bottom > window.innerHeight * (1 - offset);
}

function runViewportAnimations() {
  counters.forEach((counter) => {
    if (counter.dataset.animated !== "true" && isInViewport(counter, 0.94)) animateCounter(counter);
  });

  charts.forEach((chart) => {
    if (!chart.classList.contains("is-drawn") && isInViewport(chart, 0.92)) chart.classList.add("is-drawn");
  });

  multiLineCharts.forEach((chart) => {
    if (!chart.classList.contains("is-drawn") && isInViewport(chart, 0.92)) chart.classList.add("is-drawn");
  });
}

function drawChart(svg) {
  const values = (svg.dataset.values || "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
  if (values.length < 2) return;

  const labels = (svg.dataset.labels || "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const unit = svg.dataset.unit || "";
  const [, , viewWidth, viewHeight] = (svg.getAttribute("viewBox") || "0 0 420 220").split(/\s+/).map(Number);
  const width = viewWidth || 420;
  const height = viewHeight || 220;
  const isMobileChart = mobileMedia.matches;
  const padding = isMobileChart ? 18 : 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (width - padding * 2) / (values.length - 1);
  const pointData = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value, label: labels[index] || `Point ${index + 1}` };
  });
  const points = pointData.map((point) => `${point.x},${point.y}`);
  const gradientId = `chartGradient-${Math.random().toString(16).slice(2)}`;
  const labelIndexes = isMobileChart
    ? [0, pointData.length - 1]
    : pointData.length > 12
      ? [0, Math.floor(pointData.length / 2), pointData.length - 1]
      : pointData.map((_, index) => index);
  const valueInterval = isMobileChart ? Math.ceil(pointData.length / 4) : Math.ceil(pointData.length / 6);
  const valueLabelIndexes = pointData
    .map((_, index) => index)
    .filter((index) => index === pointData.length - 1 || index % valueInterval === 0);

  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#287d78" />
        <stop offset="100%" stop-color="#b66f29" />
      </linearGradient>
    </defs>
    <g class="chart-grid-lines">
      <line x1="${padding}" y1="${padding + 22}" x2="${width - padding}" y2="${padding + 22}"></line>
      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}"></line>
      <line x1="${padding}" y1="${height - padding - 20}" x2="${width - padding}" y2="${height - padding - 20}"></line>
    </g>
    <polyline class="chart-area" points="${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}"></polyline>
    <polyline class="chart-line" style="stroke:url(#${gradientId})" points="${points.join(" ")}"></polyline>
    <g class="chart-dots">
      ${points
        .map((point, index) => (index % Math.ceil(points.length / 6) === 0 || index === points.length - 1 ? `<circle cx="${point.split(",")[0]}" cy="${point.split(",")[1]}" r="4"></circle>` : ""))
        .join("")}
    </g>
    <g class="chart-labels">
      ${labelIndexes.map((index) => `<text x="${pointData[index].x}" y="${height - 6}">${pointData[index].label}</text>`).join("")}
    </g>
    <g class="chart-value-labels">
      ${valueLabelIndexes
        .map((index) => {
          const point = pointData[index];
          const y = Math.max(point.y - 10, 18);
          return `<text x="${Math.min(Math.max(point.x, padding + 8), width - padding - 8)}" y="${y}">${point.value}${unit}</text>`;
        })
        .join("")}
    </g>
  `;

  const line = svg.querySelector(".chart-line");
  if (line) {
    const length = line.getTotalLength();
    line.style.setProperty("--line-length", length);
  }
}

function drawMultiLineChart(svg) {
  const series = parseMultiLineSeries(svg.dataset.series || "");
  if (!series.length) return;

  const labels = (svg.dataset.labels || "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const [, , viewWidth, viewHeight] = (svg.getAttribute("viewBox") || "0 0 760 320").split(/\s+/).map(Number);
  const width = viewWidth || 760;
  const height = viewHeight || 320;
  const isMobileChart = mobileMedia.matches;
  const padding = isMobileChart ? 24 : 38;
  const chartTop = padding + 6;
  const chartBottom = height - padding - 22;
  const chartLeft = padding;
  const chartRight = width - padding;
  const allValues = series.flatMap((item) => item.values);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  const maxLength = Math.max(...series.map((item) => item.values.length));
  const step = (chartRight - chartLeft) / Math.max(maxLength - 1, 1);
  const labelIndexes = isMobileChart ? [0, maxLength - 1] : [0, Math.floor(maxLength / 2), maxLength - 1];
  const pointsBySeries = [];

  const lineMarkup = series
    .map((item, seriesIndex) => {
      const color = multiChartColors[seriesIndex % multiChartColors.length];
      const points = item.values.map((value, valueIndex) => {
        const x = chartLeft + valueIndex * step;
        const y = chartBottom - ((value - min) / range) * (chartBottom - chartTop);
        return { x, y, value };
      });
      pointsBySeries.push(points);
      const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
      const last = points[points.length - 1];
      const labelX = Math.min(last.x + 8, chartRight - 52);
      const labelY = Math.min(Math.max(last.y + 4, chartTop + 10), chartBottom - 4);
      const dots = points
        .map((point, index) => {
          const interval = isMobileChart ? Math.ceil(points.length / 4) : Math.ceil(points.length / 7);
          return index % interval === 0 || index === points.length - 1
            ? `<circle cx="${point.x}" cy="${point.y}" r="${isMobileChart ? 2.8 : 3.5}" style="fill:${color}"></circle>`
            : "";
        })
        .join("");

      return `
        <g class="multi-chart-series">
          <polyline class="multi-chart-line" style="stroke:${color}" points="${pointString}"></polyline>
          <g class="multi-chart-dots">${dots}</g>
          <text class="multi-chart-end-label" x="${labelX}" y="${labelY}" style="fill:${color}">${item.name}</text>
        </g>`;
    })
    .join("");

  svg.innerHTML = `
    <g class="chart-grid-lines">
      <line x1="${chartLeft}" y1="${chartTop}" x2="${chartRight}" y2="${chartTop}"></line>
      <line x1="${chartLeft}" y1="${(chartTop + chartBottom) / 2}" x2="${chartRight}" y2="${(chartTop + chartBottom) / 2}"></line>
      <line x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"></line>
    </g>
    ${lineMarkup}
    <g class="chart-labels">
      ${labelIndexes
        .map((index) => `<text x="${chartLeft + index * step}" y="${height - 8}">${labels[index] || ""}</text>`)
        .join("")}
    </g>
    <g class="multi-hover-layer">
      <line class="multi-hover-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"></line>
      ${series
        .map((item, index) => `<circle class="multi-hover-dot" r="5" style="stroke:${multiChartColors[index % multiChartColors.length]}"></circle>`)
        .join("")}
    </g>
  `;

  svg._multiChartData = {
    labels,
    series,
    pointsBySeries,
    chartLeft,
    chartRight,
    chartTop,
    chartBottom,
    step,
    width,
    height
  };

  svg.querySelectorAll(".multi-chart-line").forEach((line) => {
    const length = line.getTotalLength();
    line.style.setProperty("--line-length", length);
  });
}

function parseMultiLineSeries(value) {
  return value
    .split(";")
    .map((entry) => {
      const [name, rawValues] = entry.split(":");
      const values = (rawValues || "")
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
      return { name: (name || "").trim(), values };
    })
    .filter((item) => item.name && item.values.length > 1);
}

function setupMobileAccordions() {
  mobileAccordionItems.forEach((item) => {
    item.classList.add("is-mobile-accordion");
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-expanded", "false");

    item.addEventListener("click", () => toggleMobileAccordion(item));
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleMobileAccordion(item);
    });
  });
}

function setupExperienceMorph() {
  experienceTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateExperience(tab.dataset.experience));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateExperience(tab.dataset.experience);
    });
  });
}

function activateExperience(index) {
  experienceTabs.forEach((tab) => {
    const isActive = tab.dataset.experience === index;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  experiencePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.experiencePanel === index);
  });
}

function toggleMobileAccordion(item) {
  if (!mobileMedia.matches) return;

  const isOpen = item.classList.contains("is-open");
  const group = item.closest("#workflow") || item.closest(".credentials-band");

  group?.querySelectorAll(".is-mobile-accordion.is-open").forEach((openItem) => {
    if (openItem === item) return;
    openItem.classList.remove("is-open");
    openItem.setAttribute("aria-expanded", "false");
  });

  item.classList.toggle("is-open", !isOpen);
  item.setAttribute("aria-expanded", String(!isOpen));
}

function setupEmailActions() {
  emailActions.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const user = link.dataset.emailUser || "";
      const domain = link.dataset.emailDomain || "";
      const tld = link.dataset.emailTld || "";
      if (!user || !domain || !tld) return;
      window.location.href = `mailto:${user}@${domain}.${tld}`;
    });
  });
}

function setupExperienceModal() {
  detailButtons.forEach((button) => {
    button.addEventListener("click", () => openExperienceModal(button.dataset.modal));
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeExperienceModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExperienceModal();
  });
}

function openExperienceModal(key) {
  const detail = experienceDetails[key];
  if (!detail || !experienceModal || !modalTitle || !modalBody || !modalEyebrow) return;

  modalEyebrow.textContent = detail.eyebrow;
  modalTitle.textContent = detail.title;
  modalBody.innerHTML = detail.html;
  experienceModal.classList.add("is-open");
  experienceModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeExperienceModal() {
  if (!experienceModal) return;

  experienceModal.classList.remove("is-open");
  experienceModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function setupMultiChartTooltips() {
  multiLineCharts.forEach((svg) => {
    svg.addEventListener("pointermove", (event) => updateMultiChartTooltip(svg, event));
    svg.addEventListener("pointerleave", () => hideMultiChartTooltip(svg));
    svg.addEventListener("pointerdown", (event) => updateMultiChartTooltip(svg, event));
  });
}

function updateMultiChartTooltip(svg, event) {
  const data = svg._multiChartData;
  if (!data || !data.labels.length || !chartTooltip) return;

  const rect = svg.getBoundingClientRect();
  const xRatio = (event.clientX - rect.left) / rect.width;
  const chartX = xRatio * data.width;
  const index = Math.min(
    data.labels.length - 1,
    Math.max(0, Math.round((chartX - data.chartLeft) / data.step))
  );
  const x = data.chartLeft + index * data.step;
  const yValues = data.pointsBySeries.map((points) => points[index]?.y || data.chartBottom);
  const hoverLine = svg.querySelector(".multi-hover-line");
  const hoverDots = svg.querySelectorAll(".multi-hover-dot");

  if (hoverLine) {
    hoverLine.setAttribute("x1", x);
    hoverLine.setAttribute("x2", x);
  }

  hoverDots.forEach((dot, dotIndex) => {
    const point = data.pointsBySeries[dotIndex]?.[index];
    if (!point) return;
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
  });

  chartTooltip.innerHTML = `
    <strong>${data.labels[index]}</strong>
    ${data.series
      .map((item, seriesIndex) => {
        const color = multiChartColors[seriesIndex % multiChartColors.length];
        const value = item.values[index] || 0;
        return `<span><span><i style="background:${color}"></i>${item.name}</span><b>${formatNumber(value)}</b></span>`;
      })
      .join("")}
  `;

  const y = Math.min(...yValues);
  const pageX = rect.left + (x / data.width) * rect.width;
  const pageY = rect.top + (y / data.height) * rect.height;
  chartTooltip.style.left = `${Math.min(Math.max(pageX, 140), window.innerWidth - 140)}px`;
  chartTooltip.style.top = `${Math.max(pageY, 120)}px`;
  chartTooltip.classList.add("is-visible");
  svg.classList.add("is-hovering");
}

function hideMultiChartTooltip(svg) {
  svg.classList.remove("is-hovering");
  chartTooltip.classList.remove("is-visible");
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = Math.min(window.innerHeight * 1.18, 900);
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const labels = ["AI", "SEO", "GA4", "GSC", "Content", "Design", "n8n", "Data"];
  particles = Array.from({ length: window.innerWidth < 700 ? 18 : 30 }, (_, index) => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.18,
    size: Math.random() * 22 + 18,
    label: labels[index % labels.length],
    alpha: Math.random() * 0.18 + 0.08
  }));
}

function animateCanvas() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -80) particle.x = canvasWidth + 80;
    if (particle.x > canvasWidth + 80) particle.x = -80;
    if (particle.y < -80) particle.y = canvasHeight + 80;
    if (particle.y > canvasHeight + 80) particle.y = -80;

    ctx.beginPath();
    ctx.roundRect(particle.x, particle.y, particle.size * 2.8, particle.size, 12);
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(40, 125, 120, ${particle.alpha + 0.05})`;
    ctx.stroke();
    ctx.fillStyle = `rgba(25, 25, 23, ${particle.alpha + 0.15})`;
    ctx.font = "700 12px Inter, Arial, sans-serif";
    ctx.fillText(particle.label, particle.x + 12, particle.y + particle.size / 2 + 4);
  });

  if (!prefersReducedMotion) requestAnimationFrame(animateCanvas);
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", () => {
  updateProgress();
  resizeCanvas();
  charts.forEach((chart) => drawChart(chart));
  multiLineCharts.forEach((chart) => drawMultiLineChart(chart));
  runViewportAnimations();
});
document.addEventListener("pointermove", updateHeroMorph, { passive: true });

updateProgress();
resizeCanvas();
animateCanvas();
updateActiveGuide();
runViewportAnimations();
window.setInterval(() => {
  updateActiveGuide();
  runViewportAnimations();
}, 250);
