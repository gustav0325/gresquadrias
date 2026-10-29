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

/** Anima as palavras (`[data-word]`) de cada linha juntas, uma linha após a outra. */
export function revealLines(
  timeline: gsap.core.Timeline,
  lines: Element[],
  at: number,
  vars: { duration: number; stagger: number },
) {
  lines.forEach((line, i) => {
    timeline.to(
      line.querySelectorAll("[data-word]"),
      { yPercent: 0, duration: vars.duration, ease: "power3.out" },
      at + i * vars.stagger,
    );
  });
}

/**
 * Estado final de uma entrada: sem transforms (nenhuma camada extra; rasterização igual à da
 * versão estática) e com o visível explícito inline. O explícito importa: enquanto
 * `html.js-ready` existir, o CSS de espera esconderia o elemento outra vez.
 */
export const REVEALED = { opacity: 1, clipPath: "none", clearProps: "transform,transformOrigin" };

/** No fim de uma entrada (onComplete): ver REVEALED. */
export const clearReveal = (targets: gsap.TweenTarget) => () => gsap.set(targets, REVEALED);

let refreshTimer = 0;
/** Recalcula os gatilhos depois de mudanças de layout (fotos carregadas, acordeão…), agrupando chamadas. */
export function scheduleRefresh(delay = 150) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}
