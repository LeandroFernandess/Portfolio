/**
 * code-animation.js — Editor de código com efeito typewriter
 * ----------------------------------------------------------------
 * Animação temática de destaque do hero: simula alguém digitando
 * código num editor, caractere a caractere, com syntax highlighting
 * por tipo de token. Ao terminar, faz uma pausa e reinicia em loop.
 *
 * Por que tokens pré-classificados (em data.js) em vez de um parser?
 * Tokenizar JS de verdade no cliente seria over-engineering para um
 * trecho fixo. Os tokens [tipo, texto] dão controle total de cor com
 * custo mínimo — e cada caractere é inserido sem reflows custosos.
 *
 * Acessibilidade: respeita prefers-reduced-motion (renderiza o código
 * final estático, sem digitação nem cursor piscante).
 */

import { heroCode } from "./data.js";
import { getCurrentLanguage, onLanguageChange } from "./i18n.js";

/** Mapeia o tipo de token para a classe CSS de cor correspondente. */
const TOKEN_CLASS = {
    keyword: "tok-keyword",
    function: "tok-function",
    string: "tok-string",
    number: "tok-number",
    comment: "tok-comment",
    punct: "tok-punct",
    property: "tok-property",
    plain: "",
};

/** Soma o total de caracteres de uma linha de tokens. */
const lineLength = (tokens) =>
    tokens.reduce((sum, [, text]) => sum + text.length, 0);

const getHeroCode = () => heroCode[getCurrentLanguage()] || heroCode["pt-BR"] || [];

/**
 * Cria um <span> colorido para um token (parcial ou completo).
 * @param {string} type - O tipo do token (e.g., "keyword", "string").
 * @param {string} text - O texto do token.
 * @returns {HTMLSpanElement} O elemento <span> criado.
 */
function tokenSpan(type, text) {
    const span = document.createElement("span");
    const cls = TOKEN_CLASS[type];
    if (cls) span.className = cls;
    span.textContent = text;
    return span;
}

/**
 * Renderiza o trecho de código de forma estática (sem animação).
 * @param {HTMLElement} codeEl - O elemento onde o código será renderizado.
 * @param {Array} codeLines - As linhas de código a serem renderizadas.
 * @returns {void}
 */
function renderStatic(codeEl, codeLines = getHeroCode()) {
    codeEl.textContent = "";
    codeLines.forEach((tokens, i) => {
        tokens.forEach(([type, text]) => codeEl.appendChild(tokenSpan(type, text)));
        if (i < codeLines.length - 1) codeEl.appendChild(document.createTextNode("\n"));
    });
}
/**
 * Inicializa a animação do código no hero, configurando o efeito typewriter.
 * @returns {void}
 */
export function initCodeAnimation() {
    const codeEl = document.querySelector("#heroCode");
    const caretEl = document.querySelector("#heroCaret");
    if (!codeEl) return;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let codeLines = getHeroCode();

    if (prefersReducedMotion) {
        renderStatic(codeEl, codeLines);
        caretEl?.remove();
        onLanguageChange(() => renderStatic(codeEl, getHeroCode()));
        return;
    }

    let line = 0;
    let col = 0;
    let lineEl = null;
    let timerId = 0;

    const SPEED_CHAR = 32;
    const SPEED_LINE = 180;
    const PAUSE_END = 2600;

    const reset = () => {
        if (timerId) clearTimeout(timerId);
        timerId = 0;
        codeEl.textContent = "";
        line = 0;
        col = 0;
        lineEl = null;
        tick();
    };

    const syncLanguage = () => {
        codeLines = getHeroCode();
        reset();
    };

    const moveCaret = () => {
        if (caretEl) codeEl.appendChild(caretEl);
    };

    /**
     * Insere o próximo caractere e reagenda a si mesmo.
     * @returns {void}
     */
    function tick() {
        if (line >= codeLines.length) {
            timerId = setTimeout(reset, PAUSE_END);
            return;
        }

        const tokens = codeLines[line];

        if (col === 0) {
            lineEl = document.createElement("span");
            codeEl.appendChild(lineEl);
        }

        const len = lineLength(tokens);

        if (len === 0 || col >= len) {
            codeEl.appendChild(document.createTextNode("\n"));
            line += 1;
            col = 0;
            moveCaret();
            timerId = setTimeout(tick, SPEED_LINE);
            return;
        }

        let acc = 0;
        for (const [type, text] of tokens) {
            if (col < acc + text.length) {
                const charIndex = col - acc;
                const visible = text.slice(0, charIndex + 1);
                const last = lineEl.lastElementChild;
                if (last && last.dataset.tokenStart === String(acc)) {
                    last.textContent = visible;
                } else {
                    const span = tokenSpan(type, visible);
                    span.dataset.tokenStart = String(acc);
                    lineEl.appendChild(span);
                }
                break;
            }
            acc += text.length;
        }

        col += 1;
        moveCaret();
        timerId = setTimeout(tick, SPEED_CHAR);
    }

    onLanguageChange(syncLanguage);
    tick();
}
