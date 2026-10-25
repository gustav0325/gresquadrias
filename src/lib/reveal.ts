import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Palavras abaixo da máscara: 100% da linha + o respiro de 0,12em da .word-mask. */
export const WORD_HIDDEN_Y = 115;

/**
 * Agrupa as palavras (`[data-word]`) de um título pelas linhas reais do layout,
 * para revelar linha por linha mesmo quando a quebra muda entre mobile e desktop.
 */
export function wordLines(title: Element | undefined): HTMLElement[][] {
  if (!title) return [];
  const lines = new Map<number, HTMLElement[]>();
  title.querySelectorAll<HTMLElement>("[data-word]").forEach((word) => {
    const top = Math.round(word.getBoundingClientRect().top);
    const key = [...lines.keys()].find((k) => Math.abs(k - top) < 4) ?? top;
    lines.set(key, [...(lines.get(key) ?? []), word]);
  });
  return [...lines.entries()].sort(([a], [b]) => a - b).map(([, words]) => words);
}

/** No fim de uma entrada: sem estilos inline, igual à versão estática. */
export const clearReveal = (targets: gsap.TweenTarget) => () =>
  gsap.set(targets, { clearProps: "transform,transformOrigin,opacity,clipPath" });

let refreshTimer = 0;
/** Recalcula os gatilhos depois de mudanças de layout (fotos carregadas, acordeão…), agrupando chamadas. */
export function scheduleRefresh(delay = 150) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}
