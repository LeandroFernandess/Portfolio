/**
 * cursor-effect.js — efeito global sutil do mouse
 * ----------------------------------------------------------------
 * Usa CSS variables e requestAnimationFrame; não interfere em cliques.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

/**
 * Inicializa o efeito de cursor global, criando uma aura que segue o mouse.
 * @returns {void}
 */
export function initCursorEffect() {
  const reduceMotion = window.matchMedia?.(REDUCED_MOTION_QUERY);
  const coarsePointer = window.matchMedia?.(COARSE_POINTER_QUERY);

  if (reduceMotion?.matches || coarsePointer?.matches) return;

  const cursor = document.createElement("div");
  cursor.className = "cursor-aura";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);

  let raf = 0;
  let visible = false;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  const update = () => {
    raf = 0;
    cursor.style.setProperty("--cursor-x", `${x}px`);
    cursor.style.setProperty("--cursor-y", `${y}px`);
  };

  const scheduleUpdate = () => {
    if (!raf) raf = window.requestAnimationFrame(update);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    x = event.clientX;
    y = event.clientY;
    if (!visible) {
      visible = true;
      cursor.classList.add("is-visible");
    }
    scheduleUpdate();
  };

  const handlePointerLeave = () => {
    visible = false;
    cursor.classList.remove("is-visible");
  };

  const handleFocusIn = (event) => {
    if (
      event.target?.matches?.(
        "input, textarea, select, [contenteditable='true']",
      )
    ) {
      cursor.classList.add("is-muted");
    }
  };

  const handleFocusOut = () => {
    cursor.classList.remove("is-muted");
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  document.addEventListener("mouseleave", handlePointerLeave);
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
}
