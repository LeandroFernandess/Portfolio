/**
 * main.js — Ponto de entrada da aplicação
 * ----------------------------------------------------------------
 * Renderiza as seções orientadas a dados (projetos, arquitetura,
 * segurança, skills) a partir de data.js e inicializa os módulos
 * de comportamento (nav, scroll, animação de código, contato, IA,
 * tema, intro e cursor decorativo).
 *
 * Renderizar via JS mantém o HTML enxuto e torna trivial editar
 * conteúdo em um único lugar (data.js), sem mexer em markup.
 */

import { projects, architecture, security, skills } from "./data.js";
import { initI18n, localize, onLanguageChange, t } from "./i18n.js";
import { initNav } from "./nav.js";
import { createScrollAnimations } from "./scroll-animations.js";
import { initTheme } from "./theme.js";
import { hideLoader, flashLoader, ensureLoaderHidden } from "./loading-overlay.js";
import { debugLog } from "./debug.js";

const scrollAnimations = createScrollAnimations();
let openProjectVideoModal = () => { };
let projectVideoModalInitialized = false;
function logApp(event, details = {}) {
  debugLog("app", event, {
    now: Math.round(performance.now()),
    visibilityState: document.visibilityState,
    readyState: document.readyState,
    ...details,
  });
}

const runWhenIdle = (task, timeout = 1800) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  window.setTimeout(task, 1);
};

function initLazyInteractionModule({ selector, events, importer, init, idle = true }) {
  const roots = Array.from(document.querySelectorAll(selector));
  if (!roots.length) return;

  let loadPromise = null;
  const load = () => {
    if (!loadPromise) {
      loadPromise = importer()
        .then((module) => {
          module[init]?.();
          return module;
        })
        .catch((error) => {
          logApp("lazy-module:error", { selector, message: error?.message ?? String(error) });
          throw error;
        });
    }
    return loadPromise;
  };

  const onFirstInteraction = () => {
    roots.forEach((root) => {
      events.forEach((eventName) => root.removeEventListener(eventName, onFirstInteraction));
    });
    load();
  };

  roots.forEach((root) => {
    events.forEach((eventName) => {
      const options = eventName === "submit" ? { once: true } : { once: true, passive: true };
      root.addEventListener(eventName, onFirstInteraction, options);
    });
  });

  if (idle) runWhenIdle(load, 3200);
}

function initDeferredModules() {
  runWhenIdle(() => {
    import("./code-animation.js").then(({ initCodeAnimation }) => initCodeAnimation());
  }, 1200);

  initLazyInteractionModule({
    selector: "#contactForm",
    events: ["focusin", "pointerdown", "submit"],
    importer: () => import("./contact.js"),
    init: "initContact",
  });

  initLazyInteractionModule({
    selector: "#aiChatForm",
    events: ["focusin", "pointerdown", "submit"],
    importer: () => import("./ai-chat.js"),
    init: "initAiChat",
  });

  import("./intro-experience.js").then(({ initIntroExperience }) => initIntroExperience());

  runWhenIdle(() => {
    import("./cursor-effect.js").then(({ initCursorEffect }) => initCursorEffect());
  }, 2600);
}

/**
 * Configura diagnósticos de ciclo de vida da página.
 * @returns {Object} Funções para marcar início e fim de retomada e obter tempo oculto.
 */
function setupLifecycleDiagnostics() {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const state = {
    hiddenAt: 0,
    lastResumeStartedAt: 0,
  };

  logApp("boot", {
    navigationType: navigationEntry?.type ?? null,
    activationStart: navigationEntry?.activationStart ?? null,
    wasDiscarded: document.wasDiscarded ?? false,
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      state.hiddenAt = performance.now();
    }

    logApp("visibilitychange", {
      hiddenFor: state.hiddenAt ? Math.round(performance.now() - state.hiddenAt) : 0,
    });
  });

  window.addEventListener("pageshow", (event) => {
    state.lastResumeStartedAt = performance.now();
    logApp("pageshow", {
      persisted: event.persisted,
      hiddenFor: state.hiddenAt ? Math.round(performance.now() - state.hiddenAt) : 0,
    });
  });

  window.addEventListener("pagehide", (event) => {
    logApp("pagehide", {
      persisted: event.persisted,
    });
  });

  return {
    markResumeStart(reason, details = {}) {
      state.lastResumeStartedAt = performance.now();
      logApp("resume:start", { reason, ...details });
    },
    markResumeSettled(reason, details = {}) {
      logApp("resume:settled", {
        reason,
        duration: Math.round(performance.now() - state.lastResumeStartedAt),
        ...details,
      });
    },
    getHiddenFor() {
      return state.hiddenAt ? Math.round(performance.now() - state.hiddenAt) : 0;
    },
  };
}


/**
 * Cria um elemento HTML com atributos e filhos de forma concisa.
 * @param {string} tag - O nome da tag do elemento.
 * @param {Object} [attrs={}] - Atributos do elemento.
 * @param {Array|Node} [children=[]] - Filhos do elemento.
 * @returns {HTMLElement} O elemento criado.
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null) return;
    node.append(child.nodeType ? child : document.createTextNode(child));
  });
  return node;
}

/** Monta a lista de tecnologias usadas em um projeto.
 * @param {Array} items - Lista de tecnologias.
 * @returns {HTMLElement} Elemento <ul> com as tecnologias listadas.
 */
function techList(items) {
  return el(
    "ul",
    { class: "tech-list" },
    items.map((t) => el("li", { class: "tech" }, t))
  );
}

/**
 * Monta os links de ação (com seta) de um projeto.
 * @param {Array} links - Lista de links do projeto.
 * @returns {HTMLElement} Elemento <div> com os links de ação.
 */
function projectLinks(links) {
  return el(
    "div",
    { class: "project-card__actions" },
    links.map((l) => {
      const isExternal = /^https?:\/\//i.test(l.href);
      return el(
        "a",
        {
          class: `link-arrow${l.muted ? " link-arrow--muted" : ""}`,
          href: l.href,
          ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        localize(l.label)
      );
    })
  );
}

/**
 * Monta a miniatura de um projeto.
 * @param {Object} project - Dados do projeto.
 * @returns {HTMLElement} Elemento <div> com a miniatura do projeto.
 */
function projectThumb(project) {
  const thumb = el("div", {
    class: `project-card__thumb${project.image ? " project-card__thumb--image" : ""}`,
  });

  if (project.image) {
    thumb.append(
      el("img", {
        class: "project-card__thumb-image",
        src: project.image,
        ...(project.imageSrcset ? { srcset: project.imageSrcset } : {}),
        ...(project.imageSizes ? { sizes: project.imageSizes } : {}),
        alt: t("projects.thumbAlt", { title: localize(project.title) }),
        loading: "lazy",
        decoding: "async",
        fetchpriority: "low",
      })
    );
    return thumb;
  }

  thumb.append(el("span", { class: "project-card__thumb-emoji", "aria-hidden": "true" }, project.emoji || "✦"));
  return thumb;
}

/**
 * Monta a linha do tempo de um projeto.
 * @param {Object} project - Dados do projeto.
 * @returns {HTMLElement|null} Elemento <div> com a linha do tempo ou null se não houver itens.
 */
function projectTimeline(project) {
  const items = [project.category, project.year].filter(Boolean);
  if (!items.length) return null;

  return el(
    "div",
    { class: "project-card__timeline", "aria-label": t("projects.timelineLabel") },
    items.map((item) => el("span", { class: "project-card__badge" }, localize(item)))
  );
}

/**
 * Anexa os manipuladores de eventos para os cards de projeto com vídeo.
 * @param {HTMLElement|Document} [root=document] - Elemento raiz para buscar os cards.
 */
function attachProjectVideoCards(root = document) {
  root.querySelectorAll(".project-card[data-project-video]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) return;
      openProjectVideoModal(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProjectVideoModal(card);
    });
  });
}

/**
 * Inicializa o modal compartilhado pelos cards de projeto com vídeo.
 * @returns {void}
 */
function initProjectVideoModal() {
  const dialog = document.querySelector("#projectVideoModal");
  if (!dialog) return;
  if (projectVideoModalInitialized) {
    attachProjectVideoCards();
    return;
  }
  projectVideoModalInitialized = true;

  const closeBtn = dialog.querySelector("[data-project-video-close]");
  const backdrop = dialog.querySelector("[data-project-video-backdrop]");
  const videoEl = dialog.querySelector("#projectVideoPlayer");
  const titleEl = dialog.querySelector("#projectVideoTitle");
  let previousFocus = null;

  const resetVideo = () => {
    if (!videoEl) return;
    logApp("video:reset", {
      readyState: videoEl.readyState,
    });
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  };

  const close = () => {
    resetVideo();
    dialog.hidden = true;
    document.body.classList.remove("has-project-video-open");
    previousFocus?.focus?.();
  };

  openProjectVideoModal = (card) => {
    const { projectVideo, projectTitle } = card.dataset;
    if (!projectVideo || !videoEl || !titleEl) return;

    previousFocus = document.activeElement;
    titleEl.textContent = projectTitle || t("projectModal.fallbackTitle");
    logApp("video:open", {
      projectTitle: projectTitle || null,
    });
    videoEl.src = projectVideo;
    videoEl.load();
    dialog.hidden = false;
    document.body.classList.add("has-project-video-open");
    closeBtn?.focus();

    const playPromise = videoEl.play();
    if (playPromise?.catch) playPromise.catch(() => { });
  };

  ["loadstart", "loadedmetadata", "loadeddata", "canplay", "playing", "pause", "emptied", "suspend"].forEach((eventName) => {
    videoEl?.addEventListener(eventName, () => {
      logApp(`video:${eventName}`, {
        readyState: videoEl.readyState,
        networkState: videoEl.networkState,
        paused: videoEl.paused,
      });
    });
  });

  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  attachProjectVideoCards();
}

/**
 * Renderiza a seção de projetos a partir dos dados em data.js.
 * @returns {void}
 */
function renderProjects() {
  const root = document.querySelector("#projectsGrid");
  if (!root) return;
  root.innerHTML = "";

  projects.forEach((p, i) => {
    const title = localize(p.title);
    const description = localize(p.description);
    const card = el("article", {
      class: `project-card${p.featured ? " project-card--featured" : ""}${p.video ? " project-card--interactive" : ""}`,
      "data-animate": "card",
      "data-animate-delay": String(i),
      ...(p.video
        ? {
          tabindex: "0",
          role: "button",
          "aria-label": t("projects.openVideo", { title }),
          "aria-haspopup": "dialog",
          dataset: {
            projectVideo: p.video,
            projectTitle: title,
          },
        }
        : {}),
    });

    if (p.featured) {
      const info = el("div", {}, [
        el("div", { class: "project-card__eyebrow" }, t("projects.featured")),
        el("h3", { class: "project-card__title" }, title),
        projectTimeline(p),
        el("p", { class: "project-card__text" }, description),
        techList(p.tech),
        projectLinks(p.links),
      ]);
      const thumb = projectThumb(p);
      card.append(el("div", { class: "project-card__featured-grid" }, [info, thumb]));
    } else {
      card.append(
        el("h3", { class: "project-card__title" }, title),
        projectTimeline(p),
        el("p", { class: "project-card__text" }, description),
        techList(p.tech),
        projectLinks(p.links)
      );
    }
    root.append(card);
  });

  attachCardGlow(root);
  attachProjectVideoCards(root);
}

/**
 * Renderiza a seção de arquitetura a partir dos dados em data.js.
 * @returns {void}
 */
function renderArchitecture() {
  const root = document.querySelector("#architectureGrid");
  if (!root) return;
  root.innerHTML = "";
  architecture.forEach((item, i) => {
    root.append(
      el("div", { class: "feature-card", "data-animate": "card", "data-animate-delay": String(i) }, [
        el("div", { class: "feature-card__icon" }, item.icon),
        el("h3", { class: "feature-card__title" }, localize(item.title)),
        el("p", { class: "feature-card__text" }, localize(item.text)),
      ])
    );
  });
}

/**
 * Renderiza a seção de segurança a partir dos dados em data.js.
 * @returns {void}
 */
function renderSecurity() {
  const root = document.querySelector("#securityList");
  if (!root) return;
  root.innerHTML = "";
  security.forEach((item, i) => {
    root.append(
      el("div", { class: "security-row", "data-animate": "card", "data-animate-delay": String(i) }, [
        el("div", { class: "security-row__icon" }, item.icon),
        el("div", {}, [
          el("h3", { class: "security-row__title" }, localize(item.title)),
          el("p", { class: "security-row__text" }, localize(item.text)),
        ]),
      ])
    );
  });
}

/**
 * Renderiza a seção de habilidades a partir dos dados em data.js.
 * @returns {void}
 */
function renderSkills() {
  const root = document.querySelector("#skillsList");
  if (!root) return;
  root.innerHTML = "";
  skills.forEach((s) => root.append(el("li", { class: "chip" }, s)));
}

/**
 * Renderiza as seções orientadas a dados (projetos, arquitetura, segurança, skills) a partir de data.js.
 * @returns {void}
 */
function renderDataSections() {
  renderSkills();
  renderProjects();
  renderArchitecture();
  renderSecurity();
}

/**
 * Adiciona o efeito de brilho que segue o cursor nos cartões de projeto.
 * Atualiza as variáveis CSS --mx/--my consumidas em components.css.
 * @param {HTMLElement} root O elemento raiz que contém os cartões de projeto.
 * @returns {void}
 */
function attachCardGlow(root) {
  root.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/**
 * Oculta o overlay de carregamento inicial quando os assets críticos
 * já foram baixados (evento `load`), com fallback caso ele já tenha
 * disparado antes da inicialização.
 * @returns {void}
 */
function dismissInitialLoader() {
  const finish = () => requestAnimationFrame(() => hideLoader());
  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish, { once: true });
  }
}

/**
 * Trata a retomada da página no mobile (volta de links externos,
 * troca de aba e restauração via bfcache). Mascara o re-render dos
 * efeitos pesados com um flash do overlay e recalcula as animações
 * de scroll para evitar estado visual "travado".
 * @returns {void}
 */
function setupResumeHandling() {
  const coarsePointer = window.matchMedia?.("(pointer: coarse)");
  const isMobile = () => Boolean(coarsePointer?.matches);
  const RESUME_THRESHOLD_MS = 1200;
  const RESUME_DEDUPE_WINDOW_MS = 900;
  let hiddenAt = 0;
  const diagnostics = setupLifecycleDiagnostics();
  const resumeState = {
    lastHandledAt: 0,
    lastSource: "",
    lastStrategy: "",
  };

  const getResumeContext = () => {
    const introDialog = document.querySelector("#professionalSolarSystem");
    const videoDialog = document.querySelector("#projectVideoModal");
    const videoEl = document.querySelector("#projectVideoPlayer");
    const loaderEl = document.querySelector("[data-app-loader]");
    const introOpen = document.body.classList.contains("has-intro-open") || Boolean(introDialog && !introDialog.hidden);
    const videoOpen = document.body.classList.contains("has-project-video-open") || Boolean(videoDialog && !videoDialog.hidden);
    const videoActive = Boolean(
      videoOpen &&
      videoEl &&
      (videoEl.currentSrc || videoEl.getAttribute("src"))
    );

    return {
      introOpen,
      videoOpen,
      videoActive,
      loaderActive: Boolean(loaderEl?.classList.contains("is-active")),
      needsHeavyResume: introOpen || videoOpen || videoActive,
    };
  };

  const settleResume = (reason, details = {}) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        diagnostics.markResumeSettled(reason, {
          activeAnimations: document.querySelectorAll("[data-animate]").length,
          ...details,
        });
      });
    });
  };

  const handlePageResume = (source, options = {}) => {
    const hiddenFor = options.hiddenFor ?? diagnostics.getHiddenFor();
    const context = getResumeContext();
    const strategy = options.forceHeavyResume || context.needsHeavyResume ? "heavy" : "light";
    const now = performance.now();

    if (now - resumeState.lastHandledAt < RESUME_DEDUPE_WINDOW_MS) {
      logApp("resume:deduped", {
        source,
        strategy,
        elapsed: Math.round(now - resumeState.lastHandledAt),
        persisted: Boolean(options.persisted),
        previousSource: resumeState.lastSource,
        previousStrategy: resumeState.lastStrategy,
      });
      if (strategy === "light") ensureLoaderHidden({ reason: `resume-deduped:${source}` });
      return;
    }

    resumeState.lastSource = source;
    resumeState.lastStrategy = strategy;
    resumeState.lastHandledAt = now;

    diagnostics.markResumeStart(source, {
      isMobile: isMobile(),
      hiddenFor,
      source,
      strategy,
      persisted: Boolean(options.persisted),
      introOpen: context.introOpen,
      videoOpen: context.videoOpen,
      videoActive: context.videoActive,
      loaderActive: context.loaderActive,
    });

    if (strategy === "heavy") {
      flashLoader({ messageKey: "loader.resuming", immediate: true });
    } else {
      ensureLoaderHidden({ reason: `resume-light:${source}` });
    }

    scrollAnimations.refresh();
    settleResume(source, { strategy, hiddenFor });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = performance.now();
      return;
    }
    if (!isMobile()) return;
    const hiddenFor = performance.now() - hiddenAt;
    logApp("resume:visibility-check", {
      hiddenFor: Math.round(hiddenFor),
      threshold: RESUME_THRESHOLD_MS,
      isMobile: isMobile(),
    });
    if (hiddenFor > RESUME_THRESHOLD_MS) {
      handlePageResume("visibilitychange", { hiddenFor: Math.round(hiddenFor) });
    }
  });

  window.addEventListener("pageshow", (event) => {
    logApp("resume:pageshow-check", {
      persisted: event.persisted,
      isMobile: isMobile(),
    });
    if (event.persisted && isMobile()) {
      handlePageResume("pageshow", {
        persisted: true,
        hiddenFor: Math.round(performance.now() - hiddenAt),
      });
      return;
    }

    if (!event.persisted) ensureLoaderHidden({ reason: "pageshow:fresh" });
  });
}

/**
 * Inicializa a aplicação: configura i18n, tema, modal de vídeo, renderiza seções orientadas a dados e inicializa módulos de comportamento.
 * @returns {void}
 */
function init() {
  logApp("init:start");
  initI18n();
  initTheme();
  initProjectVideoModal();

  renderDataSections();

  // Os módulos abaixo dependem dos elementos data-driven já renderizados.
  initNav();
  scrollAnimations.init();
  initDeferredModules();

  onLanguageChange(() => {
    renderDataSections();
  });

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  setupResumeHandling();
  dismissInitialLoader();
  logApp("init:done");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
