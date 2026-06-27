/**
 * scroll-animations.js
 * ----------------------------------------------------------------
 * Módulo responsável por gerenciar animações baseadas em rolagem.
 *
 * Este arquivo define a função createScrollAnimations, que cria e
 * gerencia animações de elementos na página com base na posição de
 * rolagem do usuário. Ele utiliza IntersectionObserver para detectar
 * quando os elementos entram ou saem da viewport, e aplica efeitos
 * visuais como opacidade, transformação e digitação simulada.
 *
 * O módulo também considera preferências de acessibilidade, como
 * "prefers-reduced-motion", e ajusta o comportamento das animações
 * de acordo com as capacidades do dispositivo do usuário.
 */

import { getCurrentLanguage as e, onLanguageChange as t } from "./i18n.js";

/**
 * Retorna o conteúdo de um "metaphor" baseado no idioma atual.
 * @param {string} e - O identificador do "metaphor".
 * @returns {string} - O conteúdo do "metaphor" no idioma atual.
 */
const n = {
  terminal: {
    "pt-BR": "$ python -m streamlit run portfolio.py",
    "en-US": "$ python -m streamlit run portfolio.py",
  },
  config: {
    "pt-BR": [
      "dev = {",
      '    "nome": "Leandro",',
      '    "papel": "Desenvolvedor Python",',
      '    "stack": ["Python", "SQL", "Streamlit"],',
      "}",
    ].join("\n"),
    "en-US": [
      "profile = {",
      '    "name": "Leandro",',
      '    "role": "Python Developer",',
      '    "stack": ["Python", "SQL", "Streamlit"],',
      "}",
    ].join("\n"),
  },
  ide: {
    "pt-BR": "~/workspace $ python -m flask --app app run",
    "en-US": "~/workspace $ python -m flask --app app run",
  },
  compile: {
    "pt-BR": [
      "> carregando módulos Python…",
      "✓ app pronto em http://127.0.0.1:8000",
    ].join("\n"),
    "en-US": [
      "> loading Python modules…",
      "✓ app ready on http://127.0.0.1:8000",
    ].join("\n"),
  },
  checklist: {
    "pt-BR": [
      "# executando auditoria de segurança",
      "✓ owasp-top-10  ✓ crypto  ✓ defense-in-depth",
    ].join("\n"),
    "en-US": [
      "# running security audit",
      "✓ owasp-top-10  ✓ crypto  ✓ defense-in-depth",
    ].join("\n"),
  },
  save: {
    "pt-BR": "> salvando contact.json … concluído ✓",
    "en-US": "> saving contact.json … done ✓",
  },
};
const r = (e, t = 0, n = 1) => (e < t ? t : e > n ? n : e);

/**
 * Retorna o conteúdo de um "metaphor" baseado no idioma atual.
 * @param {string} t - O identificador do "metaphor".
 * @returns {string} - O conteúdo do "metaphor" no idioma atual.
 */
function o(t) {
  const o = n[t];
  return o ? (o[e()] ?? o["pt-BR"] ?? Object.values(o)[0] ?? "") : "";
}

/**
 * Calcula o progresso de uma animação com base na posição do elemento e no deslocamento.
 * @param {*} e - O elemento alvo da animação.
 * @param {*} t - A posição de referência para o cálculo do progresso.
 * @param {*} n - Um fator de ajuste opcional.
 * @returns {number} - O progresso da animação, limitado entre 0 e 1.
 */
function c(e, t, n = 0) {
  const o = e.height || 1,
    c = t - e.top,
    a = r(c / (t + o) - 0.05 * n);
  return a < 0.32 ? r(a / 0.32) : a <= 0.7 ? 1 : r(1 - (a - 0.7) / (1 - 0.7));
}

/**
 * Cria e gerencia animações baseadas no scroll da página.
 * @returns {Object} - Um objeto contendo métodos para controlar as animações.
 */
export function createScrollAnimations() {
  const e = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    n = window.matchMedia("(pointer: coarse)").matches,
    a = e || n,
    s =
      !a &&
      "CSS" in window &&
      "function" == typeof CSS.supports &&
      CSS.supports("animation-timeline: view()");
  let i = [],
    l = [];
  const d = new Set();
  let p = null,
    u = !1,
    m = 0,
    f = window.scrollY <= 4,
    h = 0,
    y = window.innerHeight,
    w = y;
  const g = document.querySelector(".ambient"),
    S = document.querySelector("#home");
  function v() {
    ((y = window.innerHeight), (w = S?.getBoundingClientRect().height || y));
  }
  /**
   * Inicializa os elementos animados na página, configurando seus estados iniciais.
   * @returns {void}
   */
  function E() {
    ((i = Array.from(document.querySelectorAll("[data-animate]")).map((e) => ({
      el: e,
      type: e.dataset.animate || "text",
      delay: Number(e.dataset.animateDelay) || 0,
      settled: !1,
    }))),
      (l = []),
      document.querySelectorAll("[data-metaphor]").forEach((e) => {
        const t = (function (e) {
          const t = e.dataset.metaphor,
            n = o(t);
          if (!n) return null;
          let r = e.querySelector(":scope > .metaphor");
          if (!r) {
            ((r = document.createElement("div")),
              (r.className = "metaphor"),
              r.setAttribute("aria-hidden", "true"));
            const t = document.createElement("pre");
            t.className = "metaphor__code";
            const n = document.createElement("code"),
              o = document.createElement("span");
            ((o.className = "metaphor__caret"),
              t.append(n, o),
              r.append(t),
              e.prepend(r));
          }
          return {
            el: r,
            code: r.querySelector("code"),
            caret: r.querySelector(".metaphor__caret"),
            full: n,
            section: e,
          };
        })(e);
        t && l.push(t);
      }));
  }
  /**
   * Atualiza o progresso da animação para um elemento específico.
   * @param {*} e - O elemento da animação.
   * @param {number} t - O progresso da animação, entre 0 e 1.
   */
  function C(e, t) {
    s || e.el.style.setProperty("--progress", t.toFixed(4));
    const n = t > 0.001 && t < 0.999;
    n && e.settled
      ? ((e.el.style.willChange = "transform, opacity"), (e.settled = !1))
      : n || e.settled || ((e.el.style.willChange = ""), (e.settled = !0));
  }
  /**
   * Atualiza o conteúdo do elemento "metaphor" com base no progresso da animação.
   * @param {*} e - O elemento "metaphor".
   * @param {number} t - O progresso da animação, entre 0 e 1.
   */
  function _(e, t) {
    const n = e.full.length,
      o = Math.round(r(t) * n),
      c = e.full.slice(0, o);
    e.code.textContent !== c && (e.code.textContent = c);
    const a = o === n;
    ((e.caret.style.opacity = 0 === o ? "0" : "1"),
      e.caret.classList.toggle("is-idle", a));
  }
  /**
   * Calcula o progresso da animação para um elemento específico, considerando
   * a seção e o deslocamento.
   * @param {*} e - O elemento da animação.
   * @param {*} t - O retângulo delimitador da seção.
   * @param {*} n - A altura da janela.
   * @param {*} o - O timestamp atual.
   * @returns {number} - O progresso da animação, entre 0 e 1.
   */
  function x(e, t, n, o) {
    const a = c(t, n, 0);
    return "home" !== e.section.id
      ? a
      : a *
          (function (e) {
            if (!f) return 1;
            h || (h = e);
            const t = r((e - h) / 1100);
            return t >= 1 || window.scrollY > 4 ? ((f = !1), 1) : t;
          })(o);
  }
  /**
   * Atualiza as animações de rolagem, calculando o progresso e aplicando
   * transformações aos elementos animados.
   * @param {number} e - O timestamp atual, usado para calcular o progresso da animação.
   */
  function L(e = performance.now()) {
    const t = [];
    d.forEach((e) => {
      t.push([e, e.el.getBoundingClientRect()]);
    });
    const n = [];
    l.forEach((e) => {
      n.push([e, e.section.getBoundingClientRect()]);
    });
    const o = window.scrollY;
    for (const [e, n] of t) C(e, c(n, y, e.delay));
    for (const [t, o] of n) _(t, x(t, o, y, e));
    (!(function (e) {
      if (!g || !S) return;
      const t = 20 * (2 * r(e / w) - 1);
      g.style.transform = `translate3d(0, ${t.toFixed(2)}px, 0)`;
    })(o),
      (u = !1),
      f && j());
  }
  /**
   * Solicita uma atualização de animação, garantindo que apenas uma chamada
   * seja feita por frame.
   * @returns {void}
   */
  function j() {
    u || ((u = !0), (m = requestAnimationFrame(L)));
  }
  /**
   * Reinicializa o conteúdo dos elementos com "metaphor", atualizando o
   * texto e o estado da animação.
   * @returns {void}
   */
  function B() {
    (i.forEach((e) => e.el.style.setProperty("--progress", "1")),
      l.forEach((e) => {
        ((e.full = o(e.section.dataset.metaphor)),
          (e.code.textContent = e.full),
          (e.caret.style.opacity = "0"));
      }));
  }
  /**
   * Inicializa o monitoramento de visibilidade dos elementos animados,
   * utilizando IntersectionObserver para detectar quando eles entram ou
   * saem da viewport.
   * @returns {void}
   */
  function R() {
    ((p = new IntersectionObserver(
      (e) => {
        (e.forEach((e) => {
          const t = e.target.__sa;
          t &&
            (e.isIntersecting
              ? d.add(t)
              : (d.delete(t),
                C(t, 0),
                s || t.el.style.setProperty("--progress", "0")));
        }),
          j());
      },
      { rootMargin: "20% 0px 20% 0px", threshold: [0, 0.01, 1] },
    )),
      i.forEach((e) => {
        ((e.el.__sa = e), p.observe(e.el));
      }));
  }
  /**
   * Reinicializa as animações de rolagem, desconectando observadores e
   * limpando estados.
   * @returns {void}
   */
  function P() {
    (p && p.disconnect(),
      d.clear(),
      E(),
      v(),
      s && document.documentElement.classList.add("scroll-native"),
      a ? B() : (R(), j()));
  }
  /**
   * Manipula eventos de redimensionamento, recalculando dimensões e
   * reinicializando animações.
   * @returns {void}
   */
  function q() {
    (v(), j());
  }
  t(() => {
    l.length && P();
  });
  const k = {
    init: function () {
      return (
        E(),
        v(),
        s && document.documentElement.classList.add("scroll-native"),
        a
          ? (B(), k)
          : (R(),
            window.addEventListener("scroll", j, { passive: !0 }),
            window.addEventListener("resize", q, { passive: !0 }),
            j(),
            k)
      );
    },
    destroy: function () {
      (window.removeEventListener("scroll", j),
        window.removeEventListener("resize", q),
        m && cancelAnimationFrame(m),
        p && p.disconnect(),
        d.clear(),
        i.forEach((e) => {
          (delete e.el.__sa, (e.el.style.willChange = ""));
        }));
    },
    refresh: P,
  };
  return k;
}
