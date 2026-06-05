/**
 * ai-chat.js — Assistente de IA do portfólio
 * ----------------------------------------------------------------
 * Controla a interface de perguntas sobre Leandro e consulta a
 * Vercel Function /api/chat. Nenhuma chave da OpenAI fica no cliente.
 */

import { getCurrentLanguage, onLanguageChange, t } from "./i18n.js";

/**
 * Inicializa o assistente de IA, configurando o formulário de perguntas e respostas.
 * @returns {void}
 */
export function initAiChat() {
    const form = document.querySelector("#aiChatForm");
    if (!form) return;

    const input = form.querySelector("#aiQuestion");
    const submitBtn = form.querySelector("#aiSubmitBtn");
    const resetBtn = form.querySelector("#aiResetBtn");
    const statusEl = form.querySelector("#aiChatStatus");
    const card = form.closest(".ai-card");
    const answerEl = document.querySelector("#aiAnswer");
    const initialAnswer = () => t("ai.initial");
    let requestId = 0;

    const setLoading = (loading) => {
        if (submitBtn) submitBtn.disabled = loading;
        if (resetBtn) resetBtn.disabled = loading;
        form.classList.toggle("is-loading", loading);
        card?.classList.toggle("is-loading", loading);
    };

    const setStatus = (message, kind = "info") => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove("is-success", "is-error");
        if (kind === "success") statusEl.classList.add("is-success");
        if (kind === "error") statusEl.classList.add("is-error");
    };

    const setAnswer = (message, kind = "default") => {
        if (!answerEl) return;
        answerEl.textContent = message;
        answerEl.classList.toggle("is-error", kind === "error");
        answerEl.classList.toggle("is-empty", kind === "empty");
    };

    const resetConversation = () => {
        requestId += 1;
        input.value = "";
        setLoading(false);
        setStatus("");
        setAnswer(initialAnswer(), "empty");
        input.focus();
    };

    setAnswer(initialAnswer(), "empty");
    resetBtn?.addEventListener("click", resetConversation);
    onLanguageChange(() => {
        if (answerEl?.classList.contains("is-empty")) {
            setAnswer(initialAnswer(), "empty");
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = input?.value.trim() || "";
        if (message.length < 2) {
            setStatus(t("ai.shortQuestion"), "error");
            setAnswer(initialAnswer(), "empty");
            input?.focus();
            return;
        }

        const currentRequest = requestId + 1;
        requestId = currentRequest;
        setLoading(true);
        setStatus(t("ai.loadingStatus"));
        setAnswer(t("ai.loadingAnswer"), "empty");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, language: getCurrentLanguage() }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || t("ai.requestError"));
            }

            if (currentRequest !== requestId) return;

            setAnswer(result.answer);
            setStatus(t("ai.success"), "success");
        } catch (error) {
            if (currentRequest !== requestId) return;
            console.error("Erro no assistente de IA:", error);
            setAnswer(t("ai.answerError"), "error");
            setStatus(t("ai.statusError"), "error");
        } finally {
            if (currentRequest === requestId) {
                setLoading(false);
            }
        }
    });
}
