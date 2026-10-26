"use client";

import { useRef } from "react";

import { MaskedWords } from "@/components/ui/MaskedWords";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { NEW_TAB, QUOTE_LINK } from "@/config/navigation";
import { PROJETOS } from "@/data/projetos";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { REVEALED } from "@/lib/reveal";

/** Palavras abaixo da máscara: 100% da linha + o respiro de 0,12em da .word-mask. */
const WORD_HIDDEN_Y = 115;
/** Parallax das fotos (% da camada, que tem 112,5% da moldura): ±24px numa foto de 432px. */
const PARALLAX_PERCENT = 5;

/** Anima as palavras de cada linha juntas, uma linha após a outra. */
function revealLines(
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
 * Seção Projetos da Home — Figma "2 · Projetos":
 * desktop 101:91 e mobile 101:730.
 * No mobile, todas as obras em lista única (sem os filtros por categoria do Figma).
 *
 * Fica uma camada acima da Hero: no desktop passa por cima dela como uma cortina.
 *
 * Animações (uma vez, ao entrar na tela): cabeçalho, cada foto (máscara + zoom-out) seguida da
 * legenda, e o CTA. Parallax das fotos só no desktop. Estados iniciais só sob `html.js-ready`.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);

      // ------------------------------------------------------------ Entradas
      if (entrancesEnabled()) {
        // Mobile: mais rápido e mais discreto
        const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;
        const k = desktop ? 1 : 0.75;
        const words = (title: string) => q(`${title} [data-word]`);
        const lines = (title: string) => q(`${title} [data-line]`);
        // Fim de cada entrada: sem estilos inline, igual à versão estática
        const clear = (targets: gsap.TweenTarget) => () =>
          gsap.set(targets, REVEALED);

        // Cabeçalho
        const eyebrow = q('[data-projects-el="eyebrow"]');
        const intro = q('[data-projects-el="intro"]');
        const titleWords = words('[data-projects-el="title"]');
        gsap.set(eyebrow, { opacity: 0, y: 16 * k });
        gsap.set(intro, { opacity: 0, y: 20 * k });
        gsap.set(titleWords, { opacity: 1, yPercent: WORD_HIDDEN_Y });
        const header = gsap.timeline({
          scrollTrigger: {
            trigger: q('[data-projects-el="header"]')[0],
            start: "top 80%",
            once: true,
          },
          onComplete: clear([eyebrow, intro, titleWords]),
        });
        header.to(eyebrow, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, 0);
        revealLines(header, lines('[data-projects-el="title"]'), 0.1, {
          duration: 0.9 * k,
          stagger: 0.15,
        });
        header.to(intro, { opacity: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0.35 * k);

        // Fotos: moldura abre de baixo para cima, a foto assenta (1.05 → 1) e a legenda vem em seguida
        q("[data-project-card]").forEach((card) => {
          const frame = card.querySelector('[data-card-el="frame"]');
          const reveal = card.querySelector('[data-card-el="reveal"]');
          const caption = card.querySelectorAll("[data-card-reveal]");
          gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(reveal, { scale: desktop ? 1.05 : 1.03 });
          gsap.set(caption, { opacity: 0, y: 16 * k });
          gsap
            .timeline({
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
              onComplete: clear([frame, reveal, caption]),
            })
            .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 * k, ease: "power3.out" }, 0)
            .to(reveal, { scale: 1, duration: 1.1 * k, ease: "power3.out" }, 0)
            .to(
              caption,
              { opacity: 1, y: 0, duration: 0.6 * k, stagger: 0.08, ease: "power2.out" },
              0.3 * k,
            );
        });

        // CTA: rótulo, linhas do título e botão, 0,15 s entre eles
        const ctaEyebrow = q('[data-projects-el="cta-eyebrow"]');
        const ctaWords = words('[data-projects-el="cta-title"]');
        const ctaLines = lines('[data-projects-el="cta-title"]');
        const ctaButton = q('[data-projects-el="cta-button"]');
        gsap.set(ctaEyebrow, { opacity: 0 });
        gsap.set(ctaWords, { opacity: 1, yPercent: WORD_HIDDEN_Y });
        gsap.set(ctaButton, { opacity: 0, y: 16 * k });
        const cta = gsap.timeline({
          scrollTrigger: {
            trigger: q('[data-projects-el="cta"]')[0],
            start: "top 80%",
            once: true,
          },
          onComplete: clear([ctaEyebrow, ctaWords, ctaButton]),
        });
        cta.to(ctaEyebrow, { opacity: 1, duration: 0.6 * k, ease: "power2.out" }, 0);
        revealLines(cta, ctaLines, 0.15, { duration: 0.9 * k, stagger: 0.15 });
        cta.to(
          ctaButton,
          { opacity: 1, y: 0, duration: 0.65 * k, ease: "power2.out" },
          0.15 + ctaLines.length * 0.15,
        );
      }

      // ------------------------------------------------------------ Parallax (desktop)
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.desktop, () => {
        q('[data-card-el="parallax"]').forEach((layer) => {
          gsap.fromTo(
            layer,
            { yPercent: -PARALLAX_PERCENT },
            {
              yPercent: PARALLAX_PERCENT,
              ease: "none",
              scrollTrigger: {
                trigger: layer.closest('[data-card-el="frame"]'),
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="projetos"
      aria-labelledby="projetos-title"
      className="projects relative isolate z-1 overflow-hidden"
    >
      <div
        className="projects__glow pointer-events-none absolute -top-20 -left-[100px] -z-10 size-[520px] md:-left-[200px] md:h-[860px] md:w-[1100px]"
        aria-hidden="true"
      />

      <header
        className="px-(--gutter) pt-[116px] pb-8 md:pt-[max(clamp(88px,13vh,132px),calc(var(--nav-offset)+24px))] md:pb-16"
        data-projects-el="header"
      >
        <p
          className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-deep md:text-xs"
          data-projects-el="eyebrow"
        >
          PROJETOS
        </p>

        <div className="mt-5 flex flex-col gap-5 md:mt-[clamp(12px,2vh,20px)] md:flex-row md:items-end md:justify-between md:gap-12">
          <h2
            id="projetos-title"
            aria-label="Tudo o que construímos"
            className="font-display text-[length:clamp(52px,6.67vw,96px)] leading-none font-medium tracking-[-0.02em] text-espresso md:text-[length:clamp(2.5rem,min(5.5vw,9.5vh),4.5rem)]"
            data-projects-el="title"
          >
            <MaskedWords lines={["Tudo o que", "construímos"]} />
          </h2>

          <p
            className="h-[60px] text-[15px] leading-[1.55] text-taupe md:h-[100px] md:w-[380px] md:shrink-0 md:text-[16px] md:leading-[1.6]"
            data-projects-el="intro"
          >
            <span className="md:hidden">
              Cada obra nasce de uma medida, de um desenho e de um cuidado que não aparece na foto.
            </span>
            <span className="hidden md:inline">
              Cada obra nasce de uma medida, de um desenho e de um cuidado que não aparece na foto,
              mas que você sente todo dia: o vão que desliza leve, o vidro que fecha sem ruído.
            </span>
          </p>
        </div>
      </header>

      <div className="px-(--gutter)">
        <div className="h-px bg-line" data-projects-el="divider" />
      </div>

      <div className="bg-greige px-(--gutter) pt-8 pb-16 md:pt-[72px] md:pb-24">
        <ul className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-[clamp(24px,3.33vw,48px)] md:gap-y-[clamp(48px,6.67vw,96px)]">
          {PROJETOS.map((projeto, i) => {
            const offset = i % 2 === 1;
            return (
              <li
                key={projeto.id}
                className={offset ? "md:relative md:top-[min(120px,8.33vw)]" : undefined}
              >
                <ProjectCard projeto={projeto} offset={offset} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      <div
        className="bg-night px-(--gutter) pb-16 md:pb-[clamp(56px,11vh,104px)]"
        data-projects-el="cta"
        data-nav-tone="dark"
      >
        <div className="h-px bg-white/14" />
        {/* md+: grade em que o botão fica na linha do título, centralizado na vertical em relação a ele */}
        <div className="mt-10 flex flex-col gap-8 md:mt-[clamp(56px,11vh,104px)] md:grid md:grid-cols-[1fr_auto] md:gap-x-8 md:gap-y-6">
          <div className="flex flex-col gap-4 md:contents">
            <p
              className="text-[12px] leading-[normal] font-medium tracking-[0.14em] text-bronze md:col-start-1 md:row-start-1"
              data-projects-el="cta-eyebrow"
            >
              SEU PROJETO
            </p>
            <h3
              aria-label="A próxima obra pode ser a sua."
              className="font-display text-[44px] leading-none font-medium tracking-[-0.02em] text-paper md:col-start-1 md:row-start-2 md:text-[length:clamp(2rem,min(4.2vw,7vh),3.5rem)] md:leading-[1.05]"
              data-projects-el="cta-title"
            >
              <MaskedWords lines={["A próxima obra", "pode ser a sua."]} accent="sua." />
            </h3>
          </div>

          <a
            href={QUOTE_LINK.href}
            {...NEW_TAB}
            className="group focus-ring self-start rounded-full bg-bronze transition-colors duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] hover:bg-[#b88b5c] motion-reduce:transition-none px-8 py-[18px] text-[12px] leading-[1.21] font-medium tracking-[0.14em] text-ink md:col-start-2 md:row-start-2 md:flex md:h-[clamp(48px,7.5vh,60px)] md:items-center md:self-center md:px-[clamp(28px,3vw,44px)] md:py-0 md:text-[13px] md:tracking-[0.12em]"
            data-projects-el="cta-button"
          >
            {/* Um só item flex: o espaço antes da seta não é descartado */}
            <span>
              PEDIR ORÇAMENTO{" "}
              <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none">
                ↗
              </span>
            </span>
          </a>
        </div>
      </div>

      <div
        className="projects__grain pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />
    </section>
  );
}
