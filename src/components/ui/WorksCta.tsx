"use client";

import { useRef } from "react";

import { BronzeButton } from "@/components/ui/BronzeButton";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { PAGE_LINKS } from "@/config/navigation";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { clearReveal, revealLines, scheduleRefresh, WORD_HIDDEN_Y } from "@/lib/reveal";

/** Mobile: nenhuma parte da entrada passa de 0,7 s. */
const MOBILE_MAX_DURATION = 0.7;

/**
 * Faixa escura "Veja nossas últimas obras." dentro de Serviços, entre "Como trabalhamos" e o
 * FAQ — Figma "CTA · Últimas obras" (desktop 120:2, mobile 120:12). Botão leva a /obras.
 * Desktop (lg+): título à esquerda, texto + botão à direita; mobile: uma coluna, botão inteiro.
 *
 * Entrada (uma vez, ao entrar na tela): rótulo e linha, linhas do título, texto e botão.
 * Estados iniciais só sob `html.js-ready` (globals.css).
 */
export function WorksCta() {
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (entrancesEnabled()) {
        const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;
        const d = (seconds: number) => (desktop ? seconds : Math.min(seconds, MOBILE_MAX_DURATION));
        const q = gsap.utils.selector(ctaRef);
        const eyebrow = q('[data-works-cta-el="eyebrow"]');
        const rule = q('[data-works-cta-el="rule"]');
        const words = q('[data-works-cta-el="title"] [data-word]');
        const lines = q('[data-works-cta-el="title"] [data-line]');
        const text = q('[data-works-cta-el="text"]');
        const button = q('[data-works-cta-el="button"]');
        gsap.set(eyebrow, { opacity: 0, y: 16 });
        gsap.set(rule, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(words, { opacity: 1, yPercent: WORD_HIDDEN_Y });
        gsap.set([text, button], { opacity: 0, y: 20 });

        const afterTitle = 0.15 + lines.length * 0.15;
        const cta = gsap.timeline({
          scrollTrigger: {
            trigger: ctaRef.current,
            start: desktop ? "top 80%" : "top 85%",
            once: true,
          },
          onComplete: clearReveal([eyebrow, rule, words, text, button]),
        });
        cta
          .to(eyebrow, { opacity: 1, y: 0, duration: d(0.6), ease: "power2.out" }, 0)
          .to(rule, { scaleX: 1, duration: d(0.7), ease: "power3.out" }, 0.05);
        revealLines(cta, lines, 0.15, { duration: d(0.9), stagger: 0.15 });
        cta
          .to(text, { opacity: 1, y: 0, duration: d(0.7), ease: "power2.out" }, afterTitle)
          .to(button, { opacity: 1, y: 0, duration: d(0.65), ease: "power2.out" }, afterTitle + 0.15);
      }

      // A faixa empurra o FAQ e o que vem depois (Sobre…): os gatilhos seguintes são recalculados
      scheduleRefresh();
    },
    { scope: ctaRef },
  );

  return (
    <section
      ref={ctaRef}
      aria-labelledby="ultimas-obras-title"
      className="bg-ink-warm px-(--gutter) py-[72px] lg:py-[clamp(64px,11.6vh,104px)]"
      data-works-cta
      data-nav-tone="dark"
    >
      <div className="flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between lg:gap-24">
        <div className="flex flex-col items-start gap-[18px] lg:gap-[26px]">
          <p className="flex items-center gap-4">
            <span
              className="text-[12px] leading-[normal] font-medium tracking-[0.14em] text-bronze"
              data-works-cta-el="eyebrow"
            >
              ÚLTIMAS OBRAS
            </span>
            <span aria-hidden="true" className="h-px w-20 bg-bronze/50" data-works-cta-el="rule" />
          </p>
          <h2
            id="ultimas-obras-title"
            aria-label="Veja nossas últimas obras."
            className="font-display text-[46px] leading-none font-medium tracking-[-0.02em] text-paper lg:text-[length:clamp(3rem,min(5vw,9.5vh),4.5rem)]"
            data-works-cta-el="title"
          >
            <MaskedWords lines={["Veja nossas", "últimas obras."]} accent={["últimas", "obras."]} />
          </h2>
        </div>

        <div className="flex flex-col gap-7 lg:w-[440px] lg:shrink-0 lg:gap-8">
          <p
            className="text-[15px] leading-[1.55] text-paper-muted lg:text-[18px]"
            data-works-cta-el="text"
          >
            Conheça os projetos mais recentes entregues pela GR Esquadrias, com fotos reais de cada
            obra.
          </p>
          <BronzeButton
            href={PAGE_LINKS.obras}
            prefetch
            label="VER ÚLTIMAS OBRAS"
            className="flex justify-center py-[22px] text-[12px] leading-[normal] tracking-[0.14em] lg:self-start lg:px-10"
            data-works-cta-el="button"
          />
        </div>
      </div>
    </section>
  );
}
