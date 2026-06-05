/**
 * intro-experience.js — Orquestra a intro Sistema Solar Profissional
 * ----------------------------------------------------------------
 * Controla primeiro acesso, replay, fechamento e persistência.
 */

import { createProfessionalSolarSystem } from "./professional-solar-system.js";
import { showLoader, hideLoader } from "./loading-overlay.js";

const STORAGE_KEY = "portfolioIntroSeen";

/**
 * Inicializa a experiência de introdução do Sistema Solar Profissional.
 * @returns {void}
 */
export function initIntroExperience() {
    const dialog = document.querySelector("#professionalSolarSystem");
    const openBtns = document.querySelectorAll("#replayIntroBtn, [data-solar-open]");
    if (!dialog) return;

    const closeBtns = dialog.querySelectorAll("[data-solar-close]");
    const finishBtn = dialog.querySelector("[data-solar-finish]");
    const solarSystem = createProfessionalSolarSystem(dialog);
    const coarsePointer = window.matchMedia?.("(pointer: coarse)");
    let previousFocus = null;
    let active = false;

    const hasSeenIntro = () => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch {
            return true;
        }
    };

    const markSeen = () => {
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {
            // A intro continua opcional mesmo sem persistência.
        }
    };

    const open = () => {
        previousFocus = document.activeElement;
        dialog.hidden = false;
        document.body.classList.add("has-intro-open");
        if (!active) {
            solarSystem.start();
            active = true;
        }
        (dialog.querySelector("[data-solar-stage]") ?? finishBtn)?.focus();
    };

    const close = ({ seen = true } = {}) => {
        if (seen) markSeen();

        if (!active) {
            dialog.hidden = true;
            document.body.classList.remove("has-intro-open");
            previousFocus?.focus?.();
            return;
        }

        const wantsMask = Boolean(coarsePointer?.matches);
        if (wantsMask) showLoader({ messageKey: "loader.entering" });

        dialog.hidden = true;
        document.body.classList.remove("has-intro-open");
        previousFocus?.focus?.();

        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                solarSystem.cleanup();
                active = false;
                if (wantsMask) hideLoader();
            })
        );
    };

    closeBtns.forEach((button) => button.addEventListener("click", () => close()));
    finishBtn?.addEventListener("click", () => close());
    openBtns.forEach((button) => button.addEventListener("click", open));

    dialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
    });

    if (!hasSeenIntro()) open();
}
