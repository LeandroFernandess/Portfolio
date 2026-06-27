/**
 * @file chat.js
 * @description Vercel Function que responde perguntas usando OpenAI e contexto do portfólio.
 */

const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_QUESTION_LENGTH = 800;
const SUPPORTED_LANGUAGES = new Set(["pt-BR", "en-US"]);

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

const loadContext = async () => {
  const contextPath = join(__dirname, "..", "data", "ai-context.md");
  return readFile(contextPath, "utf8");
};

/**
 * Handler da API de IA: valida entrada, injeta contexto público e chama OpenAI server-side.
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
    const question = String(body.message || body.question || "").trim();
    const language = SUPPORTED_LANGUAGES.has(body.language) ? body.language : "pt-BR";
    const answerLanguage = language === "en-US" ? "English (en-US)" : "português brasileiro (pt-BR)";

    if (question.length < 2) {
      return json(res, 400, { error: "Envie uma pergunta." });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return json(res, 400, { error: "Pergunta muito longa." });
    }

    const apiKey = process.env.OPEN_AI_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: "IA nao configurada." });
    }

    const context = await loadContext();
    const model = process.env.OPENAI_MODEL;

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              `Você é o assistente do portfólio profissional de Leandro Fernandes. Responda em ${answerLanguage}, de forma objetiva e cordial. Use apenas o contexto fornecido. Se faltar informação ou a pergunta fugir do escopo profissional do portfólio, diga isso brevemente e redirecione para experiência, habilidades, projetos, serviços ou contato.`,
          },
          {
            role: "system",
            content: `Contexto público do portfólio:\n\n${context}`,
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      await openAiResponse.text().catch(() => "");
      return json(res, 502, { error: "Nao foi possível responder agora." });
    }

    const payload = await openAiResponse.json();
    const answer = payload.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return json(res, 502, { error: "A IA nao retornou uma resposta." });
    }

    return json(res, 200, { answer });
  } catch (error) {
    return json(res, 500, { error: "Erro interno ao consultar a IA." });
  }
};
