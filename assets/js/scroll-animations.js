/**
 * scroll-animations.js — Engine de animações bidirecionais por scroll
 * ================================================================
 * O site é "construído" conforme o usuário desce e "desconstruído"
 * conforme sobe. Cada elemento [data-animate] tem um PROGRESSO 0→1
 * derivado diretamente da sua posição no viewport — sem timers.
 *
 * Como o progresso vem da posição de scroll, a velocidade da
 * animação é naturalmente proporcional à velocidade do scroll
 * (rolar rápido = transição rápida), e é simétrica nos dois
 * sentidos sem nenhum código extra.
 *
 * --------------------------------------------------------------
 * Estratégia de renderização (2 caminhos):
 *
 *  1. NATIVO — quando o browser suporta `animation-timeline: view()`
 *     (Chrome/Edge 115+), adicionamos a classe `.scroll-native` no
 *     <html> e o CSS faz tudo na thread de composição (off-main).
 *     O JS só cuida do parallax do hero e das metáforas (typewriter).
 *
 *  2. FALLBACK rAF — quando não há suporte (ex.: Safari / iPhone SE,
 *     nosso baseline), o JS escreve `--progress` em cada elemento e
 *     o CSS deriva transform/opacity a partir dessa variável. Uma
 *     única escrita de variável por elemento por frame = barato.
 *
 * Performance:
 *  - Só `transform` e `opacity` são animados (GPU-friendly). `blur`
 *    é usado apenas no tipo "image" (poucos), conforme especificado.
 *  - Padrão read-batch / write-batch: todas as leituras de layout
 *    (getBoundingClientRect) acontecem antes de qualquer escrita,
 *    evitando layout thrashing.
 *  - O scroll listener é throttled a 1 atualização por frame via
 *    requestAnimationFrame. Nunca setTimeout/setInterval.
 *  - Um IntersectionObserver mantém o "conjunto ativo": só medimos
 *    elementos perto do viewport, não a página inteira a cada frame.
 *  - `will-change` é ligado apenas enquanto 0<progresso<1 e removido
 *    quando o elemento assenta (0 ou 1), liberando memória da GPU.
 *
 * Acessibilidade:
 *  - Com `prefers-reduced-motion`, desligamos o scroll-driven: todo
 *    conteúdo fica visível (progresso=1) e as metáforas aparecem
 *    estáticas. Sem transforms; só fades curtos (no CSS).
 *  - Fail-safe: o CSS usa `--progress` com default 1 (visível). Se o
 *    JS falhar, nada fica escondido permanentemente.
 *
 * Arquitetura: módulo isolado, zero acoplamento. A interface é 100%
 * declarativa via data-attributes:
 *    data-animate="text|card|line|image"   → tipo de animação
 *    data-animate-delay="N"                 → stagger dentro do grupo
 *    data-metaphor="terminal|config|..."    → metáfora de construção
 * ================================================================ */

import { getCurrentLanguage, onLanguageChange } from "./i18n.js";

/**
 * Configurações de tempo para as metáforas de "construção" (typewriter).
 * BUILD: progresso de 0 a 1 durante a "construção" (digitando).
 * HOLD_END: mantém progresso=1 por um tempo, mesmo após "construção".
 * STAGGER_STEP: atraso incremental por elemento dentro do mesmo grupo.
 * PARALLAX_RANGE: deslocamento máximo em pixels para o parallax do hero.
 * HERO_INTRO_DURATION: duração da introdução do hero (tempo para progresso ir de 0 a 1).
 * Esses valores foram ajustados empiricamente para um ritmo agradável, mas
 * podem ser facilmente modificados para experimentar diferentes sensações.
 */
const BUILD = 0.32;
const HOLD_END = 0.7;
const STAGGER_STEP = 0.05;
const PARALLAX_RANGE = 20;
const HERO_INTRO_DURATION = 1100;

/**
 * Metáforas de "construção" por seção. Texto leve em monospace,
 * digitado conforme o progresso da seção (e apagado ao sair).
 * Mantido aqui para o módulo ser autocontido (zero acoplamento).
 */
const METAPHORS = {
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
    "pt-BR": ["> carregando módulos Python…", "✓ app pronto em http://127.0.0.1:8000"].join("\n"),
    "en-US": ["> loading Python modules…", "✓ app ready on http://127.0.0.1:8000"].join("\n"),
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

/**
 * Retorna o texto da metáfora correspondente ao nome fornecido, no idioma atual.
 * @param {string} name O nome da metáfora.
 * @returns {string} O texto da metáfora no idioma atual.
 */
function getMetaphorText(name) {
  const entry = METAPHORS[name];
  if (!entry) return "";
  return entry[getCurrentLanguage()] ?? entry["pt-BR"] ?? Object.values(entry)[0] ?? "";
}

const clamp = (v, min = 0, max = 1) => (v < min ? min : v > max ? max : v);

/**
 * Calcula o progresso de um elemento ao atravessar o viewport.
 * 0 = fora (abaixo, ainda não entrou — ou acima, já saiu)
 * 1 = totalmente "construído" (na faixa central de leitura)
 * O `delay` desloca o início, criando o efeito cascata por grupo.
 * @param {DOMRect} rect O retângulo delimitador do elemento.
 * @param {number} vh A altura do viewport.
 * @param {number} delay O atraso incremental para o efeito cascata.
 * @returns {number} O progresso normalizado de 0 a 1.
 */
function travelProgress(rect, vh, delay = 0) {
  const h = rect.height || 1;
  const traveled = vh - rect.top;
  const total = vh + h;
  const t = clamp(traveled / total - delay * STAGGER_STEP);

  if (t < BUILD) return clamp(t / BUILD);
  if (t <= HOLD_END) return 1;
  return clamp(1 - (t - HOLD_END) / (1 - HOLD_END));
}

/* ================================================================
   Engine
   ================================================================ */

/**
 * Cria as animações de scroll para a página.
 * @returns {void}
 */
export function createScrollAnimations() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const staticMode = reduced || coarsePointer;
  const nativeSupported =
    !staticMode &&
    "CSS" in window &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view()");

  let items = [];
  let metaphors = [];
  const active = new Set();

  let io = null;
  let ticking = false;
  let rafId = 0;
  let heroIntroActive = window.scrollY <= 4;
  let heroIntroStartedAt = 0;

  const ambient = document.querySelector(".ambient");
  const heroSection = document.querySelector("#home");

  /**
   * Coleta os elementos a animar e as seções com metáforas. Para cada elemento
   * [data-animate], cria um objeto com referência ao elemento, tipo de animação,
   * atraso e estado de "assentado". Para cada seção [data-metaphor], injeta o
   * overlay da metáfora (se ainda não existir) e armazena as referências.
   * Isso é chamado inicialmente e também em refresh() para recálculo dinâmico.
   * @returns {void}
   */
  function collect() {
    items = Array.from(document.querySelectorAll("[data-animate]")).map((node) => ({
      el: node,
      type: node.dataset.animate || "text",
      delay: Number(node.dataset.animateDelay) || 0,
      settled: false,
    }));

    metaphors = [];
    document.querySelectorAll("[data-metaphor]").forEach((section) => {
      const built = injectMetaphor(section);
      if (built) metaphors.push(built);
    });
  }

  /**
   * Injeta o overlay de metáfora (monospace, sutil) numa seção.
   * @param {HTMLElement} section A seção onde a metáfora será injetada.
   * @returns {Object|null} O objeto da metáfora ou null se não houver metáfora.
   */
  function injectMetaphor(section) {
    const name = section.dataset.metaphor;
    const full = getMetaphorText(name);
    if (!full) return null;

    let box = section.querySelector(":scope > .metaphor");
    if (!box) {
      box = document.createElement("div");
      box.className = "metaphor";
      box.setAttribute("aria-hidden", "true");
      const pre = document.createElement("pre");
      pre.className = "metaphor__code";
      const code = document.createElement("code");
      const caret = document.createElement("span");
      caret.className = "metaphor__caret";
      pre.append(code, caret);
      box.append(pre);
      section.prepend(box);
    }
    return {
      el: box,
      code: box.querySelector("code"),
      caret: box.querySelector(".metaphor__caret"),
      full,
      section,
    };
  }

  /**
   * Aplica o progresso de animação a um item.
   * @param {Object} item O objeto do item a animar.
   * @param {number} p O progresso normalizado de 0 a 1.
   * @returns {void}
   */
  function applyItem(item, p) {
    if (!nativeSupported) {
      item.el.style.setProperty("--progress", p.toFixed(4));
    }
    const moving = p > 0.001 && p < 0.999;
    if (moving && item.settled) {
      item.el.style.willChange = "transform, opacity";
      item.settled = false;
    } else if (!moving && !item.settled) {
      item.el.style.willChange = "";
      item.settled = true;
    }
  }

  /**
   * Aplica o progresso de digitação a uma metáfora.
   * @param {Object} m O objeto da metáfora.
   * @param {number} p O progresso normalizado de 0 a 1.
   * @returns {void}
   */
  function applyMetaphor(m, p) {
    const total = m.full.length;
    const count = Math.round(clamp(p) * total);
    const typed = m.full.slice(0, count);
    if (m.code.textContent !== typed) m.code.textContent = typed;
    const full = count === total;
    m.caret.style.opacity = count === 0 ? "0" : "1";
    m.caret.classList.toggle("is-idle", full);
  }

  /**
   * Calcula o progresso da introdução do hero.
   * @param {number} now O timestamp atual.
   * @returns {number} O progresso normalizado de 0 a 1.
   */
  function getHeroIntroProgress(now) {
    if (!heroIntroActive) return 1;
    if (!heroIntroStartedAt) heroIntroStartedAt = now;

    const progress = clamp((now - heroIntroStartedAt) / HERO_INTRO_DURATION);
    if (progress >= 1 || window.scrollY > 4) {
      heroIntroActive = false;
      return 1;
    }

    return progress;
  }

  /**
   * Calcula o progresso de uma metáfora.
   * @param {Object} metaphor O objeto da metáfora.
   * @param {DOMRect} rect O retângulo delimitador da seção da metáfora.
   * @param {number} vh A altura da viewport.
   * @param {number} now O timestamp atual.
   * @returns {number} O progresso normalizado de 0 a 1.
   */
  function getMetaphorProgress(metaphor, rect, vh, now) {
    const base = travelProgress(rect, vh, 0);
    if (metaphor.section.id !== "home") return base;
    return base * getHeroIntroProgress(now);
  }

  /**
   * Aplica o efeito de paralaxe ao elemento ambiente.
   * @param {number} scrollY A posição atual do scroll.
   * @returns {void}
   */
  function applyParallax(scrollY) {
    if (!ambient || !heroSection) return;
    const heroH = heroSection.offsetHeight || window.innerHeight;
    const t = clamp(scrollY / heroH);
    const offset = (t * 2 - 1) * PARALLAX_RANGE; // -20 -> +20
    ambient.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  }

  /**
   * Atualiza o frame de animação.
   * @param {number} now O timestamp atual.
   * @returns {void}
   */
  function frame(now = performance.now()) {
    const vh = window.innerHeight;

    const measured = [];
    active.forEach((item) => {
      measured.push([item, item.el.getBoundingClientRect()]);
    });
    const metaMeasured = [];
    metaphors.forEach((m) => {
      metaMeasured.push([m, m.section.getBoundingClientRect()]);
    });
    const scrollY = window.scrollY;

    for (const [item, rect] of measured) {
      applyItem(item, travelProgress(rect, vh, item.delay));
    }
    for (const [m, rect] of metaMeasured) {
      applyMetaphor(m, getMetaphorProgress(m, rect, vh, now));
    }
    applyParallax(scrollY);

    ticking = false;

    if (heroIntroActive) requestFrame();
  }

  /**
   * Solicita um novo frame de animação, se ainda não estiver em andamento.
   * @returns {void}
   */
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    rafId = requestAnimationFrame(frame);
  }

  /**
   * Revela todos os elementos estáticos, sem animação.
   * @returns {void}
   */
  function revealAllStatic() {
    items.forEach((item) => item.el.style.setProperty("--progress", "1"));
    metaphors.forEach((m) => {
      m.full = getMetaphorText(m.section.dataset.metaphor);
      m.code.textContent = m.full;
      m.caret.style.opacity = "0";
    });
  }

  /**
   * Configura o observador de interseção para os elementos.
   * @returns {void}
   */
  function setupObserver() {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = entry.target.__sa;
          if (!item) return;
          if (entry.isIntersecting) {
            active.add(item);
          } else {
            active.delete(item);
            applyItem(item, 0);
            if (!nativeSupported) item.el.style.setProperty("--progress", "0");
          }
        });
        requestFrame();
      },
      { rootMargin: "20% 0px 20% 0px", threshold: [0, 0.01, 1] }
    );
    items.forEach((item) => {
      item.el.__sa = item;
      io.observe(item.el);
    });
  }

  /**
   * Inicializa a animação de scroll. Deve ser chamado após o DOM estar pronto. Verifica se o usuário prefere reduzir movimento e se o navegador suporta animação nativa. Se não, revela tudo de uma vez. Caso contrário, observa os elementos e revela conforme necessário. O parallax é aplicado apenas se o usuário não tiver preferência por reduzir movimento.
   * @returns {Object} O objeto API com métodos para controlar a animação.
   */
  function init() {
    collect();

    if (nativeSupported) {
      document.documentElement.classList.add("scroll-native");
    }

    if (staticMode) {
      revealAllStatic();
      return api;
    }

    setupObserver();

    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame, { passive: true });

    requestFrame();
    return api;
  }

  /**
   * Destrói a animação de scroll, removendo listeners e limpando estados. 
   * Deve ser chamado para liberar recursos se a animação não for mais necessária (ex.: navegação SPA). 
   * Remove os event listeners de scroll e resize, cancela qualquer frame pendente, desconecta o IntersectionObserver e limpa o conjunto ativo. 
   * Também remove as propriedades de estilo e referências associadas dos elementos animados.
   * @returns {void}
   */
  function destroy() {
    window.removeEventListener("scroll", requestFrame);
    window.removeEventListener("resize", requestFrame);
    if (rafId) cancelAnimationFrame(rafId);
    if (io) io.disconnect();
    active.clear();
    items.forEach((item) => {
      delete item.el.__sa;
      item.el.style.willChange = "";
    });
  }

  /**
   * Recalcula tudo (ex.: após conteúdo dinâmico ou troca de layout). Deve ser chamado sempre que o conteúdo ou layout mudar significativamente, para garantir que os cálculos de progresso e as animações continuem precisas. Ele reconecta o IntersectionObserver, recolleciona os elementos animados e as metáforas (atualizando seus textos conforme o idioma atual), e reinicia a animação. Se o usuário preferir reduzir movimento, ele simplesmente revela tudo de uma vez.
   * @returns {void}
   */
  function refresh() {
    if (io) io.disconnect();
    active.clear();
    collect();
    if (nativeSupported) {
      document.documentElement.classList.add("scroll-native");
    }
    if (staticMode) {
      revealAllStatic();
      return;
    }
    setupObserver();
    requestFrame();
  }

  onLanguageChange(() => {
    if (metaphors.length) refresh();
  });

  const api = { init, destroy, refresh };
  return api;
}
