"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal, preload } from "react-dom";

import { MaskedWords } from "@/components/ui/MaskedWords";
import { QuoteCta } from "@/components/ui/QuoteCta";
import { WorkCard } from "@/components/ui/WorkCard";
import { WorkLightbox } from "@/components/ui/WorkLightbox";
import { COLUNAS, type Obra, OBRAS_EM_ORDEM } from "@/data/obras";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { clearReveal, revealLines, scheduleRefresh, WORD_HIDDEN_Y } from "@/lib/reveal";
import { useVideoAutoplay } from "@/lib/video-autoplay";

/** Parallax (% da camada, que tem 110% da moldura): ±4,4% da moldura, ~20–32px no desktop. */
const PARALLAX_PERCENT = 4;
/** Primeiras mídias na ordem de leitura: acima da dobra no desktop (v01, v04) e no mobile. */
const ABOVE_FOLD = new Set(OBRAS_EM_ORDEM.slice(0, 2).map((obra) => obra.id));

/**
 * Página /obras — Figma "Obras - Desktop" (123:2). Mobile derivado de "2 · Projetos" (101:730).
 *
 * Cabeçalho, grade de fotos/vídeos em duas colunas assimétricas (a direita começa 120px abaixo;
 * no mobile uma coluna que intercala as duas, pela `ordem`), galeria em tela cheia e o CTA.
 *
 * Animações: cabeçalho ao carregar; cada item ao entrar na tela (máscara + zoom-out, depois
 * legenda e selo); parallax só no desktop. Estados iniciais só sob `html.js-ready`. Os gatilhos
 * vivem no contexto do useGSAP: saem junto com a página.
 */
export function Works() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  useVideoAutoplay(gridRef, openIndex !== null);

  // Capas dos vídeos acima da dobra: candidatas a LCP, então baixam com prioridade
  OBRAS_EM_ORDEM.forEach((obra) => {
    if (obra.video && ABOVE_FOLD.has(obra.id)) {
      preload(obra.src, { as: "image", fetchPriority: "high" });
    }
  });

  const onOpen = useCallback((obra: Obra, button: HTMLButtonElement) => {
    setOpener(button);
    setOpenIndex(OBRAS_EM_ORDEM.indexOf(obra));
  }, []);
  const onClose = useCallback(() => setOpenIndex(null), []);

  // Ao sair da página ela fica escondida, não desmontada (cacheComponents → <Activity>):
  // a galeria não pode reaparecer aberta ao voltar
  useLayoutEffect(() => () => setOpenIndex(null), []);

  // Alturas mudam com as fontes e as mídias: recalcula os gatilhos (com debounce)
  useEffect(() => {
    let active = true;
    document.fonts?.ready.then(() => active && scheduleRefresh());
    const posters = OBRAS_EM_ORDEM.filter((obra) => obra.video).map((obra) => {
      const img = new window.Image();
      img.onload = () => active && scheduleRefresh();
      img.src = obra.src;
      return img;
    });
    return () => {
      active = false;
      posters.forEach((img) => (img.onload = null));
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);

      // ------------------------------------------------------------ Entradas
      if (entrancesEnabled()) {
        // Mobile: mais curto e sem atraso entre mídia e legenda
        const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;

        // Cabeçalho: timeline única ao carregar
        const eyebrow = q('[data-works-el="eyebrow"]');
        const titleWords = q('[data-works-el="title"] [data-word]');
        const titleLines = q('[data-works-el="title"] [data-line]');
        const intro = q('[data-works-el="intro"]');
        const divider = q('[data-works-el="divider"]');
        gsap.set(eyebrow, { opacity: 0, y: 16 });
        gsap.set(titleWords, { opacity: 1, yPercent: WORD_HIDDEN_Y });
        gsap.set(intro, { opacity: 0, y: 20 });
        gsap.set(divider, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
        const header = gsap.timeline({
          delay: 0.1,
          onComplete: clearReveal([eyebrow, titleWords, intro, divider]),
        });
        header.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);
        revealLines(header, titleLines, 0.2, { duration: 0.9, stagger: 0.15 });
        const afterTitle = 0.2 + titleLines.length * 0.15 + 0.2;
        header.to(intro, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, afterTitle);
        header.to(divider, { scaleX: 1, duration: 0.8, ease: "power3.out" }, afterTitle + 0.25);

        // Itens: moldura abre de baixo para cima, a mídia assenta (1.05 → 1); legenda e selo depois
        const duration = desktop ? 1.1 : 0.7;
        q("[data-work-card]").forEach((card) => {
          const frame = card.querySelector('[data-work-el="frame"]');
          const reveal = card.querySelector('[data-work-el="reveal"]');
          const details = card.querySelectorAll('[data-work-el="caption"], [data-work-el="badge"]');
          gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(reveal, { scale: desktop ? 1.05 : 1.03 });
          gsap.set(details, { opacity: 0, y: 16 });
          gsap
            .timeline({
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
              onComplete: clearReveal([frame, reveal, details]),
            })
            .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration, ease: "power3.out" }, 0)
            .to(reveal, { scale: 1, duration, ease: "power3.out" }, 0)
            .to(
              details,
              { opacity: 1, y: 0, duration: desktop ? 0.6 : 0.5, ease: "power2.out" },
              desktop ? 0.15 : 0,
            );
        });
      }

      // ------------------------------------------------------------ Parallax (desktop)
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.desktop, () => {
        q('[data-work-el="parallax"]').forEach((layer) => {
          gsap.fromTo(
            layer,
            { yPercent: -PARALLAX_PERCENT },
            {
              yPercent: PARALLAX_PERCENT,
              ease: "none",
              scrollTrigger: {
                trigger: layer.closest('[data-work-el="frame"]'),
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
      aria-labelledby="obras-title"
      className="works relative isolate overflow-hidden"
    >
      {/* Fundo: degradê da página + brilhos (Figma 123:3 a 123:6, 124:112, 124:113) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="glow-white absolute -top-20 -left-[100px] size-[520px] md:-left-[200px] md:h-[860px] md:w-[1100px]" />
        <div className="works__glow-sand absolute top-[12%] -right-[130px] h-[460px] w-[520px] md:-right-[100px] md:h-[800px] md:w-[1000px]" />
        <div className="works__glow-sand absolute top-[26%] -left-[150px] h-[460px] w-[520px] md:-left-[250px] md:h-[800px] md:w-[1000px]" />
        <div className="works__glow-sand absolute top-[60%] -right-[130px] h-[460px] w-[520px] md:-right-[100px] md:h-[800px] md:w-[1000px]" />
        <div className="works__glow-sand absolute top-[89%] -left-[150px] h-[460px] w-[520px] md:-left-[250px] md:h-[800px] md:w-[1000px]" />
      </div>

      <header className="px-(--gutter) pt-[116px] pb-8 md:pt-[max(clamp(112px,22vh,200px),calc(var(--nav-offset)+24px))] md:pb-[clamp(32px,7vh,64px)]">
        <p
          className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-deep md:text-xs"
          data-reveal
          data-works-el="eyebrow"
        >
          OBRAS
        </p>

        <div className="mt-5 flex flex-col gap-5 md:mt-[clamp(16px,3vh,28px)] md:flex-row md:items-end md:justify-between md:gap-12">
          <h1
            id="obras-title"
            aria-label="Últimas obras."
            className="font-display text-[52px] leading-none font-medium tracking-[-0.02em] text-espresso md:text-[length:clamp(2.75rem,min(6.67vw,10.7vh),6rem)]"
            data-works-el="title"
          >
            <MaskedWords lines={["Últimas", "obras."]} />
          </h1>

          <p
            className="text-[15px] leading-[1.55] text-taupe md:w-[380px] md:shrink-0 md:text-[16px] md:leading-[1.6]"
            data-reveal
            data-works-el="intro"
          >
            Uma seleção de trabalhos recentes da GR Esquadrias, com fotos e vídeos reais de cada
            obra.
          </p>
        </div>
      </header>

      <div className="px-(--gutter)">
        <div className="h-px bg-line" data-reveal data-works-el="divider" />
      </div>

      {/* Mobile: as colunas somem do layout (contents) e a `ordem` intercala os itens */}
      <div className="px-(--gutter) pt-8 pb-16 md:pt-[72px] md:pb-[120px]">
        <div
          ref={gridRef}
          className="flex flex-col gap-12 md:flex-row md:items-start md:gap-x-[clamp(24px,3.33vw,48px)]"
        >
          {COLUNAS.map((coluna, c) => (
            <ul
              key={c}
              className={`contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-y-[clamp(48px,6.67vw,96px)] ${c === 1 ? "md:pt-[min(120px,8.33vw)]" : ""}`}
            >
              {coluna.map((obra) => (
                <li
                  key={obra.id}
                  className="order-(--ordem) md:order-none"
                  style={{ "--ordem": obra.ordem } as React.CSSProperties}
                >
                  <WorkCard obra={obra} preload={ABOVE_FOLD.has(obra.id)} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <QuoteCta headingLevel="h2" />

      <div className="paper-grain pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

      {openIndex !== null &&
        createPortal(
          <WorkLightbox
            obras={OBRAS_EM_ORDEM}
            index={openIndex}
            onIndexChange={setOpenIndex}
            onClose={onClose}
            opener={opener}
          />,
          document.body,
        )}
    </section>
  );
}
