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
import { initCodeAnimation } from "./code-animation.js";
import { initContact } from "./contact.js";
import { initAiChat } from "./ai-chat.js";
import { initTheme } from "./theme.js";
import { initIntroExperience } from "./intro-experience.js";
import { initCursorEffect } from "./cursor-effect.js";
import { hideLoader, flashLoader } from "./loading-overlay.js";

const scrollAnimations = createScrollAnimations();
let openProjectVideoModal = () => { };
let projectVideoModalInitialized = false;


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
        alt: t("projects.thumbAlt", { title: localize(project.title) }),
        loading: "lazy",
        decoding: "async",
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
    videoEl.src = projectVideo;
    videoEl.load();
    dialog.hidden = false;
    document.body.classList.add("has-project-video-open");
    closeBtn?.focus();

    const playPromise = videoEl.play();
    if (playPromise?.catch) playPromise.catch(() => { });
  };

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
  let hiddenAt = 0;

  const resume = () => {
    flashLoader({ messageKey: "loader.resuming" });
    scrollAnimations.refresh();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = performance.now();
      return;
    }
    if (!isMobile()) return;
    if (performance.now() - hiddenAt > RESUME_THRESHOLD_MS) resume();
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && isMobile()) resume();
  });
}

/**
 * Inicializa a aplicação: configura i18n, tema, modal de vídeo, renderiza seções orientadas a dados e inicializa módulos de comportamento.
 * @returns {void}
 */
function init() {
  initI18n();
  initTheme();
  initProjectVideoModal();

  renderDataSections();

  // Os módulos abaixo dependem dos elementos data-driven já renderizados.
  initNav();
  scrollAnimations.init();
  initCodeAnimation();
  initContact();
  initAiChat();
  initIntroExperience();
  initCursorEffect();

  onLanguageChange(() => {
    renderDataSections();
  });

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  setupResumeHandling();
  dismissInitialLoader();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
