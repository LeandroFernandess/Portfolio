const DEBUG_QUERY_KEY = "debug";
const DEBUG_STORAGE_KEY = "portfolioDebug";
const MAX_DEPTH = 2;
const MAX_KEYS = 12;
const MAX_ARRAY_ITEMS = 8;
const MAX_STRING_LENGTH = 140;

/**
 * Sincroniza a preferência de debug do parâmetro de query para o localStorage.
 * Se o parâmetro de query estiver presente, ele substitui a preferência armazenada.
 */
function syncDebugPreferenceFromQuery() {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  if (!params.has(DEBUG_QUERY_KEY)) return;

  const value = params.get(DEBUG_QUERY_KEY);
  const enabled = value !== "0" && value !== "false" && value !== "off";

  try {
    if (enabled) {
      localStorage.setItem(DEBUG_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  } catch {
    // O modo debug continua funcional na sessão atual mesmo sem persistência.
  }
}

/**
 * Verifica se o parâmetro de query de debug está presente na URL.
 * @returns {boolean} true se o parâmetro de query estiver presente, false caso contrário.
 */
function hasDebugQuery() {
  try {
    return new URLSearchParams(window.location.search).has(DEBUG_QUERY_KEY);
  } catch {
    return false;
  }
}

/**
 * Verifica se o modo debug está habilitado no localStorage.
 * @returns {boolean} true se o modo debug estiver habilitado, false caso contrário.
 */
function isStoredDebugEnabled() {
  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Trunca uma string para o comprimento máximo definido.
 * @param {*} value O valor a ser truncado.
 * @returns {string} A string truncada, se necessário.
 */
function truncateString(value) {
  const text = String(value);
  return text.length > MAX_STRING_LENGTH
    ? `${text.slice(0, MAX_STRING_LENGTH)}...`
    : text;
}

/**
 * Sanitiza um valor para exibição no modo debug.
 * @param {*} value O valor a ser sanitizado.
 * @param {number} depth A profundidade atual da sanitização.
 * @returns {*} O valor sanitizado.
 */
function sanitizeValue(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") return truncateString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function")
    return `[function ${value.name || "anonymous"}]`;
  if (value instanceof Error)
    return { name: value.name, message: truncateString(value.message) };
  if (value instanceof URL)
    return value.origin === window.location.origin
      ? value.pathname
      : value.origin;
  if (value instanceof Element) {
    const id = value.id ? `#${value.id}` : "";
    const className =
      typeof value.className === "string"
        ? value.className
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => `.${name}`)
            .join("")
        : "";
    return `<${value.tagName.toLowerCase()}${id}${className}>`;
  }
  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return `[array(${value.length})]`;
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    if (depth >= MAX_DEPTH) return "[object]";
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, MAX_KEYS)
        .map(([key, entry]) => [key, sanitizeValue(entry, depth + 1)]),
    );
  }
  return truncateString(value);
}

/**
 * Verifica se o modo debug está habilitado.
 * @returns {boolean} true se o modo debug estiver habilitado, false caso contrário.
 */
export function isDebugEnabled() {
  if (hasDebugQuery()) return true;
  return isStoredDebugEnabled();
}

/**
 * Registra uma mensagem de debug no console.
 * @param {string} scope O escopo da mensagem de debug.
 * @param {string} event O evento ou ação a ser registrada.
 * @param {Object} details Detalhes adicionais sobre o evento.
 */
export function debugLog(scope, event, details = {}) {
  if (!isDebugEnabled()) return;
  console.info(`[portfolio:diag][${scope}]`, event, sanitizeValue(details));
}

syncDebugPreferenceFromQuery();
