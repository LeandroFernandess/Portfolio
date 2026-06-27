/**
 * professional-solar-system.js
 * ----------------------------------------------------------------
 * Cria o sistema solar profissional, com planetas representando habilidades e 
 * tecnologias. O sistema é interativo, responsivo e acessível, permitindo 
 * navegação por teclado e leitores de tela.
 */

import { localize as e, onLanguageChange as t } from "./i18n.js";
import { debugLog as a } from "./debug.js";

/**
 * Adiciona um evento de log para monitorar ações e eventos do sistema solar profissional.
 * @param {*} e - Nome do evento a ser registrado.
 * @param {*} t - Dados adicionais relacionados ao evento.
 */
function o(e, t = {}) {
  a("solar", e, { now: Math.round(performance.now()), ...t });
}

/**
 * Obtém o valor de uma propriedade CSS personalizada.
 * @param {string} e - Nome da propriedade CSS.
 * @param {string} t - Valor padrão caso a propriedade não esteja definida.
 * @returns {string} - Valor da propriedade CSS ou o valor padrão.
 */
const i = (e, t) =>
    getComputedStyle(document.documentElement).getPropertyValue(e).trim() || t,
  n = [
    {
      id: "python",
      label: "Python",
      title: {
        "pt-BR": "Automação e análise com código claro.",
        "en-US": "Automation and analysis with clear code.",
      },
      description: {
        "pt-BR":
          "Scripts, integrações e rotinas confiáveis para operação real.",
        "en-US":
          "Reliable scripts, integrations, and routines for real operations.",
      },
      color: 8166655,
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
      color: 8315064,
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
      color: 3718648,
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
      color: 16758892,
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
      color: 16436245,
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
      color: 12886271,
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
      color: 16281969,
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
      color: 1096065,
      orbit: 5.35,
      size: 0.16,
      speed: 0.13,
      phase: 6,
    },
  ];

/**
 * Cria o sistema solar profissional, inicializando os elementos do DOM e configurando os eventos.
 * @param {HTMLElement} a - Elemento raiz do sistema solar profissional.
 * @returns {void}
 */
export function createProfessionalSolarSystem(a) {
  const r = a.querySelector("[data-solar-stage]"),
    s = a.querySelector("[data-solar-fallback]"),
    l = Array.from(a.querySelectorAll("[data-solar-domain]")),
    c = a.querySelector("[data-solar-active-label]"),
    d = a.querySelector("[data-solar-active-title]"),
    p = a.querySelector("[data-solar-active-description]"),
    m = a.querySelector("[data-solar-prev]"),
    u = a.querySelector("[data-solar-next]"),
    h = a.querySelector("[data-solar-dots]"),
    b = window.matchMedia?.("(prefers-reduced-motion: reduce)"),
    w = Boolean(window.matchMedia?.("(pointer: coarse)")?.matches),
    f = h
      ? n.map((t) => {
          const a = document.createElement("button");
          return (
            (a.type = "button"),
            (a.className = "solar-intro__dot"),
            (a.dataset.domainId = t.id),
            a.setAttribute("aria-label", e(t.label)),
            h.append(a),
            a
          );
        })
      : [];
  let v = null,
    g = null,
    y = null,
    S = null,
    E = null,
    R = null,
    M = 0,
    B = !1,
    L = !1,
    x = n[0],
    C = [],
    A = [],
    k = null,
    I = 0,
    G = 0;
  o("create", { hasStage: Boolean(r), coarsePointer: w });
  const U = (t, { focus: a = !1 } = {}) => {
      t &&
        ((x = t),
        c && (c.textContent = e(t.label)),
        d && (d.textContent = e(t.title)),
        p && (p.textContent = e(t.description)),
        l.forEach((e) => {
          const o = e.dataset.domainId === t.id;
          (e.classList.toggle("is-active", o),
            e.setAttribute("aria-pressed", String(o)),
            e.setAttribute("tabindex", o ? "0" : "-1"),
            a && o && e.focus());
        }),
        f.forEach((e) => {
          const a = e.dataset.domainId === t.id;
          (e.classList.toggle("is-active", a),
            a
              ? e.setAttribute("aria-current", "true")
              : e.removeAttribute("aria-current"));
        }),
        C.forEach((e) => {
          const a = e.domain.id === t.id;
          (e.mesh.scale.setScalar(a ? 1.35 : 1),
            e.glow.scale.setScalar(a ? 2.8 : 2.25),
            (e.glow.material.opacity = a
              ? e.activeGlowOpacity
              : e.baseGlowOpacity));
        }));
    },
    O = (e) => {
      ((L = e),
        a.classList.toggle("is-fallback", e),
        r && (r.hidden = e),
        s && (s.hidden = !e));
    },
    P = () => {
      try {
        const e = document.createElement("canvas");
        return Boolean(
          window.WebGLRenderingContext &&
          (e.getContext("webgl") || e.getContext("experimental-webgl")),
        );
      } catch {
        return !1;
      }
    },
    z = () => {
      if (!r || !S || !y) return;
      const e = r.getBoundingClientRect(),
        t = Math.max(1, e.width),
        a = Math.max(1, e.height);
      (S.setSize(t, a, !1), (y.aspect = t / a), y.updateProjectionMatrix());
    },
    F = (...e) => (A.push(...e), e[0]),
    q = () => {
      if (!r || !v) return;
      const e = {
        starColor: i("--solar-star-color", "#9fb4ff"),
        starOpacity: Number.parseFloat(i("--solar-star-opacity", "0.62")),
        orbitColor: i("--solar-orbit-color", "#7c9cff"),
        orbitOpacity: Number.parseFloat(i("--solar-orbit-opacity", "0.12")),
        coreColor: i("--solar-core-color", "#ffffff"),
        coreEmissive: i("--solar-core-emissive", "#7c9cff"),
        coreEmissiveIntensity: Number.parseFloat(
          i("--solar-core-emissive-intensity", "1.2"),
        ),
        coreGlowColor: i("--solar-core-glow-color", "#7c9cff"),
        coreGlowOpacity: Number.parseFloat(
          i("--solar-core-glow-opacity", "0.42"),
        ),
        planetGlowOpacity: Number.parseFloat(
          i("--solar-planet-glow-opacity", "0.13"),
        ),
      };
      ((g = new v.Scene()),
        (y = new v.PerspectiveCamera(46, 1, 0.1, 100)),
        y.position.set(0, 4.9, 8.4),
        y.lookAt(0, 0, 0),
        (S = new v.WebGLRenderer({
          alpha: !0,
          antialias: !w,
          powerPreference: "high-performance",
        })),
        S.setPixelRatio(Math.min(window.devicePixelRatio || 1, w ? 1.5 : 1.75)),
        (S.outputColorSpace = v.SRGBColorSpace),
        r.append(S.domElement),
        o("webgl:renderer-created", {
          pixelRatio: S.getPixelRatio?.() ?? null,
          powerPreference: "high-performance",
          width: Math.round(r.getBoundingClientRect().width),
          height: Math.round(r.getBoundingClientRect().height),
        }),
        S.domElement.addEventListener("webglcontextlost", (e) => {
          ((G += 1), o("webgl:context-lost", { count: G }), e.preventDefault());
        }),
        S.domElement.addEventListener("webglcontextrestored", () => {
          o("webgl:context-restored", { count: G });
        }),
        (E = new v.Raycaster()),
        (R = new v.Vector2(10, 10)));
      const t = new v.AmbientLight(12109823, 1.8),
        a = new v.PointLight(10466559, 16, 18);
      (a.position.set(0, 1.2, 1.2), g.add(t, a));
      const s = F(new v.BufferGeometry()),
        l = [],
        c = w ? 90 : 160;
      for (let e = 0; e < c; e += 1) {
        const e = 5 + 8 * Math.random(),
          t = Math.random() * Math.PI * 2;
        l.push(
          Math.cos(t) * e,
          4.2 * (Math.random() - 0.5),
          Math.sin(t) * e - 1.8,
        );
      }
      s.setAttribute("position", new v.Float32BufferAttribute(l, 3));
      const d = F(
        new v.PointsMaterial({
          color: e.starColor,
          size: 0.018,
          transparent: !0,
          opacity: e.starOpacity,
        }),
      );
      g.add(new v.Points(s, d));
      const p = F(new v.SphereGeometry(0.66, w ? 32 : 48, w ? 32 : 48)),
        m = F(
          new v.MeshStandardMaterial({
            color: e.coreColor,
            emissive: e.coreEmissive,
            emissiveIntensity: e.coreEmissiveIntensity,
            roughness: 0.45,
            metalness: 0.05,
          }),
        ),
        u = new v.Mesh(p, m);
      g.add(u);
      const h = (() => {
          const e = document.createElement("canvas");
          ((e.width = 96), (e.height = 96));
          const t = e.getContext("2d"),
            a = t.createRadialGradient(48, 48, 0, 48, 48, 48);
          (a.addColorStop(0, "rgba(255,255,255,0.9)"),
            a.addColorStop(0.24, "rgba(165,184,255,0.35)"),
            a.addColorStop(1, "rgba(255,255,255,0)"),
            (t.fillStyle = a),
            t.fillRect(0, 0, 96, 96));
          const o = new v.CanvasTexture(e);
          return (A.push(o), o);
        })(),
        b = new v.Sprite(
          F(
            new v.SpriteMaterial({
              map: h,
              color: e.coreGlowColor,
              transparent: !0,
              opacity: e.coreGlowOpacity,
              depthWrite: !1,
            }),
          ),
        );
      (b.scale.set(2.8, 2.8, 1),
        g.add(b),
        (C = n.map((t) => {
          const a = F(
              new v.RingGeometry(
                t.orbit - 0.004,
                t.orbit + 0.004,
                w ? 72 : 160,
              ),
            ),
            o = F(
              new v.MeshBasicMaterial({
                color: e.orbitColor,
                transparent: !0,
                opacity: e.orbitOpacity,
                side: v.DoubleSide,
              }),
            ),
            i = new v.Mesh(a, o);
          ((i.rotation.x = Math.PI / 2), g.add(i));
          const n = F(new v.SphereGeometry(t.size, w ? 18 : 32, w ? 18 : 32)),
            r = F(
              new v.MeshStandardMaterial({
                color: t.color,
                emissive: t.color,
                emissiveIntensity: 0.25,
                roughness: 0.38,
                metalness: 0.08,
              }),
            ),
            s = new v.Mesh(n, r);
          ((s.userData.domainId = t.id), g.add(s));
          const l = new v.Sprite(
            F(
              new v.SpriteMaterial({
                map: h,
                color: t.color,
                transparent: !0,
                opacity: e.planetGlowOpacity,
                depthWrite: !1,
              }),
            ),
          );
          return (
            l.scale.setScalar(2.25),
            g.add(l),
            {
              domain: t,
              mesh: s,
              glow: l,
              orbit: i,
              baseGlowOpacity: e.planetGlowOpacity,
              activeGlowOpacity: Math.max(
                2.15 * e.planetGlowOpacity,
                e.planetGlowOpacity + 0.12,
              ),
            }
          );
        })),
        z(),
        (k = new ResizeObserver(z)),
        k.observe(r),
        U(x),
        o("scene:built", { planetCount: C.length, fallbackMode: L }));
    },
    D = (e = 0) => {
      B &&
        !L &&
        S &&
        g &&
        y &&
        ((M = window.requestAnimationFrame(D)),
        (I = 0.001 * e),
        ((e) => {
          const t = Boolean(b?.matches);
          C.forEach((a, o) => {
            const i = t ? 0.015 : a.domain.speed,
              n = a.domain.phase + e * i,
              r = o % 2 == 0 ? 0.18 : -0.14,
              s = Math.cos(n) * a.domain.orbit,
              l = Math.sin(n) * a.domain.orbit * 0.68,
              c = Math.sin(0.8 * n) * r;
            (a.mesh.position.set(s, c, l),
              a.glow.position.copy(a.mesh.position),
              (a.mesh.rotation.y += t ? 0.002 : 0.014));
          });
        })(I),
        S.render(g, y));
    },
    j = (e) => {
      if (!r || !E || !y || L) return;
      const t = r.getBoundingClientRect();
      ((R.x = ((e.clientX - t.left) / t.width) * 2 - 1),
        (R.y = (-(e.clientY - t.top) / t.height) * 2 + 1),
        E.setFromCamera(R, y));
      const a = E.intersectObjects(
          C.map((e) => e.mesh),
          !1,
        ),
        o = a[0]?.object?.userData?.domainId,
        i = n.find((e) => e.id === o);
      i && U(i);
    },
    W = (e) => j(e),
    N = (e) => j(e),
    T = () => {
      L || U(x);
    },
    V = (e) => {
      const t = e.currentTarget,
        a = n.find((e) => e.id === t.dataset.domainId);
      U(a);
    },
    X = (e) => {
      const t = e.currentTarget,
        a = n.find((e) => e.id === t.dataset.domainId);
      U(a);
    },
    Y = (e) => {
      const t = (n.findIndex((e) => e.id === x.id) + e + n.length) % n.length;
      U(n[t]);
    },
    Q = (e) => {
      const t = n.find((t) => t.id === e.currentTarget.dataset.domainId);
      U(t);
    };
  let _ = 0,
    H = 0,
    J = !1;
  const K = (e) => {
      ((J = !0), (_ = e.clientX), (H = e.clientY));
    },
    Z = (e) => {
      if (!J) return;
      J = !1;
      const t = e.clientX - _,
        a = e.clientY - H;
      Math.abs(t) > 40 && Math.abs(t) > Math.abs(a) && Y(t < 0 ? 1 : -1);
    },
    $ = (e) => {
      const t = e.target?.matches?.("[data-solar-domain]"),
        a = e.target?.matches?.("[data-solar-stage]");
      if (!t && !a) return;
      const o = n.findIndex((e) => e.id === x.id);
      (("ArrowRight" !== e.key && "ArrowDown" !== e.key) ||
        (e.preventDefault(), U(n[(o + 1) % n.length], { focus: t })),
        ("ArrowLeft" !== e.key && "ArrowUp" !== e.key) ||
          (e.preventDefault(),
          U(n[(o - 1 + n.length) % n.length], { focus: t })),
        "Home" === e.key && (e.preventDefault(), U(n[0], { focus: t })),
        "End" === e.key &&
          (e.preventDefault(), U(n[n.length - 1], { focus: t })));
    },
    ee = () => {
      if ("hidden" === document.visibilityState)
        return (
          o("visibility:hidden", { hasAnimationFrame: Boolean(M) }),
          void (M && (window.cancelAnimationFrame(M), (M = 0)))
        );
      (o("visibility:visible", {
        started: B,
        fallbackMode: L,
        hasRenderer: Boolean(S),
        hasAnimationFrame: Boolean(M),
      }),
        B &&
          !L &&
          S &&
          !M &&
          (D(), o("animation:resumed", { lastTime: Number(I.toFixed(3)) })));
    },
    te = () => {
      (w
        ? (r?.addEventListener("pointerdown", K),
          r?.addEventListener("pointerup", Z))
        : (r?.addEventListener("pointermove", W),
          r?.addEventListener("pointerleave", T)),
        r?.addEventListener("click", N),
        a.addEventListener("keydown", $),
        document.addEventListener("visibilitychange", ee),
        l.forEach((e) => {
          (e.addEventListener("click", V), e.addEventListener("focus", X));
        }));
    },
    ae = () => {
      (O(!0),
        te(),
        U(n[0]),
        o("fallback:start", { reason: "webgl-unavailable-or-import-failed" }));
    },
    oe = () => {
      (o("cleanup:start", {
        started: B,
        hasRenderer: Boolean(S),
        disposableCount: A.length,
      }),
        M && (window.cancelAnimationFrame(M), (M = 0)),
        r?.removeEventListener("pointermove", W),
        r?.removeEventListener("pointerleave", T),
        r?.removeEventListener("pointerdown", K),
        r?.removeEventListener("pointerup", Z),
        r?.removeEventListener("click", N),
        a.removeEventListener("keydown", $),
        document.removeEventListener("visibilitychange", ee),
        l.forEach((e) => {
          (e.removeEventListener("click", V),
            e.removeEventListener("focus", X));
        }),
        k?.disconnect(),
        (k = null),
        (C = []),
        A.forEach((e) => e?.dispose?.()),
        (A = []),
        S?.dispose?.(),
        S?.domElement?.remove?.(),
        (g = null),
        (y = null),
        (S = null),
        (E = null),
        (R = null),
        (I = 0),
        (B = !1),
        O(!1),
        U(n[0]),
        o("cleanup:done", { webglContextLossCount: G }));
    };
  return (
    s && (s.hidden = !0),
    U(n[0]),
    m?.addEventListener("click", () => Y(-1)),
    u?.addEventListener("click", () => Y(1)),
    f.forEach((e) => e.addEventListener("click", Q)),
    t(() => {
      (f.forEach((t) => {
        const a = n.find((e) => e.id === t.dataset.domainId);
        a && t.setAttribute("aria-label", e(a.label));
      }),
        U(x));
    }),
    {
      start: async () => {
        if (!B)
          if (
            ((B = !0),
            (x = n[0]),
            U(x),
            o("start", { supportsWebGL: P(), hasStage: Boolean(r) }),
            P() && r)
          )
            try {
              if (
                (O(!1),
                (v =
                  await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js")),
                !B)
              )
                return;
              (o("three:loaded", { version: v.REVISION ?? null }),
                q(),
                te(),
                D(),
                o("animation:start", { fallbackMode: L }));
            } catch {
              if (!B) return;
              (o("three:load-failed"), oe(), (B = !0), ae());
            }
          else ae();
      },
      cleanup: oe,
    }
  );
}
