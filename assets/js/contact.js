/**
 * contact.js — Formulário de contato
 * ----------------------------------------------------------------
 * - Validação client-side (nome, e-mail, mensagem).
 * - Honeypot anti-spam (campo oculto que só bots preenchem).
 * - Envio seguro via Vercel Function em /api/contact.
 *
 * Segurança: a validação aqui é por UX/conveniência. A validação
 * autoritativa e o uso da chave Resend acontecem no servidor.
 */

import { t } from "./i18n.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formata um número de telefone.
 * @param {string} value - O valor do telefone a ser formatado.
 * @returns {string} - O telefone formatado.
 */
const formatPhone = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";

    const area = digits.slice(0, 2);
    const rest = digits.slice(2);

    if (digits.length <= 10) {
        return `(${area}) ${rest.slice(0, 4)}${rest.length > 4 ? `-${rest.slice(4, 8)}` : ""}`.trim();
    }

    return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`.trim();
};

/**
 * Inicializa o formulário de contato, configurando validação e envio.
 * @returns {void}
 */
export function initContact() {
    const form = document.querySelector("#contactForm");
    if (!form) return;

    const phoneInput = form.elements.phone;
    const submitBtn = form.querySelector("#submitBtn");
    const statusEl = form.querySelector("#formStatus");
    const btnLabel = submitBtn?.querySelector(".btn-label");
    const btnSpinner = submitBtn?.querySelector(".btn-spinner");

    const setError = (name, msg) => {
        const input = form.elements[name];
        const field = input?.closest(".field");
        const errEl = form.querySelector(`[data-error-for="${name}"]`);
        if (field) field.classList.toggle("has-error", !!msg);
        if (errEl) errEl.textContent = msg || "";
    };
    const clearErrors = () => ["name", "email", "message"].forEach((n) => setError(n, ""));

    const validate = (data) => {
        let ok = true;
        if (!data.name || data.name.length < 2) {
            setError("name", t("contact.nameError"));
            ok = false;
        }
        if (!data.email) {
            setError("email", t("contact.emailRequired"));
            ok = false;
        } else if (!EMAIL_RE.test(data.email)) {
            setError("email", t("contact.emailInvalid"));
            ok = false;
        }
        if (!data.message || data.message.length < 10) {
            setError("message", t("contact.messageError"));
            ok = false;
        }
        return ok;
    };

    const setLoading = (loading) => {
        if (submitBtn) submitBtn.disabled = loading;
        btnLabel?.classList.toggle("is-hidden", loading);
        btnSpinner?.classList.toggle("is-hidden", !loading);
    };
    const setStatus = (msg, kind = "info") => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove("is-success", "is-error");
        if (kind === "success") statusEl.classList.add("is-success");
        if (kind === "error") statusEl.classList.add("is-error");
    };

    ["name", "email", "message"].forEach((n) => {
        form.elements[n]?.addEventListener("input", () => setError(n, ""));
    });

    phoneInput?.addEventListener("input", () => {
        const formatted = formatPhone(phoneInput.value);
        if (phoneInput.value !== formatted) {
            phoneInput.value = formatted;
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        if (form.elements.website?.value) {
            setStatus(t("contact.botSuccess"), "success");
            form.reset();
            return;
        }

        const data = {
            name: form.elements.name.value.trim(),
            email: form.elements.email.value.trim(),
            phone: formatPhone(form.elements.phone.value),
            message: form.elements.message.value.trim(),
        };

        if (!validate(data)) {
            setStatus(t("contact.review"), "error");
            return;
        }

        setLoading(true);
        setStatus(t("contact.sending"));

        const payload = {
            ...data,
            website: form.elements.website?.value || "",
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || t("contact.sendError"));
            }

            setStatus(t("contact.success"), "success");
            form.reset();
        } catch (err) {
            console.error("Erro no formulário de contato:", err);
            setStatus(t("contact.unavailable"), "error");
        } finally {
            setLoading(false);
        }
    });
}
