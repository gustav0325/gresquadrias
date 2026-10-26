"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { lockPage, PAGE_LOCK_EVENT } from "@/lib/page-lock";

/** Leva o foco para a seção de destino sem rolar de novo (leitores de tela e teclado). */
function focusSection(section: HTMLElement | null) {
  if (!section) return;
  if (!section.hasAttribute("tabindex")) {
    section.setAttribute("tabindex", "-1");
    section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
  }
  section.focus({ preventScroll: true });
}

/**
 * Rolagem suave (Lenis) no mesmo loop do GSAP/ScrollTrigger.
 * Âncoras da própria página ("/#projetos", "#top"…) são roladas pelo Lenis:
 * a posição vem do layout real, então já considera o espaço da Hero fixa.
 * Com prefers-reduced-motion: reduce o Lenis não é criado (rolagem e âncoras nativas).
 * Em telas de toque também não: a rolagem por toque já é nativa (o Lenis só suaviza a roda do
 * mouse) e ele só custaria um loop por quadro; as âncoras usam a rolagem suave nativa.
 */
export function SmoothScroll() {
  useEffect(() => {
    // React ativo: o failsafe do <head> (layout.tsx) não desfaz `html.js`
    document.documentElement.classList.add("hydrated");

    // Fontes mudam alturas: recalcula os gatilhos quando terminarem de carregar
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (prefersReducedMotion()) return;

    const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const lenis = touch ? null : new Lenis({ autoRaf: false, duration: 1.1 });
    const raf = (time: number) => lenis?.raf(time * 1000);
    // Página travada (menu mobile aberto): o Lenis para junto com a rolagem nativa
    const onPageLock = (event: Event) =>
      (event as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start();
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      window.addEventListener(PAGE_LOCK_EVENT, onPageLock);
    }

    // Captura: roda antes do <Link> do Next, que respeita o preventDefault
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;

      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const section = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !section) return;

      event.preventDefault();
      // Link do menu mobile: este handler roda antes do onClick do menu, então a página
      // (rolagem, Lenis e `inert`) é liberada aqui, antes de rolar e de focar a seção
      lockPage(false);
      // Offset 0: as seções já reservam no padding-top o espaço da navbar fixa
      if (lenis) {
        lenis.scrollTo(section ?? 0, { onComplete: () => focusSection(section) });
      } else {
        const top = section ? section.getBoundingClientRect().top + window.scrollY : 0;
        window.scrollTo({ top, behavior: "smooth" });
        focusSection(section);
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      if (lenis) {
        window.removeEventListener(PAGE_LOCK_EVENT, onPageLock);
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      }
    };
  }, []);

  return null;
}
