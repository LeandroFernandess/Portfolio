/**
 * data.js — Conteúdo do site (camada de dados)
 * ----------------------------------------------------------------
 * Separar dados da apresentação mantém o HTML limpo e permite
 * editar projetos/skills sem tocar em markup. main.js consome
 * estes arrays e renderiza as seções correspondentes.
 */

/** Lista de projetos. O primeiro com `featured: true` ganha destaque. */
export const projects = [
    {
        featured: true,
        title: {
            "pt-BR": "SIGP_V2 — Sistema Inteligente de Gestão Pessoal",
            "en-US": "SIGP_V2 — Intelligent Personal Management System",
        },
        description: {
            "pt-BR": "Plataforma completa para gerenciar finanças, treinos, documentos, exames, senhas e tarefas. Arquitetura modular, autenticação segura, UI responsiva e integração com IA.",
            "en-US": "Complete platform for managing finances, workouts, documents, exams, passwords, and tasks. Modular architecture, secure authentication, responsive UI, and AI integration.",
        },
        tech: ["HTML5", "CSS3", "Firebase", "JavaScript"],
        emoji: "📊",
        image: "assets/media/projects/sigpv2/SIGPV2_PRINT.webp",
        imageSrcset: "assets/media/projects/sigpv2/SIGPV2_PRINT@800.jpg 800w, assets/media/projects/sigpv2/SIGPV2_PRINT@1200.jpg 1200w, assets/media/projects/sigpv2/SIGPV2_PRINT.webp 2884w",
        imageSizes: "(max-width: 640px) calc(100vw - 2.5rem), (max-width: 1079px) 50vw, 560px",
        video: "assets/media/projects/sigpv2/SIGPV2_VIDEO_480.mp4",
        year: "2026",
        category: { "pt-BR": "Pessoal", "en-US": "Personal" },
        links: [
            { label: { "pt-BR": "Ver projeto", "en-US": "View project" }, href: "https://sigp-7bbf1.web.app/index", muted: false },
            { label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/SIGP_V2", muted: true },
        ],
    },
    {
        featured: true,
        title: {
            "pt-BR": "SIGP — Sistema Inteligente de Gestão Pessoal",
            "en-US": "SIGP — Intelligent Personal Management System",
        },
        description: {
            "pt-BR": "Plataforma completa para gerenciar finanças, treinos, documentos, exames, senhas e tarefas. Arquitetura modular, autenticação segura, UI responsiva construído inteiramente com python e streamlit.",
            "en-US": "Complete platform for managing finances, workouts, documents, exams, passwords, and tasks. Modular architecture, secure authentication, and a responsive UI built entirely with Python and Streamlit.",
        },
        tech: ["Streamlit", "Firebase"],
        emoji: "📊",
        image: "assets/media/projects/sigp/SIGP_PRINT.webp",
        video: "assets/media/projects/sigp/SIGP_VIDEO_720.mp4",
        year: "2025",
        category: { "pt-BR": "Pessoal", "en-US": "Personal" },
        links: [
            { label: { "pt-BR": "Ver projeto", "en-US": "View project" }, href: "https://sistemaigp.streamlit.app", muted: false },
            { label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/SIGP", muted: true },
        ],
    },
    {
        title: {
            "pt-BR": "Disk Analyzer",
            "en-US": "Disk Analyzer",
        },
        description: {
            "pt-BR": "Script Python para identificar discos no computador e localizar arquivos grandes que estão ocupando espaço, facilitando a limpeza e otimização do armazenamento.",
            "en-US": "Python script that identifies computer drives and locates large files taking up space, making storage cleanup and optimization easier.",
        },
        tech: ["Python"],
        year: "2026",
        category: { "pt-BR": "Pessoal", "en-US": "Personal" },
        links: [{ label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/Disk-Analyzer", muted: false }],
    },
    {
        title: {
            "pt-BR": "Controle Financeiro",
            "en-US": "Finance Control",
        },
        description: {
            "pt-BR": "Um sistema de gerenciamento financeiro desenvolvido com Python e Streamlit. O projeto permite acompanhar receitas, despesas, contas fixas, faturas de cartão de crédito e resumos financeiros de forma intuitiva.",
            "en-US": "A financial management system built with Python and Streamlit. It tracks income, expenses, recurring bills, credit card invoices, and financial summaries in an intuitive way.",
        },
        tech: ["Python", "Streamlit", "PostGres", "Twilio"],
        year: "2025",
        category: { "pt-BR": "Pessoal", "en-US": "Personal" },
        links: [{ label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/Controle-Financeiro", muted: false }],
    },
    {
        title: {
            "pt-BR": "Flix App",
            "en-US": "Flix App",
        },
        description: {
            "pt-BR": "Um sistema modular para gerenciamento de dados relacionado a filmes, gêneros, atores, avaliações e autenticação de usuários. O projeto utiliza Python, com uma arquitetura limpa e organizada para cada funcionalidade.",
            "en-US": "A modular system for managing movie-related data, including genres, actors, reviews, and user authentication. The project uses Python with a clean, organized architecture for each feature.",
        },
        tech: ["Python", "Streamlit"],
        year: "2025",
        category: { "pt-BR": "Estudo", "en-US": "Study" },
        links: [{ label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/Flix-App", muted: false }],
    },
    {
        title: {
            "pt-BR": "Sistema de gerenciamento de estoque (SGE)",
            "en-US": "Inventory Management System (SGE)",
        },
        description: {
            "pt-BR": "Um sistema desenvolvido com Django, HTML, CSS e JavaScript para gerenciamento de marcas, categorias e métricas. O projeto permite criar, editar, visualizar e excluir registros, além de contar com autenticação de usuários.",
            "en-US": "A system built with Django, HTML, CSS, and JavaScript for managing brands, categories, and metrics. It supports creating, editing, viewing, and deleting records, with user authentication.",
        },
        tech: ["JavaScript", "HTML5", "CSS3", "Django", "PostGres/SQlite"],
        year: "2025",
        category: { "pt-BR": "Estudo", "en-US": "Study" },
        links: [{ label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/SGE", muted: false }],
    },
    {
        title: {
            "pt-BR": "Carros",
            "en-US": "Cars",
        },
        description: {
            "pt-BR": "Um sistema de gerenciamento de carros desenvolvido com Django, HTML, CSS e JavaScript. O projeto permite adicionar, editar, visualizar e excluir carros de um inventário, além de gerenciar contas de usuário.",
            "en-US": "A car management system built with Django, HTML, CSS, and JavaScript. It supports adding, editing, viewing, and deleting cars from an inventory, plus user account management.",
        },
        tech: ["JavaScript", "HTML5", "CSS3", "Django", "SQlite"],
        year: "2025",
        category: { "pt-BR": "Estudo", "en-US": "Study" },
        links: [{ label: { "pt-BR": "Código fonte", "en-US": "Source code" }, href: "https://github.com/LeandroFernandess/Carros", muted: false }],
    },

];

/** Pilares de arquitetura (seção "Arquitetura"). */
export const architecture = [
    {
        icon: "🧩",
        title: { "pt-BR": "Modular por design", "en-US": "Modular by design" },
        text: {
            "pt-BR": "Cada feature em seu próprio módulo, com handlers, serviços e UI isolados. Mudanças locais não vazam para o resto do sistema.",
            "en-US": "Each feature lives in its own module, with isolated handlers, services, and UI. Local changes do not leak into the rest of the system.",
        },
    },
    {
        icon: "🔁",
        title: { "pt-BR": "Event-driven", "en-US": "Event-driven" },
        text: {
            "pt-BR": "EventBus central desacopla módulos. Componentes se comunicam por intenção, não por referência direta.",
            "en-US": "A central EventBus decouples modules. Components communicate by intent, not by direct reference.",
        },
    },
    {
        icon: "📐",
        title: { "pt-BR": "Clean Architecture", "en-US": "Clean Architecture" },
        text: {
            "pt-BR": "Camadas de apresentação, aplicação e dados claramente separadas. Regras de negócio independentes de framework.",
            "en-US": "Presentation, application, and data layers remain clearly separated. Business rules stay independent from frameworks.",
        },
    },
    {
        icon: "⚡",
        title: { "pt-BR": "Performance first", "en-US": "Performance first" },
        text: {
            "pt-BR": "Lazy loading, code splitting, cache estratégico e bundles otimizados. Cada milissegundo importa.",
            "en-US": "Lazy loading, code splitting, strategic caching, and optimized bundles. Every millisecond matters.",
        },
    },
    {
        icon: "🧪",
        title: { "pt-BR": "Testável", "en-US": "Testable" },
        text: {
            "pt-BR": "Funções puras, injeção de dependência e fronteiras bem definidas tornam cada peça simples de testar.",
            "en-US": "Pure functions, dependency injection, and clear boundaries make each piece easier to test.",
        },
    },
    {
        icon: "📖",
        title: { "pt-BR": "Documentação viva", "en-US": "Living documentation" },
        text: {
            "pt-BR": "READMEs claros, comentários onde importam e nomes que explicam a intenção. Onboarding em minutos, não em dias.",
            "en-US": "Clear READMEs, comments where they matter, and names that explain intent. Onboarding in minutes, not days.",
        },
    },
];

/** Princípios de segurança (seção "Segurança"). */
export const security = [
    {
        icon: "🛡️",
        title: {
            "pt-BR": "OWASP Top 10 (Open Worldwide Application Security Project)",
            "en-US": "OWASP Top 10 (Open Worldwide Application Security Project)",
        },
        text: {
            "pt-BR": "Proteção contra XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), injeção e exposição de dados sensíveis em todas as camadas.",
            "en-US": "Protection against XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), injection, and sensitive data exposure across layers.",
        },
    },
    {
        icon: "🔑",
        title: { "pt-BR": "Autenticação robusta", "en-US": "Robust authentication" },
        text: {
            "pt-BR": "Autenticação segura, controle de sessão e suporte a múltiplos fatores quando aplicável.",
            "en-US": "Secure authentication, session control, and multi-factor support when applicable.",
        },
    },
    {
        icon: "🔐",
        title: { "pt-BR": "Criptografia", "en-US": "Encryption" },
        text: {
            "pt-BR": "Web Crypto API para dados sensíveis em repouso, TLS em trânsito e hashing forte para credenciais.",
            "en-US": "Web Crypto API for sensitive data at rest, TLS in transit, and strong hashing for credentials.",
        },
    },
    {
        icon: "🚦",
        title: { "pt-BR": "Validação dupla", "en-US": "Double validation" },
        text: {
            "pt-BR": "Validação no cliente para UX, validação no servidor para segurança. Nunca confiar em entradas.",
            "en-US": "Client-side validation for UX, server-side validation for security. Never trust input.",
        },
    },
    {
        icon: "🔍",
        title: { "pt-BR": "Auditoria & logs", "en-US": "Auditing & logs" },
        text: {
            "pt-BR": "Logs estruturados, alertas de comportamento anômalo e trilhas de auditoria sem dados sensíveis.",
            "en-US": "Structured logs, anomalous behavior alerts, and audit trails without sensitive data.",
        },
    },
    {
        icon: "🧱",
        title: { "pt-BR": "Defesa em profundidade", "en-US": "Defense in depth" },
        text: {
            "pt-BR": "Múltiplas camadas de proteção — CSP (Content Security Policy), rate limiting, sanitização e isolamento de contextos.",
            "en-US": "Multiple protection layers — CSP (Content Security Policy), rate limiting, sanitization, and context isolation.",
        },
    },
];

/** Chips de competências (seção "Sobre"). */
export const skills = [
    "🐍 Python",
    "🗄️ Oracle",
    "🧮 SQL",
    "🟨 JavaScript",
    "🧱 HTML",
    "🎨 CSS",
    "🌿 Django",
    "⚡ Flask",
    "📊 Streamlit",
    "🐘 PHP"
];

/**
 * Linhas de código exibidas no editor animado do hero.
 * Cada item é um array de tokens [tipo, texto] que o
 * code-animation.js digita e colore. Indentação embutida.
 */
export const heroCode = {
    "pt-BR": [
        [["plain", "dev "], ["punct", "= {"]],
        [["plain", "    "], ["string", '"nome"'], ["punct", ": "], ["string", '"Leandro"'], ["punct", ","]],
        [["plain", "    "], ["string", '"stack"'], ["punct", ": ["], ["string", '"Python"'], ["punct", ", "], ["string", '"SQL"'], ["punct", ", "], ["string", '"Streamlit"'], ["punct", "],"]],
        [["plain", "    "], ["string", '"foco"'], ["punct", ": "], ["string", '"automação e software web"'], ["punct", ","]],
        [["punct", "}"]],
        [],
        [["keyword", "def"], ["plain", " "], ["function", "construir"], ["punct", "("], ["plain", "ideia"], ["punct", "):"]],
        [["plain", "    "], ["keyword", "return"], ["plain", " ideia"], ["punct", "."], ["function", "com_interface"], ["punct", "()"]],
        [["plain", "        "], ["punct", "."], ["function", "com_dados"], ["punct", "()"]],
        [["plain", "        "], ["punct", "."], ["function", "publicar"], ["punct", "()"]],
    ],
    "en-US": [
        [["plain", "profile "], ["punct", "= {"]],
        [["plain", "    "], ["string", '"name"'], ["punct", ": "], ["string", '"Leandro"'], ["punct", ","]],
        [["plain", "    "], ["string", '"stack"'], ["punct", ": ["], ["string", '"Python"'], ["punct", ", "], ["string", '"SQL"'], ["punct", ", "], ["string", '"Streamlit"'], ["punct", "],"]],
        [["plain", "    "], ["string", '"focus"'], ["punct", ": "], ["string", '"automation and web software"'], ["punct", ","]],
        [["punct", "}"]],
        [],
        [["keyword", "def"], ["plain", " "], ["function", "build"], ["punct", "("], ["plain", "idea"], ["punct", "):"]],
        [["plain", "    "], ["keyword", "return"], ["plain", " idea"], ["punct", "."], ["function", "with_interface"], ["punct", "()"]],
        [["plain", "        "], ["punct", "."], ["function", "with_data"], ["punct", "()"]],
        [["plain", "        "], ["punct", "."], ["function", "publish"], ["punct", "()"]],
    ],
};
