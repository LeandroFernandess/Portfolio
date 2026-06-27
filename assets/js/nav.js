/**
 * nav.js — Navegação
 * ----------------------------------------------------------------
 * - Sticky nav: muda de estilo ao rolar.
 * - Menu mobile: abre/fecha e fecha ao clicar num link.
 * - Active link: destaca o item da seção visível (Intersection
 *   Observer, sem ouvir scroll a cada frame).
 */

/**
 * Inicializa a navegação: sticky nav, menu mobile e destaque do link ativo.
 * @returns {void}
 */
export function initNav() {
  const nav = document.querySelector("#nav");
  const toggle = document.querySelector("#menuBtn");
  const mobileMenu = document.querySelector("#mobileMenu");

  if (nav) {
    let ticking = false;
    let scrolled = null;
    const updateScrolledState = () => {
      ticking = false;
      const next = window.scrollY > 12;
      if (next === scrolled) return;
      scrolled = next;
      nav.classList.toggle("is-scrolled", next);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrolledState);
    };
    updateScrolledState();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const closeMenu = () => {
    mobileMenu?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const open = mobileMenu?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(!!open));
  });
  mobileMenu
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));

  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = [
    "about",
    "projects",
    "architecture",
    "security",
    "ai",
    "contact",
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) =>
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${id}`,
            ),
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
  }
}
