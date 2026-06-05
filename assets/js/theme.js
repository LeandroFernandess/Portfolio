/**
 * theme.js — Alternância de tema
 * ----------------------------------------------------------------
 * Aplica tema dark/light via data-theme no <html> e persiste a
 * preferência do visitante em localStorage. Dark é o padrão.
 */

import { onLanguageChange, t } from "./i18n.js";

const STORAGE_KEY = "portfolioTheme";
const THEMES = ["dark", "light"];

const getStoredTheme = () => {
    try {
        const theme = localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(theme) ? theme : "dark";
    } catch {
        return "dark";
    }
};

const setStoredTheme = (theme) => {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Sem persistência, mas a troca visual continua funcionando na sessão.
    }
};

/**
 * Aplica o tema especificado ao documento e atualiza os elementos de interface relacionados.
 * @param {string} theme - O tema a ser aplicado ("dark" ou "light").
 */
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "light" ? "#f6f7fb" : "#08080a");

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        const isLight = theme === "light";
        button.setAttribute("aria-pressed", String(isLight));
        button.setAttribute("aria-label", isLight ? t("theme.activateDark") : t("theme.activateLight"));
        const label = button.querySelector("[data-theme-label]");
        const icon = button.querySelector("[data-theme-icon]");
        if (label) label.textContent = isLight ? t("theme.dark") : t("theme.light");
        if (icon) icon.textContent = isLight ? "☾" : "☼";
    });
}

/**
 * Inicializa a alternância de tema, aplicando o tema armazenado ou o padrão, e configurando os event listeners para os botões de toggle. Também atualiza o tema quando o idioma muda, para garantir que os rótulos estejam sempre corretos. Deve ser chamado após o DOM estar pronto.
 * @returns {void}
 */
export function initTheme() {
    let currentTheme = getStoredTheme();
    applyTheme(currentTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            currentTheme = currentTheme === "light" ? "dark" : "light";
            applyTheme(currentTheme);
            setStoredTheme(currentTheme);
        });
    });

    onLanguageChange(() => applyTheme(currentTheme));
}
