import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Plugins registrados uma única vez para todo o site */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // No celular a barra de endereço muda a altura da janela ao rolar: isso não recalcula nada
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Disparado pela Hero quando a navbar deve entrar (0,3 s após o início da timeline). */
export const HERO_INTRO_EVENT = "gr:hero-intro";

export type HeroIntroDetail = {
  /** Aceleração da timeline de entrada (mobile é mais rápido). */
  timeScale: number;
};

/** Breakpoints das animações: desktop = lg do Tailwind (1024px). */
export const MOTION_QUERIES = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
} as const;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `html.js-ready` (script do <head>, layout.tsx) lido UMA vez, quando o JS carrega.
 * As entradas dependem deste valor, não da classe atual (que sai no fim da entrada da Hero):
 * remontagens, refresh ou matchMedia nunca reativam uma entrada.
 */
const jsReadyAtBoot =
  typeof document !== "undefined" && document.documentElement.classList.contains("js-ready");

/** Entradas habilitadas: JS carregou a tempo (antes do failsafe) e sem reduced-motion. */
export const entrancesEnabled = () => jsReadyAtBoot && !prefersReducedMotion();

export { gsap, ScrollTrigger, useGSAP };
