/**
 * main.js
 * ----------------------------------------------------------------
 * Script principal do portfólio, responsável por inicializar a
 * interface, carregar módulos sob demanda e gerenciar eventos globais.
 *
 * Este arquivo importa funções de outros módulos, como i18n.js,
 * nav.js, scroll-animations.js, theme.js, loading-overlay.js e
 * debug.js. Ele também define funções auxiliares para criar elementos
 * DOM, renderizar listas de projetos e gerenciar o estado da aplicação.
 */

import {
  projects as e,
  architecture as t,
  security as r,
  skills as o,
} from "./data.js";
import {
  initI18n as a,
  localize as n,
  onLanguageChange as i,
  t as c,
} from "./i18n.js";
import { initNav as d } from "./nav.js";
import { createScrollAnimations as s } from "./scroll-animations.js";
import { initTheme as l } from "./theme.js";
import {
  hideLoader as u,
  flashLoader as p,
  ensureLoaderHidden as m,
} from "./loading-overlay.js";
import { debugLog as h } from "./debug.js";

const v = s();
let f = () => {},
  y = !1;

/**
 * Inicializa o portfólio, configurando idioma, navegação, animações e eventos.
 * @param {*} e Evento ou ação que disparou a inicialização
 * @param {*} t Opções adicionais para configuração
 */
function g(e, t = {}) {
  h("app", e, {
    now: Math.round(performance.now()),
    visibilityState: document.visibilityState,
    readyState: document.readyState,
    ...t,
  });
}

const S = (e, t = 1800) => {
  "requestIdleCallback" in window
    ? window.requestIdleCallback(e, { timeout: t })
    : window.setTimeout(e, 1);
};

/**
 * Inicializa um módulo preguiçosamente, adicionando listeners e carregando sob demanda.
 * @param {*} param0 Objeto de configuração do módulo
 * @param {string} param0.selector Seletor CSS para os elementos que dispararão o carregamento
 * @param {string[]} param0.events Eventos que dispararão o carregamento
 * @param {Function} param0.importer Função que importa o módulo dinamicamente
 * @param {string} param0.init Nome da função de inicialização do módulo
 * @param {boolean} [param0.idle=true] Se o módulo deve ser carregado durante o tempo ocioso
 * @returns {void}
 */
function j({ selector: e, events: t, importer: r, init: o, idle: a = !0 }) {
  const n = Array.from(document.querySelectorAll(e));
  if (!n.length) return;
  let i = null;
  const c = () => (
      i ||
        (i = r()
          .then((e) => (e[o]?.(), e))
          .catch((t) => {
            throw (
              g("lazy-module:error", {
                selector: e,
                message: t?.message ?? String(t),
              }),
              t
            );
          })),
      i
    ),
    d = () => {
      (n.forEach((e) => {
        t.forEach((t) => e.removeEventListener(t, d));
      }),
        c());
    };
  (n.forEach((e) => {
    t.forEach((t) => {
      const r = "submit" === t ? { once: !0 } : { once: !0, passive: !0 };
      e.addEventListener(t, d, r);
    });
  }),
    a && S(c, 3200));
}

/**
 * Cria um elemento DOM com atributos e filhos especificados.
 * @param {string} e Nome da tag do elemento
 * @param {Object} t Atributos e propriedades do elemento
 * @param {Array|Node} r Filhos do elemento
 * @returns {HTMLElement} O elemento criado
 */
function w(e, t = {}, r = []) {
  const o = document.createElement(e);
  for (const [e, r] of Object.entries(t))
    "class" === e
      ? (o.className = r)
      : "dataset" === e
        ? Object.assign(o.dataset, r)
        : "html" === e
          ? (o.innerHTML = r)
          : o.setAttribute(e, r);
  return (
    (Array.isArray(r) ? r : [r]).forEach((e) => {
      null != e && o.append(e.nodeType ? e : document.createTextNode(e));
    }),
    o
  );
}

/**
 * Cria uma lista de tecnologias.
 * @param {string[]} e Array de nomes de tecnologias
 * @returns {HTMLElement} Elemento <ul> contendo as tecnologias
 */
function b(e) {
  return w(
    "ul",
    { class: "tech-list" },
    e.map((e) => w("li", { class: "tech" }, e)),
  );
}

/**
 * Cria uma lista de ações para um projeto.
 * @param {Array} e Array de objetos de ação do projeto
 * @returns {HTMLElement} Elemento <div> contendo as ações do projeto
 */
function _(e) {
  return w(
    "div",
    { class: "project-card__actions" },
    e.map((e) => {
      const t = /^https?:\/\//i.test(e.href);
      return w(
        "a",
        {
          class: "link-arrow" + (e.muted ? " link-arrow--muted" : ""),
          href: e.href,
          ...(t ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        n(e.label),
      );
    }),
  );
}

/**
 * Cria uma linha do tempo para um projeto.
 * @param {Object} e Objeto do projeto
 * @param {string} e.category Categoria do projeto
 * @param {string} e.year Ano do projeto
 * @returns {HTMLElement|null} Elemento <div> contendo a linha do tempo ou null se não houver informações
 */
function E(e) {
  const t = [e.category, e.year].filter(Boolean);
  return t.length
    ? w(
        "div",
        {
          class: "project-card__timeline",
          "aria-label": c("projects.timelineLabel"),
        },
        t.map((e) => w("span", { class: "project-card__badge" }, n(e))),
      )
    : null;
}

/**
 * Inicializa os vídeos dos projetos, adicionando listeners para reprodução.
 * @param {Document|HTMLElement} e Elemento raiz para buscar os vídeos
 */
function L(e = document) {
  e.querySelectorAll(".project-card[data-project-video]").forEach((e) => {
    e.addEventListener("click", (t) => {
      (t.target instanceof Element && t.target.closest("a")) || f(e);
    });
  });
}

/**
 * Inicializa o modal de vídeo do projeto, configurando eventos e controles.
 * @returns {void}
 */
function k() {
  const e = document.querySelector("#projectVideoModal");
  if (!e) return;
  if (y) return void L();
  y = !0;
  const t = e.querySelector("[data-project-video-close]"),
    r = e.querySelector("[data-project-video-backdrop]"),
    o = e.querySelector("#projectVideoPlayer"),
    a = e.querySelector("#projectVideoTitle");
  let n = null;
  const i = () => {
    (o &&
      (g("video:reset", { readyState: o.readyState }),
      o.pause(),
      o.removeAttribute("src"),
      o.load()),
      (e.hidden = !0),
      document.body.classList.remove("has-project-video-open"),
      n?.focus?.());
  };
  ((f = (r) => {
    const { projectVideo: i, projectTitle: d } = r.dataset;
    if (!i || !o || !a) return;
    ((n = document.activeElement),
      (a.textContent = d || c("projectModal.fallbackTitle")),
      g("video:open", { projectTitle: d || null }),
      (o.src = i),
      o.load(),
      (e.hidden = !1),
      document.body.classList.add("has-project-video-open"),
      t?.focus());
    const s = o.play();
    s?.catch && s.catch(() => {});
  }),
    [
      "loadstart",
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "playing",
      "pause",
      "emptied",
      "suspend",
    ].forEach((e) => {
      o?.addEventListener(e, () => {
        g(`video:${e}`, {
          readyState: o.readyState,
          networkState: o.networkState,
          paused: o.paused,
        });
      });
    }),
    t?.addEventListener("click", i),
    r?.addEventListener("click", i),
    e.addEventListener("keydown", (e) => {
      "Escape" === e.key && i();
    }),
    L());
}

/**
 * Inicializa o grid de projetos, criando os elementos do DOM para cada projeto.
 * @returns {void}
 */
function q() {
  const t = document.querySelector("#projectsGrid");
  t &&
    ((t.innerHTML = ""),
    e.forEach((e, r) => {
      const o = n(e.title),
        a = n(e.description),
        i = w("article", {
          class: `project-card${e.featured ? " project-card--featured" : ""}${e.video ? " project-card--interactive" : ""}`,
          "data-animate": "card",
          "data-animate-delay": String(r),
          ...(e.video
            ? { dataset: { projectVideo: e.video, projectTitle: o } }
            : {}),
        });
      if (e.featured) {
        const t = w("div", {}, [
            w(
              "div",
              { class: "project-card__eyebrow" },
              c("projects.featured"),
            ),
            w("h3", { class: "project-card__title" }, o),
            E(e),
            w("p", { class: "project-card__text" }, a),
            b(e.tech),
            _(e.links),
          ]),
          r = (function (e) {
            const t = w("div", {
              class:
                "project-card__thumb" +
                (e.image ? " project-card__thumb--image" : ""),
            });
            return e.image
              ? (t.append(
                  w("img", {
                    class: "project-card__thumb-image",
                    src: e.image,
                    ...(e.imageSrcset ? { srcset: e.imageSrcset } : {}),
                    ...(e.imageSizes ? { sizes: e.imageSizes } : {}),
                    alt: c("projects.thumbAlt", { title: n(e.title) }),
                    loading: "lazy",
                    decoding: "async",
                    fetchpriority: "low",
                  }),
                ),
                t)
              : (t.append(
                  w(
                    "span",
                    {
                      class: "project-card__thumb-emoji",
                      "aria-hidden": "true",
                    },
                    e.emoji || "✦",
                  ),
                ),
                t);
          })(e);
        i.append(w("div", { class: "project-card__featured-grid" }, [t, r]));
      } else
        i.append(
          w("h3", { class: "project-card__title" }, o),
          E(e),
          w("p", { class: "project-card__text" }, a),
          b(e.tech),
          _(e.links),
        );
      t.append(i);
    }),
    (function (e) {
      e.querySelectorAll(".project-card").forEach((e) => {
        e.addEventListener("mousemove", (t) => {
          const r = e.getBoundingClientRect();
          (e.style.setProperty("--mx", t.clientX - r.left + "px"),
            e.style.setProperty("--my", t.clientY - r.top + "px"));
        });
      });
    })(t),
    L(t));
}

/**
 * Inicializa o grid de arquitetura, criando os elementos do DOM para cada item.
 * @returns {void}
 */
function M() {
  (!(function () {
    const e = document.querySelector("#skillsList");
    e &&
      ((e.innerHTML = ""),
      o.forEach((t) => e.append(w("li", { class: "chip" }, t))));
  })(),
    q(),
    (function () {
      const e = document.querySelector("#architectureGrid");
      e &&
        ((e.innerHTML = ""),
        t.forEach((t, r) => {
          e.append(
            w(
              "div",
              {
                class: "feature-card",
                "data-animate": "card",
                "data-animate-delay": String(r),
              },
              [
                w("div", { class: "feature-card__icon" }, t.icon),
                w("h3", { class: "feature-card__title" }, n(t.title)),
                w("p", { class: "feature-card__text" }, n(t.text)),
              ],
            ),
          );
        }));
    })(),
    (function () {
      const e = document.querySelector("#securityList");
      e &&
        ((e.innerHTML = ""),
        r.forEach((t, r) => {
          e.append(
            w(
              "div",
              {
                class: "security-row",
                "data-animate": "card",
                "data-animate-delay": String(r),
              },
              [
                w("div", { class: "security-row__icon" }, t.icon),
                w("div", {}, [
                  w("h3", { class: "security-row__title" }, n(t.title)),
                  w("p", { class: "security-row__text" }, n(t.text)),
                ]),
              ],
            ),
          );
        }));
    })());
}

/**
 * Inicializa o monitoramento de visibilidade e navegação da página.
 * @returns {void}
 */
function F() {
  const e = window.matchMedia?.("(pointer: coarse)"),
    t = () => Boolean(e?.matches);
  let r = 0;
  const o = (function () {
      const e = performance.getEntriesByType("navigation")[0],
        t = { hiddenAt: 0, lastResumeStartedAt: 0 };
      return (
        g("boot", {
          navigationType: e?.type ?? null,
          activationStart: e?.activationStart ?? null,
          wasDiscarded: document.wasDiscarded ?? !1,
        }),
        document.addEventListener("visibilitychange", () => {
          ("hidden" === document.visibilityState &&
            (t.hiddenAt = performance.now()),
            g("visibilitychange", {
              hiddenFor: t.hiddenAt
                ? Math.round(performance.now() - t.hiddenAt)
                : 0,
            }));
        }),
        window.addEventListener("pageshow", (e) => {
          ((t.lastResumeStartedAt = performance.now()),
            g("pageshow", {
              persisted: e.persisted,
              hiddenFor: t.hiddenAt
                ? Math.round(performance.now() - t.hiddenAt)
                : 0,
            }));
        }),
        window.addEventListener("pagehide", (e) => {
          g("pagehide", { persisted: e.persisted });
        }),
        {
          markResumeStart(e, r = {}) {
            ((t.lastResumeStartedAt = performance.now()),
              g("resume:start", { reason: e, ...r }));
          },
          markResumeSettled(e, r = {}) {
            g("resume:settled", {
              reason: e,
              duration: Math.round(performance.now() - t.lastResumeStartedAt),
              ...r,
            });
          },
          getHiddenFor: () =>
            t.hiddenAt ? Math.round(performance.now() - t.hiddenAt) : 0,
        }
      );
    })(),
    a = { lastHandledAt: 0, lastSource: "", lastStrategy: "" },
    n = (e, r = {}) => {
      const n = r.hiddenFor ?? o.getHiddenFor(),
        i = (() => {
          const e = document.querySelector("#professionalSolarSystem"),
            t = document.querySelector("#projectVideoModal"),
            r = document.querySelector("#projectVideoPlayer"),
            o = document.querySelector("[data-app-loader]"),
            a =
              document.body.classList.contains("has-intro-open") ||
              Boolean(e && !e.hidden),
            n =
              document.body.classList.contains("has-project-video-open") ||
              Boolean(t && !t.hidden),
            i = Boolean(n && r && (r.currentSrc || r.getAttribute("src")));
          return {
            introOpen: a,
            videoOpen: n,
            videoActive: i,
            loaderActive: Boolean(o?.classList.contains("is-active")),
            needsHeavyResume: a || n || i,
          };
        })(),
        c = r.forceHeavyResume || i.needsHeavyResume ? "heavy" : "light",
        d = performance.now();
      if (d - a.lastHandledAt < 900)
        return (
          g("resume:deduped", {
            source: e,
            strategy: c,
            elapsed: Math.round(d - a.lastHandledAt),
            persisted: Boolean(r.persisted),
            previousSource: a.lastSource,
            previousStrategy: a.lastStrategy,
          }),
          void ("light" === c && m({ reason: `resume-deduped:${e}` }))
        );
      ((a.lastSource = e),
        (a.lastStrategy = c),
        (a.lastHandledAt = d),
        o.markResumeStart(e, {
          isMobile: t(),
          hiddenFor: n,
          source: e,
          strategy: c,
          persisted: Boolean(r.persisted),
          introOpen: i.introOpen,
          videoOpen: i.videoOpen,
          videoActive: i.videoActive,
          loaderActive: i.loaderActive,
        }),
        "heavy" === c
          ? p({ messageKey: "loader.resuming", immediate: !0 })
          : m({ reason: `resume-light:${e}` }),
        v.refresh(),
        ((e, t = {}) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              o.markResumeSettled(e, {
                activeAnimations:
                  document.querySelectorAll("[data-animate]").length,
                ...t,
              });
            });
          });
        })(e, { strategy: c, hiddenFor: n }));
    };
  (document.addEventListener("visibilitychange", () => {
    if ("hidden" === document.visibilityState)
      return void (r = performance.now());
    if (!t()) return;
    const e = performance.now() - r;
    (g("resume:visibility-check", {
      hiddenFor: Math.round(e),
      threshold: 1200,
      isMobile: t(),
    }),
      e > 1200 && n("visibilitychange", { hiddenFor: Math.round(e) }));
  }),
    window.addEventListener("pageshow", (e) => {
      (g("resume:pageshow-check", { persisted: e.persisted, isMobile: t() }),
        e.persisted && t()
          ? n("pageshow", {
              persisted: !0,
              hiddenFor: Math.round(performance.now() - r),
            })
          : e.persisted || m({ reason: "pageshow:fresh" }));
    }));
}

/**
 * Inicializa o portfólio, configurando idioma, navegação, animações e eventos.
 * @param {*} e Evento ou ação que disparou a inicialização
 * @param {*} t Opções adicionais para configuração
 */
function T() {
  (g("init:start"),
    a(),
    l(),
    k(),
    M(),
    d(),
    v.init(),
    S(() => {
      import("./code-animation.js").then(({ initCodeAnimation: e }) => e());
    }, 1200),
    j({
      selector: "#contactForm",
      events: ["focusin", "pointerdown", "submit"],
      importer: () => import("./contact.js"),
      init: "initContact",
    }),
    j({
      selector: "#aiChatForm",
      events: ["focusin", "pointerdown", "submit"],
      importer: () => import("./ai-chat.js"),
      init: "initAiChat",
    }),
    import("./intro-experience.js").then(({ initIntroExperience: e }) => e()),
    S(() => {
      import("./cursor-effect.js").then(({ initCursorEffect: e }) => e());
    }, 2600),
    i(() => {
      M();
    }));
  const e = document.querySelector("#year");
  (e && (e.textContent = String(new Date().getFullYear())),
    F(),
    (function () {
      const e = () => requestAnimationFrame(() => u());
      "complete" === document.readyState
        ? e()
        : window.addEventListener("load", e, { once: !0 });
    })(),
    g("init:done"));
}
"loading" === document.readyState
  ? document.addEventListener("DOMContentLoaded", T)
  : T();
