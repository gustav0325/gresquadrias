"use client";

import { useRef } from "react";

import { BronzeButton } from "@/components/ui/BronzeButton";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { QUOTE_LINK } from "@/config/navigation";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { clearReveal, revealLines, WORD_HIDDEN_Y } from "@/lib/reveal";

type QuoteCtaProps = {
  /** Nível do título conforme a hierarquia da página (Home: h3 dentro de Projetos). */
  headingLevel?: "h2" | "h3";
  /** "light" na /obras: o rodapé escuro logo abaixo fica sendo o único bloco escuro. */
  tone?: "dark" | "light";
};

const TONES = {
  dark: {
    block: "bg-night",
    rule: "bg-white/14",
    eyebrow: "text-bronze",
    title: "text-paper",
    accent: "text-bronze",
    button: "bronze",
  },
  light: {
    block: "bg-greige-soft",
    rule: "bg-espresso/14",
    // Bronze do Figma (#9a6e40) fica abaixo de AA em 12px; "sua." é texto grande e o mantém
    eyebrow: "text-bronze-text-greige",
    title: "text-espresso",
    accent: "text-bronze-deep",
    button: "dark",
  },
} as const;

/**
 * Bloco "A próxima obra pode ser a sua." — Figma "CTA Projetos": escuro na Home (101:91 / 101:850),
 * claro na /obras (123:120). Botão leva ao WhatsApp.
 *
 * Entrada (uma vez, ao entrar na tela): rótulo, linhas do título e botão, 0,15 s entre eles.
 * Estados iniciais só sob `html.js-ready` (globals.css).
 */
export function QuoteCta({ headingLevel: Heading = "h3", tone = "dark" }: QuoteCtaProps) {
  const t = TONES[tone];
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!entrancesEnabled()) return;
      // Mobile: mais rápido e mais discreto
      const k = window.matchMedia(MOTION_QUERIES.desktop).matches ? 1 : 0.75;
      const q = gsap.utils.selector(ctaRef);
      const eyebrow = q('[data-cta-el="eyebrow"]');
      const words = q('[data-cta-el="title"] [data-word]');
      const lines = q('[data-cta-el="title"] [data-line]');
      const button = q('[data-cta-el="button"]');
      gsap.set(eyebrow, { opacity: 0 });
      gsap.set(words, { opacity: 1, yPercent: WORD_HIDDEN_Y });
      gsap.set(button, { opacity: 0, y: 16 * k });
      const cta = gsap.timeline({
        scrollTrigger: { trigger: ctaRef.current, start: "top 80%", once: true },
        onComplete: clearReveal([eyebrow, words, button]),
      });
      cta.to(eyebrow, { opacity: 1, duration: 0.6 * k, ease: "power2.out" }, 0);
      revealLines(cta, lines, 0.15, { duration: 0.9 * k, stagger: 0.15 });
      cta.to(
        button,
        { opacity: 1, y: 0, duration: 0.65 * k, ease: "power2.out" },
        0.15 + lines.length * 0.15,
      );
    },
    { scope: ctaRef },
  );

  return (
    <div
      ref={ctaRef}
      className={`${t.block} px-(--gutter) pb-16 md:pb-[clamp(56px,11vh,104px)]`}
      data-quote-cta
      data-nav-tone={tone === "dark" ? "dark" : undefined}
    >
      <div className={`h-px ${t.rule}`} />
      {/* md+: grade em que o botão fica na linha do título, centralizado na vertical em relação a ele */}
      <div className="mt-10 flex flex-col gap-8 md:mt-[clamp(56px,11vh,104px)] md:grid md:grid-cols-[1fr_auto] md:gap-x-8 md:gap-y-6">
        <div className="flex flex-col gap-4 md:contents">
          <p
            className={`text-[12px] leading-[normal] font-medium tracking-[0.14em] ${t.eyebrow} md:col-start-1 md:row-start-1`}
            data-cta-el="eyebrow"
          >
            SEU PROJETO
          </p>
          <Heading
            aria-label="A próxima obra pode ser a sua."
            className={`font-display text-[44px] leading-none font-medium tracking-[-0.02em] ${t.title} md:col-start-1 md:row-start-2 md:text-[length:clamp(2rem,min(4.2vw,7vh),3.5rem)] md:leading-[1.05]`}
            data-cta-el="title"
          >
            <MaskedWords
              lines={["A próxima obra", "pode ser a sua."]}
              accent="sua."
              accentClassName={t.accent}
            />
          </Heading>
        </div>

        <BronzeButton
          href={QUOTE_LINK.href}
          label="PEDIR ORÇAMENTO"
          tone={t.button}
          className="self-start px-8 py-[18px] text-[12px] leading-[1.21] tracking-[0.14em] md:col-start-2 md:row-start-2 md:flex md:h-[clamp(48px,7.5vh,60px)] md:items-center md:self-center md:px-[clamp(28px,3vw,44px)] md:py-0 md:text-[13px] md:tracking-[0.12em]"
          data-cta-el="button"
        />
      </div>
    </div>
  );
}
