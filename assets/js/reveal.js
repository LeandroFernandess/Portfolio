/**
 * reveal.js — Animações disparadas por scroll
 * ----------------------------------------------------------------
 * Usa Intersection Observer (nativo, zero dependências) para revelar
 * elementos [data-reveal] quando entram na viewport. O CSS cuida da
 * transição; aqui apenas adicionamos a classe .is-visible.
 *
 * Também aplica um parallax leve aos blobs do fundo, atrelado ao
 * scroll via requestAnimationFrame (suave e sem travar a thread).
 */

/**
 * Inicializa as animações de revelação e parallax. Deve ser chamado após o DOM estar pronto.
 * Verifica se o usuário prefere reduzir movimento e se o navegador suporta Intersection Observer.
 * Se não, revela tudo de uma vez. Caso contrário, observa os elementos e revela conforme necessário.
 * O parallax é aplicado apenas se o usuário não tiver preferência por reduzir movimento.
 * @returns {void}  
 */
export function initReveal() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      const i = groups.get(parent);
      el.style.setProperty("--i", String(i));
      groups.set(parent, i + 1);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  if (!prefersReducedMotion) {
    const blob1 = document.querySelector(".ambient__blob--1");
    const blob2 = document.querySelector(".ambient__blob--2");
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (blob1) blob1.style.translate = `0 ${y * 0.08}px`;
      if (blob2) blob2.style.translate = `0 ${y * -0.05}px`;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true },
    );
  }
}
