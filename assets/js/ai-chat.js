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
  let thinkingEl = null;

  const setLoading = (loading) => {
    if (input) input.disabled = loading;
    if (submitBtn) submitBtn.disabled = loading;
    if (resetBtn) resetBtn.disabled = loading;
    form.classList.toggle("is-loading", loading);
    card?.classList.toggle("is-loading", loading);
    answerEl?.setAttribute("aria-busy", String(loading));
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
    if (thinkingEl?.isConnected) thinkingEl.remove();
    thinkingEl = null;
    answerEl.replaceChildren(document.createTextNode(message));
    answerEl.classList.toggle("is-error", kind === "error");
    answerEl.classList.toggle("is-empty", kind === "empty");
    answerEl.classList.toggle("is-thinking", false);
  };

  const setThinkingAnswer = () => {
    if (!answerEl) return;
    if (thinkingEl?.isConnected) return;

    const bubble = document.createElement("span");
    bubble.className = "ai-thinking";
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-label", t("ai.loadingStatus"));

    const badge = document.createElement("span");
    badge.className = "ai-thinking__badge";
    badge.setAttribute("aria-hidden", "true");

    const pulse = document.createElement("span");
    pulse.className = "ai-thinking__pulse";
    const badgeLabel = document.createElement("span");
    badgeLabel.className = "ai-thinking__badge-label";
    badgeLabel.textContent = "AI";
    badge.append(pulse, badgeLabel);

    const content = document.createElement("span");
    content.className = "ai-thinking__content";

    const line = document.createElement("span");
    line.className = "ai-thinking__line";

    const text = document.createElement("span");
    text.className = "ai-thinking__text";
    text.textContent = t("ai.loadingStatus").replace(/\.+$/, "");

    const dots = document.createElement("span");
    dots.className = "ai-thinking__dots";
    dots.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 3; index += 1) {
      const dot = document.createElement("span");
      dot.className = "ai-thinking__dot";
      dots.append(dot);
    }

    const detail = document.createElement("span");
    detail.className = "ai-thinking__detail";
    detail.textContent = t("ai.loadingAnswer");

    line.append(text, dots);
    content.append(line, detail);
    bubble.append(badge, content);

    if (thinkingEl?.isConnected) thinkingEl.remove();
    thinkingEl = bubble;
    answerEl.replaceChildren(bubble);
    answerEl.classList.remove("is-error", "is-empty");
    answerEl.classList.add("is-thinking");
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
    if (thinkingEl?.isConnected) {
      thinkingEl.remove();
      thinkingEl = null;
      setThinkingAnswer();
      return;
    }
    if (answerEl?.classList.contains("is-empty")) {
      setAnswer(initialAnswer(), "empty");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.classList.contains("is-loading")) return;

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
    setThinkingAnswer();

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

      if (result.hasMore) {
        setAnswer(`${result.answer}\n\n${t("ai.partialAnswer")}`);
        setStatus(t("ai.partialStatus"), "error");
        return;
      }

      setAnswer(result.answer);
      setStatus(t("ai.success"), "success");
    } catch (error) {
      if (currentRequest !== requestId) return;
      setAnswer(t("ai.answerError"), "error");
      setStatus(t("ai.statusError"), "error");
    } finally {
      if (currentRequest === requestId) {
        setLoading(false);
      }
    }
  });
}
