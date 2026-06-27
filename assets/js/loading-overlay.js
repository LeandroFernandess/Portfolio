/**
 * loading-overlay.js — Overlay de carregamento global
 * ----------------------------------------------------------------
 * Máscara visual elegante (tema solar) para os momentos em que a
 * aplicação pode parecer travada no mobile:
 *   1. carga inicial / primeiro acesso;
 *   2. transição Sistema Solar → portfólio (cleanup do Three.js);
 *   3. retomada da página.
 *
 * O módulo só liga/desliga classes no elemento #appLoader já
 * presente no HTML. Respeita prefers-reduced-motion via CSS e
 * usa detecção real (eventos/rAF), sem setTimeout fixo arbitrário
 * — o único timer é um piso mínimo de exibição para evitar flicker.
 */

import { t } from "./i18n.js";
import { debugLog } from "./debug.js";

const MIN_VISIBLE_MS = 420;
const HIDE_FALLBACK_MS = 700;
const STUCK_LOADER_MS = 5000;

let overlay = null;
let labelEl = null;
let shownAt = 0;
let hideTimer = 0;
let removeTimer = 0;
let stuckTimer = 0;

function logLoader(event, details = {}) {
    debugLog("loader", event, {
        now: Math.round(performance.now()),
        ...details,
    });
}

/**
 * Resolve o elemento do overlay.
 * @returns {HTMLElement|null} Elemento do overlay ou null se não encontrado.
 */
function getOverlay() {
    if (!overlay) {
        overlay = document.querySelector("[data-app-loader]");
        labelEl = overlay?.querySelector("[data-app-loader-label]") ?? null;
    }
    return overlay;
}

/**
 * Limpa timers pendentes para evitar chamadas conflitantes de show/hide.
 * @returns {void}
 */
function clearTimers() {
    if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = 0;
    }
    if (removeTimer) {
        window.clearTimeout(removeTimer);
        removeTimer = 0;
    }
    if (stuckTimer) {
        window.clearTimeout(stuckTimer);
        stuckTimer = 0;
    }
}

function armStuckLoaderFailsafe() {
    if (stuckTimer) return;
    stuckTimer = window.setTimeout(() => {
        stuckTimer = 0;
        ensureLoaderHidden({ reason: "failsafe:stuck-loader" });
    }, STUCK_LOADER_MS);
}

function ensureInitialLoaderFailsafe() {
    const node = getOverlay();
    if (!node?.classList.contains("is-active")) return;
    armStuckLoaderFailsafe();
}

/**
 * Exibe o overlay. Idempotente: chamar repetidamente apenas mantém visível.
 * @param {Object} [options]
 * @param {string} [options.messageKey] Chave i18n para o rótulo exibido.
 * @returns {void}
 */
export function showLoader({ messageKey } = {}) {
    const node = getOverlay();
    if (!node) return;

    clearTimers();
    if (messageKey && labelEl) labelEl.textContent = t(messageKey);

    if (!node.classList.contains("is-active")) {
        node.hidden = false;
        void node.offsetWidth;
        node.classList.add("is-active");
        shownAt = performance.now();
        armStuckLoaderFailsafe();
        logLoader("show", { messageKey: messageKey ?? null, hidden: node.hidden });
        return;
    }

    armStuckLoaderFailsafe();
    logLoader("show:noop", { messageKey: messageKey ?? null, hidden: node.hidden });
}

/**
 * Oculta o overlay respeitando o piso mínimo de exibição.
 * @param {Object} [options]
 * @param {boolean} [options.immediate] Ignora o piso mínimo e oculta já.
 * @returns {void}
 */
export function hideLoader({ immediate = false } = {}) {
    const node = getOverlay();
    if (!node || !node.classList.contains("is-active")) return;

    const finish = () => {
        const visibleFor = Math.round(performance.now() - shownAt);
        node.classList.remove("is-active");
        logLoader("hide:finish", { immediate, visibleFor });
        removeTimer = window.setTimeout(() => {
            if (!node.classList.contains("is-active")) {
                node.hidden = true;
                logLoader("hide:hidden", { immediate });
            }
        }, HIDE_FALLBACK_MS);
    };

    clearTimers();
    if (immediate) {
        logLoader("hide:start", { immediate: true });
        finish();
        return;
    }

    const elapsed = performance.now() - shownAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    logLoader("hide:start", { immediate: false, elapsed: Math.round(elapsed), wait: Math.round(wait) });
    hideTimer = window.setTimeout(finish, wait);
}

/**
 * Garante que o overlay fique oculto imediatamente, limpando timers e
 * qualquer classe residual deixada por uma retomada/restauração.
 * @param {Object} [options]
 * @param {string|null} [options.reason] Contexto para diagnóstico.
 * @returns {void}
 */
export function ensureLoaderHidden({ reason = null } = {}) {
    const node = getOverlay();
    if (!node) return;

    clearTimers();
    node.classList.remove("is-active");
    node.hidden = true;
    shownAt = 0;
    logLoader("force-hide", { reason });
}

/**
 * Exibe o overlay por um instante curto — usado na retomada da página
 * para mascarar o re-render dos efeitos pesados (blur/backdrop) no mobile.
 * @param {Object} [options]
 * @param {string} [options.messageKey] Chave i18n para o rótulo.
 * @returns {void}
 */
export function flashLoader({ messageKey = "loader.resuming", immediate = false } = {}) {
    logLoader("flash", { messageKey, immediate });
    showLoader({ messageKey });
    hideLoader({ immediate });
}

ensureInitialLoaderFailsafe();
