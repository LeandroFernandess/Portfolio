/**
 * professional-solar-system.js — Intro 3D lazy-loaded
 * ----------------------------------------------------------------
 * Usa Three.js apenas quando a intro abre e mantém fallback HTML/CSS.
 */

import { localize, onLanguageChange } from "./i18n.js";

const THREE_CDN_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const getThemeValue = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
};

/**
 * Domínios representados como planetas, com propriedades para renderização e descrição.
 * - `id`: Identificador único do domínio.
 * - `label`: Rótulo curto para o domínio (string ou objeto i18n).
 * - `title`: Título descritivo do domínio (objeto i18n).
 * - `description`: Descrição detalhada do domínio (objeto i18n).
 * - `color`: Cor hexadecimal para o planeta.
 * - `orbit`: Distância orbital do planeta em relação ao centro.
 * - `size`: Tamanho relativo do planeta.
 * - `speed`: Velocidade de rotação orbital do planeta.
 * - `phase`: Fase inicial da órbita para posicionamento aleatório.
 */
const DOMAINS = [
    {
        id: "python",
        label: "Python",
        title: {
            "pt-BR": "Automação e análise com código claro.",
            "en-US": "Automation and analysis with clear code.",
        },
        description: {
            "pt-BR": "Scripts, integrações e rotinas confiáveis para operação real.",
            "en-US": "Reliable scripts, integrations, and routines for real operations.",
        },
        color: 0x7c9cff,
        orbit: 2.15,
        size: 0.16,
        speed: 0.42,
        phase: 0.1,
    },
    {
        id: "sql",
        label: "SQL",
        title: {
            "pt-BR": "Dados estruturados para decisão.",
            "en-US": "Structured data for decisions.",
        },
        description: {
            "pt-BR": "Consultas, modelagem e bases organizadas para indicadores.",
            "en-US": "Queries, modeling, and organized databases for indicators.",
        },
        color: 0x7ee0b8,
        orbit: 2.65,
        size: 0.14,
        speed: 0.32,
        phase: 1.2,
    },
    {
        id: "django",
        label: "Django",
        title: {
            "pt-BR": "Backends seguros e sustentáveis.",
            "en-US": "Secure and sustainable backends.",
        },
        description: {
            "pt-BR": "Sistemas web com arquitetura simples de evoluir.",
            "en-US": "Web systems with architecture that is simple to evolve.",
        },
        color: 0x38bdf8,
        orbit: 3.1,
        size: 0.18,
        speed: 0.27,
        phase: 2.1,
    },
    {
        id: "automation",
        label: { "pt-BR": "Automação", "en-US": "Automation" },
        title: {
            "pt-BR": "Processos repetitivos viram fluxo.",
            "en-US": "Repetitive processes become workflows.",
        },
        description: {
            "pt-BR": "Menos trabalho manual, mais consistência operacional.",
            "en-US": "Less manual work, more operational consistency.",
        },
        color: 0xffb86c,
        orbit: 3.55,
        size: 0.17,
        speed: 0.24,
        phase: 2.9,
    },
    {
        id: "web-scrapping",
        label: "Web Scrapping",
        title: {
            "pt-BR": "Obter informações rápidas e automáticas.",
            "en-US": "Fast, automated information retrieval.",
        },
        description: {
            "pt-BR": "Redução de trabalho repetitivo e entregas ágeis.",
            "en-US": "Less repetitive work and faster deliveries.",
        },
        color: 0xfacc15,
        orbit: 4,
        size: 0.15,
        speed: 0.2,
        phase: 3.8,
    },
    {
        id: "ai",
        label: { "pt-BR": "IA", "en-US": "AI" },
        title: {
            "pt-BR": "IA aplicada com contexto.",
            "en-US": "Context-aware applied AI.",
        },
        description: {
            "pt-BR": "Assistentes e automações úteis, com foco em segurança.",
            "en-US": "Useful assistants and automations with a security focus.",
        },
        color: 0xc4a0ff,
        orbit: 4.45,
        size: 0.2,
        speed: 0.18,
        phase: 4.7,
    },
    {
        id: "web-systems",
        label: { "pt-BR": "Sistemas Web", "en-US": "Web Systems" },
        title: {
            "pt-BR": "Interfaces para uso real.",
            "en-US": "Interfaces for real use.",
        },
        description: {
            "pt-BR": "Experiências responsivas, claras e conectadas à operação.",
            "en-US": "Responsive, clear experiences connected to operations.",
        },
        color: 0xf87171,
        orbit: 4.9,
        size: 0.17,
        speed: 0.15,
        phase: 5.4,
    },
    {
        id: "streamlit",
        label: "Streamlit",
        title: {
            "pt-BR": "Sistemas web completos e práticos.",
            "en-US": "Complete, practical web systems.",
        },
        description: {
            "pt-BR": "Rotinas, indicadores e sistemas alinhados ao dia a dia.",
            "en-US": "Routines, indicators, and systems aligned with daily work.",
        },
        color: 0x10b981,
        orbit: 5.35,
        size: 0.16,
        speed: 0.13,
        phase: 6,
    },
];

/**
 * Cria o sistema solar profissional dentro do elemento raiz fornecido.
 * @param {HTMLElement} root O elemento raiz que contém o sistema solar.
 * @returns {void}
 */
export function createProfessionalSolarSystem(root) {
    const stage = root.querySelector("[data-solar-stage]");
    const fallback = root.querySelector("[data-solar-fallback]");
    const fallbackButtons = Array.from(root.querySelectorAll("[data-solar-domain]"));
    const labelEl = root.querySelector("[data-solar-active-label]");
    const titleEl = root.querySelector("[data-solar-active-title]");
    const descriptionEl = root.querySelector("[data-solar-active-description]");
    const mediaQuery = window.matchMedia?.(REDUCED_MOTION_QUERY);
    const isCoarsePointer = Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);

    let THREE = null;
    let scene = null;
    let camera = null;
    let renderer = null;
    let raycaster = null;
    let pointer = null;
    let animationFrame = 0;
    let started = false;
    let fallbackMode = false;
    let activeDomain = DOMAINS[0];
    let planetEntries = [];
    let disposableObjects = [];
    let resizeObserver = null;
    let lastTime = 0;

    const setActiveDomain = (domain, { focus = false } = {}) => {
        if (!domain) return;
        activeDomain = domain;
        if (labelEl) labelEl.textContent = localize(domain.label);
        if (titleEl) titleEl.textContent = localize(domain.title);
        if (descriptionEl) descriptionEl.textContent = localize(domain.description);

        fallbackButtons.forEach((button) => {
            const selected = button.dataset.domainId === domain.id;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", String(selected));
            button.setAttribute("tabindex", selected ? "0" : "-1");
            if (focus && selected) button.focus();
        });

        planetEntries.forEach((entry) => {
            const selected = entry.domain.id === domain.id;
            entry.mesh.scale.setScalar(selected ? 1.35 : 1);
            entry.glow.scale.setScalar(selected ? 2.8 : 2.25);
            entry.glow.material.opacity = selected ? entry.activeGlowOpacity : entry.baseGlowOpacity;
        });
    };

    const setFallbackMode = (enabled) => {
        fallbackMode = enabled;
        root.classList.toggle("is-fallback", enabled);
        if (stage) stage.hidden = enabled;
        if (fallback) fallback.hidden = !enabled;
    };

    const supportsWebGL = () => {
        try {
            const canvas = document.createElement("canvas");
            return Boolean(window.WebGLRenderingContext && (
                canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
            ));
        } catch {
            return false;
        }
    };

    const updateRendererSize = () => {
        if (!stage || !renderer || !camera) return;
        const rect = stage.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    const createCircleTexture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(0.24, "rgba(165,184,255,0.35)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 96, 96);
        const texture = new THREE.CanvasTexture(canvas);
        disposableObjects.push(texture);
        return texture;
    };

    const track = (...items) => {
        disposableObjects.push(...items);
        return items[0];
    };

    const buildScene = () => {
        if (!stage || !THREE) return;
        const palette = {
            starColor: getThemeValue("--solar-star-color", "#9fb4ff"),
            starOpacity: Number.parseFloat(getThemeValue("--solar-star-opacity", "0.62")),
            orbitColor: getThemeValue("--solar-orbit-color", "#7c9cff"),
            orbitOpacity: Number.parseFloat(getThemeValue("--solar-orbit-opacity", "0.12")),
            coreColor: getThemeValue("--solar-core-color", "#ffffff"),
            coreEmissive: getThemeValue("--solar-core-emissive", "#7c9cff"),
            coreEmissiveIntensity: Number.parseFloat(getThemeValue("--solar-core-emissive-intensity", "1.2")),
            coreGlowColor: getThemeValue("--solar-core-glow-color", "#7c9cff"),
            coreGlowOpacity: Number.parseFloat(getThemeValue("--solar-core-glow-opacity", "0.42")),
            planetGlowOpacity: Number.parseFloat(getThemeValue("--solar-planet-glow-opacity", "0.13")),
        };

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
        camera.position.set(0, 4.9, 8.4);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isCoarsePointer, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.5 : 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        stage.append(renderer.domElement);

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2(10, 10);

        const ambient = new THREE.AmbientLight(0xb8c7ff, 1.8);
        const point = new THREE.PointLight(0x9fb4ff, 16, 18);
        point.position.set(0, 1.2, 1.2);
        scene.add(ambient, point);

        const starGeometry = track(new THREE.BufferGeometry());
        const starPositions = [];
        for (let i = 0; i < 160; i += 1) {
            const radius = 5 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            starPositions.push(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 4.2,
                Math.sin(angle) * radius - 1.8
            );
        }
        starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
        const starMaterial = track(new THREE.PointsMaterial({
            color: palette.starColor,
            size: 0.018,
            transparent: true,
            opacity: palette.starOpacity,
        }));
        scene.add(new THREE.Points(starGeometry, starMaterial));

        const coreGeometry = track(new THREE.SphereGeometry(0.66, 48, 48));
        const coreMaterial = track(new THREE.MeshStandardMaterial({
            color: palette.coreColor,
            emissive: palette.coreEmissive,
            emissiveIntensity: palette.coreEmissiveIntensity,
            roughness: 0.45,
            metalness: 0.05,
        }));
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);

        const spriteTexture = createCircleTexture();
        const coreGlow = new THREE.Sprite(track(new THREE.SpriteMaterial({
            map: spriteTexture,
            color: palette.coreGlowColor,
            transparent: true,
            opacity: palette.coreGlowOpacity,
            depthWrite: false,
        })));
        coreGlow.scale.set(2.8, 2.8, 1);
        scene.add(coreGlow);

        planetEntries = DOMAINS.map((domain) => {
            const orbitGeometry = track(new THREE.RingGeometry(domain.orbit - 0.004, domain.orbit + 0.004, 160));
            const orbitMaterial = track(new THREE.MeshBasicMaterial({
                color: palette.orbitColor,
                transparent: true,
                opacity: palette.orbitOpacity,
                side: THREE.DoubleSide,
            }));
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);

            const geometry = track(new THREE.SphereGeometry(domain.size, 32, 32));
            const material = track(new THREE.MeshStandardMaterial({
                color: domain.color,
                emissive: domain.color,
                emissiveIntensity: 0.25,
                roughness: 0.38,
                metalness: 0.08,
            }));
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.domainId = domain.id;
            scene.add(mesh);

            const glow = new THREE.Sprite(track(new THREE.SpriteMaterial({
                map: spriteTexture,
                color: domain.color,
                transparent: true,
                opacity: palette.planetGlowOpacity,
                depthWrite: false,
            })));
            glow.scale.setScalar(2.25);
            scene.add(glow);

            return {
                domain,
                mesh,
                glow,
                orbit,
                baseGlowOpacity: palette.planetGlowOpacity,
                activeGlowOpacity: Math.max(palette.planetGlowOpacity * 2.15, palette.planetGlowOpacity + 0.12),
            };
        });

        updateRendererSize();
        resizeObserver = new ResizeObserver(updateRendererSize);
        resizeObserver.observe(stage);
        setActiveDomain(activeDomain);
    };

    const positionPlanets = (elapsed) => {
        const reduceMotion = Boolean(mediaQuery?.matches);
        planetEntries.forEach((entry, index) => {
            const speed = reduceMotion ? 0.015 : entry.domain.speed;
            const angle = entry.domain.phase + elapsed * speed;
            const tilt = index % 2 === 0 ? 0.18 : -0.14;
            const x = Math.cos(angle) * entry.domain.orbit;
            const z = Math.sin(angle) * entry.domain.orbit * 0.68;
            const y = Math.sin(angle * 0.8) * tilt;
            entry.mesh.position.set(x, y, z);
            entry.glow.position.copy(entry.mesh.position);
            entry.mesh.rotation.y += reduceMotion ? 0.002 : 0.014;
        });
    };

    const animate = (time = 0) => {
        if (!started || fallbackMode || !renderer || !scene || !camera) return;
        animationFrame = window.requestAnimationFrame(animate);
        lastTime = time * 0.001;
        positionPlanets(lastTime);
        renderer.render(scene, camera);
    };

    const pickFromEvent = (event, { commit = false } = {}) => {
        if (!stage || !raycaster || !camera || fallbackMode) return;
        const rect = stage.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(planetEntries.map((entry) => entry.mesh), false);
        const picked = intersections[0]?.object?.userData?.domainId;
        const domain = DOMAINS.find((item) => item.id === picked);
        if (domain) setActiveDomain(domain);
        if (commit && domain) setActiveDomain(domain);
    };

    const handlePointerMove = (event) => pickFromEvent(event);
    const handleClick = (event) => pickFromEvent(event, { commit: true });
    const handlePointerLeave = () => {
        if (!fallbackMode) setActiveDomain(activeDomain);
    };

    const handleFallbackClick = (event) => {
        const button = event.currentTarget;
        const domain = DOMAINS.find((item) => item.id === button.dataset.domainId);
        setActiveDomain(domain);
    };

    const handleFallbackFocus = (event) => {
        const button = event.currentTarget;
        const domain = DOMAINS.find((item) => item.id === button.dataset.domainId);
        setActiveDomain(domain);
    };

    const handleKeyDown = (event) => {
        const isDomainTarget = event.target?.matches?.("[data-solar-domain]");
        const isStageTarget = event.target?.matches?.("[data-solar-stage]");
        if (!isDomainTarget && !isStageTarget) return;

        const currentIndex = DOMAINS.findIndex((domain) => domain.id === activeDomain.id);
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            setActiveDomain(DOMAINS[(currentIndex + 1) % DOMAINS.length], { focus: isDomainTarget });
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            setActiveDomain(DOMAINS[(currentIndex - 1 + DOMAINS.length) % DOMAINS.length], { focus: isDomainTarget });
        }
        if (event.key === "Home") {
            event.preventDefault();
            setActiveDomain(DOMAINS[0], { focus: isDomainTarget });
        }
        if (event.key === "End") {
            event.preventDefault();
            setActiveDomain(DOMAINS[DOMAINS.length - 1], { focus: isDomainTarget });
        }
    };

    const handleVisibility = () => {
        if (document.visibilityState === "hidden") {
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            }
            return;
        }
        if (started && !fallbackMode && renderer && !animationFrame) {
            animate();
        }
    };

    const attachListeners = () => {
        stage?.addEventListener("pointermove", handlePointerMove);
        stage?.addEventListener("pointerleave", handlePointerLeave);
        stage?.addEventListener("click", handleClick);
        root.addEventListener("keydown", handleKeyDown);
        document.addEventListener("visibilitychange", handleVisibility);
        fallbackButtons.forEach((button) => {
            button.addEventListener("click", handleFallbackClick);
            button.addEventListener("focus", handleFallbackFocus);
        });
    };

    const removeListeners = () => {
        stage?.removeEventListener("pointermove", handlePointerMove);
        stage?.removeEventListener("pointerleave", handlePointerLeave);
        stage?.removeEventListener("click", handleClick);
        root.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("visibilitychange", handleVisibility);
        fallbackButtons.forEach((button) => {
            button.removeEventListener("click", handleFallbackClick);
            button.removeEventListener("focus", handleFallbackFocus);
        });
    };

    const startFallback = () => {
        setFallbackMode(true);
        attachListeners();
        setActiveDomain(DOMAINS[0]);
    };

    const start = async () => {
        if (started) return;
        started = true;
        activeDomain = DOMAINS[0];
        setActiveDomain(activeDomain);

        if (!supportsWebGL() || !stage) {
            startFallback();
            return;
        }

        try {
            setFallbackMode(false);
            THREE = await import(THREE_CDN_URL);
            if (!started) return;
            buildScene();
            attachListeners();
            animate();
        } catch {
            if (!started) return;
            cleanup();
            started = true;
            startFallback();
        }
    };

    const cleanup = () => {
        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }

        removeListeners();
        resizeObserver?.disconnect();
        resizeObserver = null;

        planetEntries = [];
        disposableObjects.forEach((item) => item?.dispose?.());
        disposableObjects = [];

        renderer?.dispose?.();
        renderer?.domElement?.remove?.();

        scene = null;
        camera = null;
        renderer = null;
        raycaster = null;
        pointer = null;
        lastTime = 0;
        started = false;
        setFallbackMode(false);
        setActiveDomain(DOMAINS[0]);
    };

    if (fallback) fallback.hidden = true;
    setActiveDomain(DOMAINS[0]);
    onLanguageChange(() => setActiveDomain(activeDomain));

    return { start, cleanup };
}
