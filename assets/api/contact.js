/**
 * @file contact.js
 * @description Vercel Function que envia mensagens de contato via Resend.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_DEFAULT_FROM = "Portfólio <onboarding@resend.dev>";
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
const MAX_EMAIL_LENGTH = 254;
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "yahoo.com",
  "yahoo.com.br",
  "proton.me",
  "protonmail.com",
]);
const ALLOWED_EMAIL_MESSAGE = "Use um e-mail pessoal de provedor aceito, como @gmail.com, @outlook.com ou @icloud.com.";

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
 * Normaliza e valida estruturalmente um endereço de e-mail.
 * @param {*} value - Valor informado pelo visitante.
 * @returns {{ email: string, domain: string } | null}
 */
const parseEmail = (value) => {
  const email = String(value ?? "").trim();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return null;

  const [localPart, domain] = email.split("@");
  if (!localPart || localPart.length > 64 || !domain || domain.length > 253) return null;
  return { email: `${localPart}@${domain.toLowerCase()}`, domain: domain.toLowerCase() };
};

/**
 * Obtém uma variável de ambiente obrigatória, retornando null se não estiver definida.
 * @param {string} name - Nome da variável de ambiente.
 * @returns {string|null} - Valor da variável ou null se ausente.
 */
const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    return null;
  }
  return value;
};

/**
 * Resolve a configuração obrigatória de envio e informa variáveis ausentes.
 * @returns {{ apiKey: string, to: string } | { missing: string[] }}
 */
const getEmailConfig = () => {
  const config = {
    apiKey: getRequiredEnv("RESEND_API_KEY"),
    to: getRequiredEnv("CONTACT_EMAIL"),
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => ({
      apiKey: "RESEND_API_KEY",
      to: "CONTACT_EMAIL",
    }[key]));

  if (missing.length) {
    return { missing };
  }

  return config;
};

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

const buildEmailHtml = ({ name, email, phone, message, sentAt }) => `
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
        <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:bold">Telefone</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb">${phone}</td>
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

const buildEmailText = ({ name, email, phone, message, sentAt }) => [
  "Novo contato pelo portfólio",
  "",
  `Nome: ${name}`,
  `E-mail: ${email}`,
  `Telefone: ${phone}`,
  `Data/Hora: ${sentAt}`,
  "",
  "Mensagem:",
  message,
].join("\n");

const mapResendError = (status) => {
  if (status === 401 || status === 403) {
    return {
      statusCode: 500,
      error: "RESEND_API_KEY inválida ou sem permissão para envio.",
    };
  }

  return {
    statusCode: 502,
    error: "Não foi possível enviar a mensagem agora.",
  };
};

/**
 * Handler do contato: valida entrada, descarta honeypot e envia por Resend server-side.
 * @param {import('http').IncomingMessage} req - O objeto de requisição HTTP.
 * @param {import('http').ServerResponse} res - O objeto de resposta HTTP.
 * @returns {Promise<void>} - Não retorna valor, apenas envia a resposta HTTP.
 */
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método não permitido." });
  }

  try {
    const body = await readBody(req);

    if (body.website) {
      return json(res, 200, { ok: true });
    }

    const name = escapeHtml(body.name);
    const parsedEmail = parseEmail(body.email);
    const phone = escapeHtml(body.phone).trim() || "Não informado";
    const message = escapeHtml(body.message);

    if (name.length < 2 || name.length > 80) {
      return json(res, 400, { error: "Informe um nome válido." });
    }

    if (!parsedEmail) {
      return json(res, 400, { error: "Informe um e-mail válido." });
    }

    if (!ALLOWED_EMAIL_DOMAINS.has(parsedEmail.domain)) {
      return json(res, 400, { error: ALLOWED_EMAIL_MESSAGE });
    }

    if (message.length < 10 || message.length > 2000) {
      return json(res, 400, { error: "Informe uma mensagem válida." });
    }

    const emailConfig = getEmailConfig();
    if ("missing" in emailConfig) {
      return json(res, 500, {
        error: `Envio de e-mail não configurado. Variáveis ausentes: ${emailConfig.missing.join(", ")}.`,
      });
    }

    const sentAt = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());

    const resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${emailConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_DEFAULT_FROM,
        to: emailConfig.to,
        reply_to: parsedEmail.email,
        subject: `Novo contato - ${name}`,
        text: buildEmailText({ name, email: parsedEmail.email, phone, message, sentAt }),
        html: buildEmailHtml({ name, email: escapeHtml(parsedEmail.email), phone, message, sentAt }),
      }),
    });

    if (!resendResponse.ok) {
      await resendResponse.text().catch(() => "");
      const mappedError = mapResendError(resendResponse.status);
      return json(res, mappedError.statusCode, { error: mappedError.error });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: "Erro interno ao enviar mensagem." });
  }
};
