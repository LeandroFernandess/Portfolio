/**
 * i18n.js — Internacionalização do portfólio
 * ----------------------------------------------------------------
 * Centraliza traduções pt-BR/en-US, aplica textos estáticos por
 * data-attributes e expõe helpers para módulos renderizados via JS.
 * A preferência fica em localStorage, mas o site continua funcional
 * quando persistência não está disponível.
 */

const STORAGE_KEY = "portfolioLanguage";
const DEFAULT_LANGUAGE = "pt-BR";

export const LANGUAGES = ["pt-BR", "en-US"];

const translations = {
    "pt-BR": {
        meta: {
            title: "Leandro — Developer Portfólio",
            description: "Portfólio de Leandro — Desenvolvedor Full Stack. Projetos, arquitetura limpa e segurança em foco.",
        },
        nav: {
            aria: "Principal",
            home: "Voltar ao início",
            about: "Sobre",
            projects: "Projetos",
            architecture: "Arquitetura",
            security: "Segurança",
            ai: "IA",
            contact: "Contato",
            openMenu: "Abrir menu",
            solar: "Sistema Solar",
        },
        language: {
            group: "Selecionar idioma",
            pt: "Português brasileiro",
            en: "Inglês americano",
        },
        loader: {
            label: "Preparando experiência…",
            entering: "Abrindo o portfólio…",
            resuming: "Retomando…",
        },
        theme: {
            light: "Light",
            dark: "Dark",
            activateLight: "Ativar tema claro",
            activateDark: "Ativar tema escuro",
        },
        solar: {
            title: "Sistema Solar Profissional",
            kicker: "Órbita profissional",
            summary: "Domínios técnicos orbitando um centro de entrega, automação e operação.",
            statusTitle: "Automação e análise com código claro.",
            statusDescription: "Scripts, integrações e rotinas confiáveis para operação real.",
            interactionHint: "Clique em um planeta ou use as setas do teclado para navegar pela cena.",
            interactionHintTouch: "Use ‹ › para navegar ou deslize na cena.",
            ready: "Pronto para abrir o portfólio.",
            enter: "Entrar no portfólio",
            navLabel: "Navegação entre planetas",
            prev: "Planeta anterior",
            next: "Próximo planeta",
            stageLabel: "Cena 3D do Sistema Solar Profissional. Clique em um planeta ou use as setas para alternar domínios.",
            python: "Python",
            sql: "SQL",
            javascript: "JavaScript",
            automation: "Automação",
            webScrapping: "Web Scrapping",
            ai: "IA",
            webSystems: "Sistemas Web",
            streamlit: "Streamlit",
        },
        hero: {
            title: "Olá, eu sou <br /><span class=\"text-gradient\">Leandro.</span>",
            subtitle: "Desenvolvedor Full Stack focado em construir interfaces fluidas, arquiteturas limpas e experiências digitais com a sutileza de um produto premium.",
            projects: "Ver projetos",
            contact: "Entrar em contato",
            years: "Anos de código",
            delivered: "Projetos entregues",
            learning: "Aprendizado contínuo",
            scroll: "Rolar para baixo",
            codeLabel: "Editor de código digitando um snippet que descreve o desenvolvedor.",
        },
        about: {
            eyebrow: "Sobre mim",
            title: "Construindo software com <span class=\"text-accent\">propósito</span>.",
            p1: "Sou desenvolvedor full stack com paixão por criar produtos digitais elegantes, performáticos e fáceis de manter. Acredito que o melhor código é aquele que desaparece — entregando uma experiência tão natural que o usuário sequer percebe a complexidade por trás.",
            p2: "Tenho conhecimento em <strong>Python, Oracle, SQL, JavaScript, PHP, HTML e CSS</strong>, além de frameworks como <strong>Django, Flask e Streamlit</strong>. Minha atuação é mais voltada para aplicações em Python, automações, dashboards e soluções web com foco em clareza, evolução contínua e manutenção simples.",
            p3: "Meu objetivo é continuar construindo produtos com impacto real — combinando o rigor técnico de um engenheiro com a sensibilidade estética de um designer.",
        },
        projects: {
            eyebrow: "Projetos",
            title: "Trabalhos selecionados",
            lead: "Uma amostra dos projetos que melhor representam minha forma de pensar e construir software.",
            featured: "Destaque",
            openVideo: "Abrir vídeo do projeto {title}",
            thumbAlt: "Preview do projeto {title}",
            timelineLabel: "Timeline",
        },
        architecture: {
            eyebrow: "Arquitetura",
            title: "Sistemas pensados para <span class=\"text-accent\">escalar</span> e durar.",
            lead: "Cada projeto é construído com camadas bem definidas, responsabilidades únicas e baixíssimo acoplamento. Código que cresce sem virar legado.",
        },
        security: {
            eyebrow: "Segurança",
            title: "Segurança não é feature. <br />É <span class=\"text-accent\">fundação</span>.",
            lead: "Adoto princípios de segurança baseados no OWASP Top 10, validação de entradas, autenticação segura, criptografia em trânsito com TLS, controle de acesso por menor privilégio e múltiplas camadas de proteção para reduzir riscos em aplicações web.",
        },
        ai: {
            eyebrow: "IA",
            title: "Pergunte sobre meu trabalho.",
            lead: "Use o assistente para entender minha experiência, habilidades, projetos e como posso ajudar em uma solução digital.",
            question: "Pergunta",
            placeholder: "Que tipo de projeto ele pode desenvolver?",
            submit: "Perguntar",
            reset: "Nova conversa",
            initial: "Pergunte sobre minhas habilidades, projetos, experiência ou como posso ajudar no seu produto.",
            shortQuestion: "Digite uma pergunta para a IA.",
            loadingStatus: "Gerando resposta...",
            loadingAnswer: "Analisando o contexto profissional de Leandro...",
            success: "Resposta gerada.",
            answerError: "Não consegui gerar uma resposta agora. Tente novamente em instantes.",
            statusError: "Falha ao consultar a IA.",
            requestError: "Falha ao consultar a IA.",
        },
        contact: {
            eyebrow: "Contato",
            title: "Vamos construir algo juntos.",
            lead: "Tem uma ideia, projeto ou oportunidade? Envie uma mensagem e te respondo em breve.",
            name: "Nome",
            namePlaceholder: "Seu nome",
            email: "E-mail",
            emailPlaceholder: "Seu e-mail",
            phone: "Telefone",
            phonePlaceholder: "(00) 00000-0000",
            message: "Mensagem",
            messagePlaceholder: "Conte um pouco sobre sua ideia...",
            honeypot: "Não preencha",
            submit: "Enviar mensagem",
            nameError: "Informe seu nome (mínimo 2 caracteres).",
            emailRequired: "Informe seu e-mail.",
            emailInvalid: "Use um endereço de e-mail válido.",
            emailDomainNotAllowed: "Use um e-mail pessoal de provedor aceito, como @gmail.com, @outlook.com ou @icloud.com.",
            messageError: "Mensagem muito curta (mínimo 10 caracteres).",
            botSuccess: "Mensagem enviada.",
            review: "Revise os campos destacados.",
            sending: "Enviando...",
            sendError: "Falha ao enviar mensagem.",
            success: "Mensagem enviada com sucesso! Em breve retorno por email.",
            unavailable: "Não foi possível enviar agora. Tente novamente em instantes.",
        },
        projectModal: {
            title: "Vídeo do projeto",
            close: "Fechar vídeo",
            fallbackTitle: "Vídeo do projeto",
        },
        footer: {
            text: "Leandro. Feito com comprometimento e atenção aos detalhes.",
        },
    },
    "en-US": {
        meta: {
            title: "Leandro — Developer Portfolio",
            description: "Leandro's portfolio — Full Stack Developer. Projects, clean architecture, and security in focus.",
        },
        nav: {
            aria: "Main",
            home: "Back to top",
            about: "About",
            projects: "Projects",
            architecture: "Architecture",
            security: "Security",
            ai: "AI",
            contact: "Contact",
            openMenu: "Open menu",
            solar: "Solar System",
        },
        language: {
            group: "Select language",
            pt: "Brazilian Portuguese",
            en: "American English",
        },
        loader: {
            label: "Preparing experience…",
            entering: "Opening the portfolio…",
            resuming: "Resuming…",
        },
        theme: {
            light: "Light",
            dark: "Dark",
            activateLight: "Activate light theme",
            activateDark: "Activate dark theme",
        },
        solar: {
            title: "Professional Solar System",
            kicker: "Professional orbit",
            summary: "Technical domains orbiting a delivery, automation, and operations core.",
            statusTitle: "Automation and analysis with clear code.",
            statusDescription: "Reliable scripts, integrations, and routines for real operations.",
            interactionHint: "Click a planet or use the keyboard arrow keys to navigate the scene.",
            interactionHintTouch: "Use ‹ › to navigate or swipe the scene.",
            ready: "Ready to open the portfolio.",
            enter: "Enter portfolio",
            navLabel: "Planet navigation",
            prev: "Previous planet",
            next: "Next planet",
            stageLabel: "3D scene of the Professional Solar System. Click a planet or use arrow keys to switch domains.",
            python: "Python",
            sql: "SQL",
            javascript: "JavaScript",
            automation: "Automation",
            webScrapping: "Web Scrapping",
            ai: "AI",
            webSystems: "Web Systems",
            streamlit: "Streamlit",
        },
        hero: {
            title: "Hi, I'm <br /><span class=\"text-gradient\">Leandro.</span>",
            subtitle: "Full Stack Developer focused on building fluid interfaces, clean architectures, and digital experiences with the subtlety of a premium product.",
            projects: "View projects",
            contact: "Get in touch",
            years: "Years coding",
            delivered: "Projects delivered",
            learning: "Continuous learning",
            scroll: "Scroll down",
            codeLabel: "Code editor typing a snippet that describes the developer.",
        },
        about: {
            eyebrow: "About me",
            title: "Building software with <span class=\"text-accent\">purpose</span>.",
            p1: "I am a full stack developer passionate about creating elegant, performant, and maintainable digital products. I believe the best code disappears, delivering an experience so natural that users do not notice the complexity behind it.",
            p2: "I work with <strong>Python, Oracle, SQL, JavaScript, PHP, HTML, and CSS</strong>, as well as frameworks such as <strong>Django, Flask, and Streamlit</strong>. My work is focused on Python applications, automation, dashboards, and web solutions with clarity, continuous evolution, and simple maintenance.",
            p3: "My goal is to keep building products with real impact, combining engineering rigor with design sensitivity.",
        },
        projects: {
            eyebrow: "Projects",
            title: "Selected work",
            lead: "A sample of projects that best represent how I think about and build software.",
            featured: "Featured",
            openVideo: "Open video for project {title}",
            thumbAlt: "Preview of project {title}",
            timelineLabel: "Timeline",
        },
        architecture: {
            eyebrow: "Architecture",
            title: "Systems designed to <span class=\"text-accent\">scale</span> and last.",
            lead: "Each project is built with clear layers, single responsibilities, and very low coupling. Code that can grow without becoming legacy.",
        },
        security: {
            eyebrow: "Security",
            title: "Security is not a feature. <br />It is the <span class=\"text-accent\">foundation</span>.",
            lead: "I adopt security principles based on the OWASP Top 10, input validation, secure authentication, TLS encryption in transit, least-privilege access control, and multiple protection layers to reduce risks in web applications.",
        },
        ai: {
            eyebrow: "AI",
            title: "Ask about my work.",
            lead: "Use the assistant to understand my experience, skills, projects, and how I can help with a digital solution.",
            question: "Question",
            placeholder: "Example: What kind of project can Leandro build?",
            submit: "Ask",
            reset: "New conversation",
            initial: "Ask about my skills, projects, experience, or how I can help with your product.",
            shortQuestion: "Type a question for the AI.",
            loadingStatus: "Generating answer...",
            loadingAnswer: "Analyzing Leandro's professional context...",
            success: "Answer generated.",
            answerError: "I could not generate an answer right now. Try again in a moment.",
            statusError: "Failed to query the AI.",
            requestError: "Failed to query the AI.",
        },
        contact: {
            eyebrow: "Contact",
            title: "Let's build something together.",
            lead: "Have an idea, project, or opportunity? Send a message and I will reply soon.",
            name: "Name",
            namePlaceholder: "Your name",
            email: "Email",
            emailPlaceholder: "Your email",
            phone: "Phone",
            phonePlaceholder: "(00) 00000-0000",
            message: "Message",
            messagePlaceholder: "Tell me a bit about your idea...",
            honeypot: "Do not fill",
            submit: "Send message",
            nameError: "Enter your name (minimum 2 characters).",
            emailRequired: "Enter your email.",
            emailInvalid: "Use a valid email address.",
            emailDomainNotAllowed: "Use a personal email from an accepted provider, such as @gmail.com, @outlook.com, or @icloud.com.",
            messageError: "Message is too short (minimum 10 characters).",
            botSuccess: "Message sent.",
            review: "Review the highlighted fields.",
            sending: "Sending...",
            sendError: "Failed to send message.",
            success: "Message sent successfully! I will reply by email soon.",
            unavailable: "Could not send right now. Try again in a moment.",
        },
        projectModal: {
            title: "Project video",
            close: "Close video",
            fallbackTitle: "Project video",
        },
        footer: {
            text: "Leandro. Built with commitment and attention to detail.",
        },
    },
};

let currentLanguage = DEFAULT_LANGUAGE;

/**
 * Recupera o idioma armazenado, ou retorna o idioma padrão se não encontrado ou inválido.
 * @returns {string} - O código do idioma armazenado ou o idioma padrão.
 */
function getStoredLanguage() {
    try {
        const language = localStorage.getItem(STORAGE_KEY);
        return LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

/**
 * Tenta armazenar a preferência de idioma, mas falha silenciosamente se localStorage não estiver disponível.
 * @param {string} language - O código do idioma a ser armazenado (e.g., "en-US").
 */
function setStoredLanguage(language) {
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // A troca visual continua funcionando mesmo sem persistência.
    }
}

/**
 * Busca uma chave aninhada em formato "grupo.item" no idioma especificado.
 * @param {string} key - A chave a ser buscada (e.g., "contact.title").
 * @param {string} language - O código do idioma a ser usado na busca (e.g., "en-US").
 * @returns {string|undefined} - O valor traduzido ou undefined se não encontrado.
 */
function lookup(key, language = currentLanguage) {
    return key.split(".").reduce((value, part) => value?.[part], translations[language]);
}

/**
 * Interpola variáveis no formato {name} em uma string.
 * @param {string} value - A string a ser interpolada.
 * @param {Object} vars - Um objeto contendo as variáveis a serem substituídas.
 * @returns {string} - A string interpolada.
 */
function interpolate(value, vars = {}) {
    return String(value).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/**
 * Retorna o idioma atualmente ativo.
 * @returns {string} - O código do idioma atualmente ativo (e.g., "en-US").
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Traduz uma chave usando o idioma especificado ou o idioma atual como fallback, e interpolando variáveis se fornecidas.
 * @param {string} key - A chave a ser traduzida (e.g., "contact.title").
 * @param {Object} vars - Um objeto contendo as variáveis a serem substituídas.
 * @param {string} language - O código do idioma a ser usado na tradução (e.g., "en-US").
 * @returns {string} - A tradução resultante.
 */
export function t(key, vars = {}, language = currentLanguage) {
    const value = lookup(key, language) ?? lookup(key, DEFAULT_LANGUAGE) ?? key;
    return interpolate(value, vars);
}

/**
 * Resolve campos data-driven que podem ser string simples ou mapa por idioma.
 * @param {string|Object} value - O valor a ser localizado, que pode ser uma string ou um objeto com chaves de idioma.
 * @param {string} language - O código do idioma a ser usado na localização (e.g., "en-US").
 * @returns {string} - O valor localizado.
 */
export function localize(value, language = currentLanguage) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value[language] ?? value[DEFAULT_LANGUAGE] ?? Object.values(value)[0] ?? "";
    }
    return value ?? "";
}

/**
 * Aplica traduções estáticas em elementos do DOM.
 * @param {Document|HTMLElement} root - O elemento raiz onde as traduções serão aplicadas.
 */
function applyStaticTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((node) => {
        node.textContent = t(node.dataset.i18n);
    });

    root.querySelectorAll("[data-i18n-html]").forEach((node) => {
        node.innerHTML = t(node.dataset.i18nHtml);
    });

    root.querySelectorAll("[data-i18n-attr]").forEach((node) => {
        node.dataset.i18nAttr.split(";").forEach((entry) => {
            const [attr, key] = entry.split(":").map((part) => part?.trim());
            if (attr && key) node.setAttribute(attr, t(key));
        });
    });
}

/**
 * Atualiza o estado dos controles de idioma para refletir o idioma atualmente ativo, incluindo atributos ARIA para acessibilidade.
 * @returns {void}
 */
function updateLanguageControls() {
    document.querySelectorAll("[data-language-option]").forEach((button) => {
        const active = button.dataset.languageOption === currentLanguage;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

/**
 * Aplica um idioma específico ao DOM e notifica módulos que renderizam conteúdo dinâmico.
 * @param {string} language - O código do idioma a ser aplicado (e.g., "en-US").
 * @param {Object} options - Opções para aplicar o idioma.
 * @param {boolean} options.persist - Se o idioma deve ser persistido (default: true).
 * @param {boolean} options.notify - Se os módulos devem ser notificados sobre a mudança de idioma (default: true).
 */
export function applyLanguage(language, { persist = true, notify = true } = {}) {
    currentLanguage = LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    document.documentElement.lang = currentLanguage;
    if (persist) setStoredLanguage(currentLanguage);
    applyStaticTranslations();
    updateLanguageControls();
    if (notify) {
        window.dispatchEvent(new CustomEvent("portfolio:languagechange", { detail: { language: currentLanguage } }));
    }
}

/**
 * Inicializa o sistema de internacionalização, aplicando o idioma persistido e registrando os controles de troca de idioma.
 * @returns {void}
 */
export function initI18n() {
    currentLanguage = getStoredLanguage();
    applyLanguage(currentLanguage, { persist: false, notify: false });

    document.querySelectorAll("[data-language-option]").forEach((button) => {
        button.addEventListener("click", () => applyLanguage(button.dataset.languageOption));
    });
}

/**
 * Registra um callback para ser chamado quando o idioma for alterado.
 * @param {function(string): void} callback - A função a ser chamada com o novo idioma.
 */
export function onLanguageChange(callback) {
    window.addEventListener("portfolio:languagechange", (event) => callback(event.detail.language));
}
