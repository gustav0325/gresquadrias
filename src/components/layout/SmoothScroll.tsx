"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { lockPage, PAGE_LOCK_EVENT } from "@/lib/page-lock";
import { jumpTo, scrollToSection, setLenis } from "@/lib/smooth-scroll";

/**
 * Rolagem suave (Lenis) no mesmo loop do GSAP/ScrollTrigger.
 * Âncoras da própria página ("/#projetos", "#top"…) são roladas pelo Lenis:
 * a posição vem do layout real, então já considera o espaço da Hero fixa.
 * Com prefers-reduced-motion: reduce o Lenis não é criado (rolagem e âncoras nativas).
 * Em telas de toque também não: a rolagem por toque já é nativa (o Lenis só suaviza a roda do
 * mouse) e ele só custaria um loop por quadro; as âncoras usam a rolagem suave nativa.
 *
 * Troca de página (fica no layout, então vive entre as rotas): com âncora ("/#servicos" vindo
 * de /obras) salta até a seção depois das fontes e de um refresh; sem âncora começa no topo.
 * Voltar/avançar: o navegador restaura a posição depois (já com os gatilhos criados no topo).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    // React ativo: o failsafe do <head> (layout.tsx) não desfaz `html.js`
    document.documentElement.classList.add("hydrated");

    // Fontes mudam alturas: recalcula os gatilhos quando terminarem de carregar
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (prefersReducedMotion()) return;

    const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const lenis = touch ? null : new Lenis({ autoRaf: false, duration: 1.1 });
    const raf = (time: number) => lenis?.raf(time * 1000);
    // Página travada (menu mobile, galeria de obras): o Lenis para junto com a rolagem nativa
    const onPageLock = (event: Event) =>
      (event as CustomEvent<boolean>).detail ? lenis?.stop() : lenis?.start();
    if (lenis) {
      setLenis(lenis);
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
      scrollToSection(section);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      if (lenis) {
        setLenis(null);
        window.removeEventListener(PAGE_LOCK_EVENT, onPageLock);
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      }
    };
  }, []);

  // Chegada em uma página (navegação do Next entre rotas).
  // Layout effect: este componente vem antes da página na árvore, então roda antes dos efeitos
  // dela. A rolagem volta ao topo ANTES de a página criar os gatilhos: criados no meio da página
  // anterior, os de `once: true` já passados se destroem durante o refresh de outro gatilho e o
  // ScrollTrigger quebra. A âncora, se houver, vem depois.
  useLayoutEffect(() => {
    const initial = firstRoute.current;
    firstRoute.current = false;
    const id = decodeURIComponent(location.hash.slice(1));
    // Primeira carga sem âncora: o navegador decide (ex.: recarregar mantém a posição)
    if (initial && !id) return;

    if (!initial) jumpTo(0);

    // A posição final depende das fontes e dos gatilhos (pin da Hero) já recalculados
    let cancelled = false;
    document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
        const section = id ? document.getElementById(id) : null;
        if (section) scrollToSection(section, { immediate: true });
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
