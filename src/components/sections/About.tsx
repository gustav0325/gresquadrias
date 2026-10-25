"use client";

import Link from "next/link";
import { useRef } from "react";

import { MaskedWords } from "@/components/ui/MaskedWords";
import { SOBRE } from "@/data/sobre";
import { gsap, MOTION_QUERIES, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { clearReveal, WORD_HIDDEN_Y, wordLines } from "@/lib/reveal";

/** Tom inicial das palavras do manifesto: a tinta do título a 47% (≥ 3:1 sobre o fundo). */
const LIGHT_INK_ALPHA = 0.47;

/** "rgb(21, 17, 14)" → "rgb(21 17 14 / 0.47)" — mesma tinta, só mais clara. */
const withAlpha = (color: string, alpha: number) =>
  color.replace(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+).*\)/, `rgb($1 $2 $3 / ${alpha})`);

/**
 * Seção Sobre da Home — Figma "4 · Sobre": desktop 101:455 (1440×900) e mobile 101:1069.
 * Desktop (lg+): uma tela, conteúdo no topo e pilares ancorados embaixo (margin-top: auto);
 * espaços e tamanhos em `--about-*` (globals.css).
 * Só tipografia.
 *
 * Animações: uma timeline de entrada para a seção inteira (ela cabe na tela), com a contagem
 * do "+15"; no mobile cada pilar entra sozinho. O manifesto (título) escurece palavra a
 * palavra com o scroll — a cor vai na máscara da palavra, a revelação na palavra.
 */
export function About() {
  const { titulo, numero, apoio, pilares } = SOBRE;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);
      if (prefersReducedMotion()) return;

      const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;
      const title = q('[data-about-el="title"]')[0];

      // Manifesto: cada palavra passa do tom claro para a tinta final; "espaços." fica em bronze
      const ink = getComputedStyle(title).color;
      const masks = q('[data-about-el="title"] .word-mask').filter(
        (mask) => mask.textContent?.trim() !== titulo.destaque,
      );
      // Todas começam claras (com stagger, o "from" só valeria para quem já começou)
      gsap.set(masks, { color: withAlpha(ink, LIGHT_INK_ALPHA) });
      gsap.to(masks, {
        color: ink,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "top 5%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      if (!document.documentElement.classList.contains("js-ready")) return;

      // Entrada: cabeçalho → "+15" e texto → pilares (mobile: mais curta)
      const k = desktop ? 1 : 0.75;
      const eyebrow = q('[data-about-el="eyebrow-text"]');
      const eyebrowLine = q('[data-about-el="eyebrow-line"]');
      const lines = wordLines(title);
      const number = q('[data-about-el="number-value"]');
      const count = q("[data-count]")[0];
      const label = q('[data-about-el="number-label"]');
      const paragraphs = q('[data-about-el="paragraph"]');
      const link = q('[data-about-el="link"]');
      const counter = { value: 0 };

      gsap.set(eyebrow, { opacity: 0, y: 14 * k });
      gsap.set(eyebrowLine, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(lines.flat(), { opacity: 1, yPercent: WORD_HIDDEN_Y });
      gsap.set([number, label], { opacity: 0 });
      gsap.set(paragraphs, { opacity: 0, y: 24 * k });
      gsap.set(link, { opacity: 0, y: 12 * k });
      count.textContent = "0";

      const entry = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 65%", once: true },
        onComplete: clearReveal([eyebrow, eyebrowLine, lines.flat(), number, label, paragraphs, link]),
      });
      entry
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, 0)
        .to(eyebrowLine, { scaleX: 1, duration: 0.7 * k, ease: "power3.out" }, 0);
      lines.forEach((words, i) =>
        entry.to(words, { yPercent: 0, duration: 0.9 * k, ease: "power3.out" }, 0.15 + i * 0.15),
      );
      entry
        .to(number, { opacity: 1, duration: 0.4 * k, ease: "power2.out" }, 0.7)
        .to(
          counter,
          {
            value: numero.valor,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              count.textContent = String(Math.round(counter.value));
            },
          },
          0.7,
        )
        .to(label, { opacity: 1, duration: 0.5 * k, ease: "power2.out" }, 0.8)
        .to(paragraphs, { opacity: 1, y: 0, duration: 0.75 * k, ease: "power2.out" }, 0.9)
        .to(link, { opacity: 1, y: 0, duration: 0.5 * k, ease: "power2.out" }, 1.25);

      // Pilares: linha do topo, título e descrição; no desktop dentro da timeline,
      // no mobile (empilhados) cada um ao entrar na tela
      const pillarTargets: gsap.TweenTarget[] = [];
      q("[data-pillar]").forEach((pillar, i) => {
        const line = pillar.querySelectorAll("[data-pillar-line]");
        const heading = pillar.querySelectorAll("h3");
        const text = pillar.querySelectorAll("p");
        gsap.set(line, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(heading, { opacity: 0, y: 18 * k });
        gsap.set(text, { opacity: 0, y: 12 * k });
        pillarTargets.push(line, heading, text);
        const tl = desktop
          ? entry
          : gsap.timeline({
              scrollTrigger: { trigger: pillar, start: "top 85%", once: true },
              onComplete: clearReveal([line, heading, text]),
            });
        const at = desktop ? 1.3 + i * 0.12 : 0;
        tl.to(line, { scaleX: 1, duration: 0.7 * k, ease: "power3.out" }, at)
          .to(heading, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, at + 0.15)
          .to(text, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, at + 0.25);
      });
      if (desktop) {
        entry.eventCallback(
          "onComplete",
          clearReveal([eyebrow, eyebrowLine, lines.flat(), number, label, paragraphs, link, ...pillarTargets]),
        );
      }

      // Desmontagem (Strict Mode): o número volta ao valor real
      return () => {
        count.textContent = String(numero.valor);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="sobre"
      aria-labelledby="sobre-title"
      className="about relative isolate flex flex-col gap-8 overflow-hidden px-(--gutter) pt-[116px] pb-[72px] md:gap-16 md:pt-[180px] md:pb-[120px] lg:gap-(--about-gap) lg:pt-(--about-pt) lg:pb-(--about-pb)"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-white absolute -top-20 -left-[100px] size-[520px] md:-left-[200px] md:h-[860px] md:w-[1100px]" />
        <div className="glow-sand-1 absolute top-[356px] -left-[60px] h-[460px] w-[520px] md:top-[308px] md:left-[calc(33.33%+60px)] md:h-[800px] md:w-[1000px] lg:top-[34.2%]" />
        <div className="glow-sand-2 absolute top-[630px] -left-[100px] h-[460px] w-[520px] md:top-[681px] md:-left-[250px] md:h-[800px] md:w-[1000px] lg:top-[75.7%]" />
      </div>

      <p className="flex items-center gap-3 md:gap-4" data-about-el="eyebrow">
        <span
          className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-text md:text-[12px]"
          data-reveal
          data-about-el="eyebrow-text"
        >
          {SOBRE.eyebrow}
        </span>
        <span
          aria-hidden="true"
          className="h-px w-12 bg-line md:w-20"
          data-reveal
          data-about-el="eyebrow-line"
        />
      </p>

      {/* Título: corrido no mobile; duas linhas a partir do tablet */}
      <div className="@container">
        <h2
          id="sobre-title"
          aria-label={`${titulo.linha1} ${titulo.linha2} ${titulo.destaque}`}
          className="font-display text-[44px] leading-none font-medium tracking-[-0.02em] text-espresso md:text-[length:min(104px,7.6cqw)] lg:text-[length:clamp(2.25rem,min(5.56vw,8.9vh),5rem)]"
          data-about-el="title"
        >
          <MaskedWords
            lines={[titulo.linha1, `${titulo.linha2} ${titulo.destaque}`]}
            accent={titulo.destaque}
            accentClassName="text-bronze-deep"
            lineBreaks="md"
          />
        </h2>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        {/* Como no Figma (101:464): "+15" e rótulo em fluxo; o texto é centralizado
            em relação à coluna inteira (número + 52px + rótulo) */}
        <div className="flex flex-col items-start" data-about-el="number">
          {/* A cauda do "5" desce além da caixa de linha: a margem em em mantém o rótulo livre */}
          <p
            role="img"
            aria-label={numero.ariaLabel}
            data-reveal
            data-about-el="number-value"
            className="mb-[0.18em] font-display text-[length:clamp(5.5rem,34vw,8.25rem)] leading-[0.9] font-medium tracking-[-0.04em] whitespace-nowrap text-bronze-deep md:text-[length:clamp(132px,16.67vw,240px)] lg:mb-(--about-num-gap) lg:text-[length:clamp(4.5rem,min(11.8vw,18.9vh),10.625rem)] lg:leading-[0.88]"
          >
            {numero.prefixo}
            {/* O valor final invisível reserva a largura; a contagem fica por cima dele e
                não mexe no layout (alguns números intermediários são mais largos que "15") */}
            <span className="relative inline-block">
              <span className="invisible">{numero.valor}</span>
              <span className="absolute top-0 left-0" data-count>
                {numero.valor}
              </span>
            </span>
          </p>
          <p
            aria-hidden="true"
            className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-taupe-text md:text-[12px]"
            data-reveal
            data-about-el="number-label"
          >
            {numero.rotulo}
          </p>
        </div>

        <div
          className="flex w-full flex-col items-start gap-4 md:max-w-[560px] md:gap-9 lg:w-[600px] lg:max-w-none lg:shrink-0 lg:gap-(--about-text-gap)"
          data-about-el="text"
        >
          <div className="flex flex-col gap-4 md:gap-5">
            <p
              className="text-[16px] leading-[1.6] text-espresso md:text-[28px] md:leading-[1.5] lg:text-[length:clamp(1.0625rem,min(1.53vw,2.45vh),1.375rem)]"
              data-reveal
              data-about-el="paragraph"
            >
              {SOBRE.paragrafo}
            </p>
            <p
              className={`text-[16px] leading-[26px] text-cocoa md:text-[18px] md:leading-[28px] ${apoio.desktop ? "" : "lg:hidden"}`}
              data-reveal
              data-about-el="paragraph"
            >
              {apoio.texto}
            </p>
          </div>
          <Link
            href={SOBRE.link.href}
            className="link-line focus-ring rounded-sm text-[14px] leading-[1.21] font-medium text-bronze-text"
            data-reveal
            data-about-el="link"
          >
            {SOBRE.link.label} <span className="link-line__arrow">↗</span>
          </Link>
        </div>
      </div>

      <ul
        className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3 md:gap-12 md:pt-6 lg:mt-auto lg:pt-(--about-pillars-pt)"
        data-about-el="pillars"
      >
        {pilares.map((pilar) => (
          <li key={pilar.titulo} className="flex flex-col" data-pillar>
            <span
              aria-hidden="true"
              className="h-px w-full bg-[rgb(26_18_10/0.2)]"
              data-reveal
              data-pillar-line
            />
            <h3 data-reveal className="mt-7 font-display text-[28px] leading-[1.05] font-medium tracking-[-0.01em] text-espresso md:mt-11 md:text-[length:clamp(28px,2.5vw,36px)] lg:mt-(--about-pillar-line) lg:text-[length:clamp(1.25rem,min(2.08vw,3.3vh),1.875rem)]">
              {pilar.titulo}
            </h3>
            <p data-reveal className="mt-3 text-[15px] leading-[1.6] text-taupe-text md:mt-4 md:text-[16px] lg:mt-(--about-pillar-desc) lg:text-[15px]">
              {pilar.descricao}
            </p>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 z-10" />
    </section>
  );
}
