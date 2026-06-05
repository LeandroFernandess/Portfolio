/**
 * @file contact.js
 * @description Vercel Function que envia mensagens de contato via Resend.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_CONTACT_EMAIL = "leandrofernandes1600@gmail.com";
const DEFAULT_FROM_EMAIL = "Portfólio <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Envia uma resposta JSON padronizada para a Vercel Function.
 * @param {import('http').ServerResponse} res - O objeto de resposta HTTP.
 * @param {number} statusCode - O código de status HTTP.
 * @param {object} body - O corpo da resposta.
 */
const json = (res, statusCode, body) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

/**
 * Escapa conteúdo informado pelo usuário antes de montar o HTML do e-mail.
 * @param {*} value - O valor a ser escapado.
 * @returns {string} - O valor escapado.
 */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/[<>&"']/g, (char) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]))
    .trim();

/**
 * Lê o corpo da requisição, suportando tanto objetos prontos quanto streams brutas.
 * @param {import('http').IncomingMessage} req - O objeto de requisição HTTP.
 * @returns {Promise<object>} O corpo da requisição como objeto.
 */
const readBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks.map((chunk) =>
    Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
  )).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const buildEmailHtml = ({ name, email, message, sentAt }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px">
    <h1 style="font-size:22px;margin:0 0 16px;color:#111827">Novo contato pelo portfólio</h1>
    <p style="margin:0 0 24px;color:#4b5563">Uma nova mensagem foi enviada pelo formulário de contato.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:bold;width:120px">Nome</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb">${name}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:bold">E-mail</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb">${email}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:bold">Data/Hora</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb">${sentAt}</td>
      </tr>
    </table>
    <h2 style="font-size:16px;margin:0 0 8px;color:#111827">Mensagem</h2>
    <div style="white-space:pre-wrap;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">${message}</div>
  </div>
`;

/**
 * Handler do contato: valida entrada, descarta honeypot e envia por Resend server-side.
 * @param {import('http').IncomingMessage} req - O objeto de requisição HTTP.
 * @param {import('http').ServerResponse} res - O objeto de resposta HTTP.
 * @returns {Promise<void>} - Não retorna valor, apenas envia a resposta HTTP.
 */
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método nao permitido." });
  }

  try {
    const body = await readBody(req);

    if (body.website) {
      return json(res, 200, { ok: true });
    }

    const name = escapeHtml(body.name);
    const email = String(body.email ?? "").trim();
    const message = escapeHtml(body.message);

    if (name.length < 2 || name.length > 80) {
      return json(res, 400, { error: "Informe um nome valido." });
    }

    if (!EMAIL_RE.test(email) || email.length > 120) {
      return json(res, 400, { error: "Informe um e-mail valido." });
    }

    if (message.length < 10 || message.length > 2000) {
      return json(res, 400, { error: "Informe uma mensagem valida." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: "Envio de e-mail nao configurado." });
    }

    const to = process.env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const sentAt = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Novo contato - ${name}`,
        html: buildEmailHtml({ name, email: escapeHtml(email), message, sentAt }),
      }),
    });

    if (!resendResponse.ok) {
      await resendResponse.text().catch(() => "");
      console.error("Resend falhou:", {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
      });
      return json(res, 502, { error: "Nao foi possível enviar a mensagem agora." });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Erro no contato:", error);
    return json(res, 500, { error: "Erro interno ao enviar mensagem." });
  }
};
