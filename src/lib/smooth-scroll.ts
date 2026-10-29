import type Lenis from "lenis";

/**
 * Instância única do Lenis, criada pelo SmoothScroll (layout.tsx) e compartilhada pelas páginas.
 * `null` com reduced-motion ou em telas de toque: a rolagem é a nativa.
 */
let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Leva o foco para a seção de destino sem rolar de novo (leitores de tela e teclado). */
function focusSection(section: HTMLElement | null) {
  if (!section) return;
  if (!section.hasAttribute("tabindex")) {
    section.setAttribute("tabindex", "-1");
    section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
  }
  section.focus({ preventScroll: true });
}

/** Salta para uma posição, sem animação (Lenis e rolagem nativa juntos). */
export function jumpTo(top: number) {
  if (lenis) {
    // Página recém-trocada: a altura (limite da rolagem) ainda pode ser a da anterior
    lenis.resize();
    lenis.scrollTo(top, { immediate: true, force: true });
  } else {
    window.scrollTo({ top, behavior: "instant" });
  }
}

/**
 * Rola até uma seção (ou ao topo, com `null`) e leva o foco até ela.
 * Offset 0: as seções já reservam no padding-top o espaço da navbar fixa.
 * `immediate`: salta sem animação (chegada de outra página).
 */
export function scrollToSection(section: HTMLElement | null, { immediate = false } = {}) {
  if (lenis) {
    // Página recém-trocada: a altura (limite da rolagem) ainda pode ser a da anterior
    if (immediate) lenis.resize();
    lenis.scrollTo(section ?? 0, {
      immediate,
      force: immediate,
      onComplete: () => focusSection(section),
    });
    return;
  }
  const top = section ? section.getBoundingClientRect().top + window.scrollY : 0;
  window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
  focusSection(section);
}
