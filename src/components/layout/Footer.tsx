"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { clearReveal } from "@/lib/reveal";

/**
 * Rodapé único do site — Figma "Rodapé" (101:639 / 101:1237).
 * Entrada: a linha do topo cresce e os textos sobem (o fundo nunca anima). Dispara em
 * "top bottom" para acontecer mesmo no fim da rolagem.
 */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !document.documentElement.classList.contains("js-ready")) return;
      const q = gsap.utils.selector(footerRef);
      const line = q("[data-footer-line]");
      const texts = q("[data-footer-text]");
      gsap.set(line, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(texts, { opacity: 0, y: 12 });
      gsap
        .timeline({
          scrollTrigger: { trigger: footerRef.current, start: "top bottom", once: true },
          onComplete: clearReveal([line, texts]),
        })
        .to(line, { scaleX: 1, duration: 0.7, ease: "power3.out" }, 0)
        .to(texts, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.15);
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="bg-night" data-footer>
      <div className="px-(--gutter)">
        <div aria-hidden="true" className="h-px bg-white/14" data-reveal data-footer-line />
      </div>
      <div className="flex items-start justify-between gap-6 px-(--gutter) pt-7 pb-10 text-[13px] leading-[normal] text-[#a8a196]">
        <p data-reveal data-footer-text>
          © 2026 GR Esquadrias
        </p>
        {/* "#top": com o Lenis, SmoothScroll.tsx rola suave até o início; com reduced-motion o
            navegador vai direto (sem rolagem suave) */}
        <a
          href="#top"
          aria-label="Voltar ao topo da página"
          className="footer__top focus-ring rounded-sm"
          data-reveal
          data-footer-text
        >
          <span className="md:hidden">Topo</span>
          <span className="hidden md:inline">Voltar ao topo</span>{" "}
          <span className="footer__arrow">↑</span>
        </a>
      </div>
    </footer>
  );
}
