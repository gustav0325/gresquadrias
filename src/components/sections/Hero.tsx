"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { SECTION_LINKS } from "@/config/navigation";
import {
  gsap,
  HERO_INTRO_EVENT,
  type HeroIntroDetail,
  MOTION_QUERIES,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";

const TITLE_LINES = [
  { text: "Esquadrias que" },
  { text: "transformam" },
  { text: "espaços.", accent: true },
] as const;

/** Espera máxima pela foto antes de começar a entrada. */
const PHOTO_TIMEOUT_MS = 1500;
/** Desktop: rolagem (em alturas de tela) com a Hero parada antes de Projetos cobri-la. */
const HOLD = 0.6;
/** Fração da timeline de scroll ocupada pelo trecho parado (o resto é a cortina). */
const HOLD_SHARE = HOLD / (1 + HOLD);
/** Deslocamento máximo da foto no parallax (px). */
const PARALLAX_PX = 35;

/** Resolve quando a foto estiver carregada e decodificada, ou após o timeout. */
function waitForPhoto(img: HTMLImageElement | undefined) {
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, PHOTO_TIMEOUT_MS));
  if (!img) return timeout;
  const loaded = img.complete
    ? img.decode()
    : new Promise<void>((resolve, reject) => {
        img.addEventListener("load", () => img.decode().then(resolve, reject), { once: true });
        img.addEventListener("error", reject, { once: true });
      });
  return Promise.race([loaded.catch(() => undefined), timeout]);
}

/**
 * Hero da Home — Figma "Desktop - Hero — CLARO" (74:1058) e
 * "Mobile - Hero — CLARO" (96:73).
 *
 * Entrada: timeline única, iniciada quando a foto está pronta.
 * Desktop: a Hero fica fixa (pin) por 60% da tela enquanto a foto faz parallax e os
 * textos saem; depois Projetos passa por cima dela como uma cortina.
 * Transforms em níveis separados: parallax no wrapper da foto, scale na <img>;
 * saída no bloco de texto e no selo, entrada nos filhos deles.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);
      const root = document.documentElement;
      const reduce = prefersReducedMotion();

      const photo = q('[data-hero-el="image"] img');
      const ring = q(".scroll-seal__ring");

      // Selo: rotação contínua só do anel de texto, pausada fora da Hero
      const spin = reduce
        ? null
        : gsap.to(ring, { rotation: 360, duration: 25, ease: "none", repeat: -1, paused: true });
      let sealInView = true;
      let introDone = false;
      let cancelled = false;
      const syncSpin = () => spin?.paused(!(sealInView && introDone));

      // ---------------------------------------------------------------- Entrada
      if (!reduce && root.classList.contains("js-ready")) {
        const timeScale = window.matchMedia(MOTION_QUERIES.desktop).matches ? 1 : 1.3;
        const ctaIcon = q('[data-hero-el="cta"] > svg');
        const ctaText = q('[data-hero-el="cta"] > span');

        gsap.set(photo, { opacity: 0, scale: timeScale === 1 ? 1.05 : 1.03 });
        gsap.set(q('[data-hero-el="eyebrow"]'), { opacity: 0, y: 12 });
        gsap.set(q(".hero__title-text"), { opacity: 1, yPercent: 110 });
        gsap.set(q('[data-hero-el="subtitle"]'), { opacity: 0, y: 24 });
        gsap.set(q('[data-hero-el="divider"]'), { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(ctaIcon, { opacity: 0, x: -10 });
        gsap.set(ctaText, { opacity: 0 });
        gsap.set(q(".scroll-seal__ring, .scroll-seal__arrow"), { opacity: 0 });

        const intro = gsap.timeline({
          paused: true,
          // Fim: tira o CSS de espera e os estilos inline (texto rasterizado como na versão estática).
          // O anel do selo mantém o transform da rotação.
          onComplete: () => {
            root.classList.remove("js-ready");
            gsap.set(
              [
                photo,
                q('[data-hero-el="eyebrow"]'),
                q(".hero__title-text"),
                q('[data-hero-el="subtitle"]'),
                q('[data-hero-el="divider"]'),
                ctaIcon,
                ctaText,
              ],
              { clearProps: "transform,transformOrigin,opacity" },
            );
            gsap.set(q(".scroll-seal__ring, .scroll-seal__arrow"), { clearProps: "opacity" });
          },
        });
        intro
          .to(photo, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, 0)
          .call(
            () =>
              window.dispatchEvent(
                new CustomEvent<HeroIntroDetail>(HERO_INTRO_EVENT, { detail: { timeScale } }),
              ),
            [],
            0.3,
          )
          .to(q('[data-hero-el="eyebrow"]'), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.6)
          .to(
            q(".hero__title-text"),
            { yPercent: 0, duration: 0.75, stagger: 0.12, ease: "power3.out" },
            0.66,
          )
          .to(q('[data-hero-el="subtitle"]'), { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.2)
          .to(q('[data-hero-el="divider"]'), { scaleX: 1, duration: 0.55, ease: "power3.out" }, 1.5)
          .to(ctaIcon, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" }, 1.5)
          .to(ctaText, { opacity: 1, duration: 0.55, ease: "power3.out" }, 1.58)
          .to(q(".scroll-seal__ring, .scroll-seal__arrow"), { opacity: 1, duration: 0.6, ease: "power2.out" }, 1.9)
          .call(() => {
            introDone = true;
            syncSpin();
          }, [], 1.9)
          .timeScale(timeScale);

        // `cancelled`: no Strict Mode/desmontagem não inicia uma timeline já revertida
        waitForPhoto(photo[0] as HTMLImageElement | undefined).then(() => {
          if (!cancelled) intro.play();
        });
      } else {
        introDone = true;
        syncSpin();
      }

      // ---------------------------------------------------------------- Scroll
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES, (context) => {
        const { desktop } = context.conditions as { desktop: boolean };
        const hold = () => window.innerHeight * HOLD;
        let removeRefreshListener: (() => void) | undefined;

        if (desktop) {
          // Espaço extra de rolagem para o trecho parado (a cortina usa a rolagem normal)
          gsap.set(spacerRef.current, { height: `${HOLD * 100}vh` });

          const scrolled = q('[data-hero-el="image"], [data-hero-el="content"], [data-hero-el="scroll"]');
          // No topo a Hero fica sem estilos inline, idêntica à versão estática
          // (o translate3d da foto mudaria a rasterização da camada)
          const resetAtTop = () => {
            // Após um refresh o progresso pode ficar em ~1e-7 em vez de 0
            if (scroll.progress() < 1e-4) gsap.set(scrolled, { clearProps: "transform,opacity" });
          };

          const scroll = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: resetAtTop,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${section.offsetHeight + hold()}`,
              pin: true,
              pinSpacing: false,
              scrub: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          });
          scroll
            .to(q('[data-hero-el="image"]'), { y: -PARALLAX_PX, duration: 1 }, 0)
            .to(
              q('[data-hero-el="content"], [data-hero-el="scroll"]'),
              { y: -60, opacity: 0, duration: 0.5 * HOLD_SHARE, ease: "power1.in" },
              0.15 * HOLD_SHARE,
            );
          ScrollTrigger.addEventListener("refresh", resetAtTop);
          removeRefreshListener = () => ScrollTrigger.removeEventListener("refresh", resetAtTop);
        }

        // Selo visível: desktop até o fim da saída dos textos; mobile até a Hero sair da tela
        ScrollTrigger.create({
          start: -1,
          end: () => (desktop ? hold() * 0.65 : section.offsetHeight),
          onToggle: (self) => {
            sealInView = self.isActive;
            syncSpin();
          },
        });

        ScrollTrigger.refresh();
        return () => removeRefreshListener?.();
      });

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="inicio"
        aria-labelledby="hero-title"
        className="hero relative isolate flex flex-col justify-end overflow-hidden bg-ink-warm md:bg-sand md:pb-(--hero-pb)"
        data-hero
      >
        {/* Fotografia + tratamentos — mobile: 600px de 844px (bottom 244px).
            O fundo escuro só aparece sob a sombra inferior durante o parallax. */}
        <div
          className="hero__media absolute inset-x-0 top-0 bottom-[244px] -z-10 overflow-hidden bg-ink md:bottom-0"
          data-hero-el="media"
        >
          <div className="hero__image absolute inset-0" data-hero-el="image">
            <Image
              src="/images/hero/hero-fachada.png"
              alt="Fachada de residência com esquadrias de alumínio e vidro iluminadas ao entardecer"
              fill
              preload
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="hero__tone absolute inset-0" />
          <div className="hero__shade-left absolute inset-0" />
          <div className="hero__shade-bottom absolute inset-0" />
          <div className="hero__shade-top absolute inset-0" />
        </div>

        <div
          className="hero__shade-text absolute inset-x-0 -bottom-1.5 -z-10 h-[520px] md:hidden"
          aria-hidden="true"
        />
        <div
          className="hero__reveal absolute inset-x-0 bottom-0 -z-10 h-[90px] md:h-[110px]"
          aria-hidden="true"
        />

        <div
          className="hero__content px-(--content-x) pt-28 pb-[90px] md:pt-32 md:pb-0"
          data-hero-el="content"
        >
          <p
            className="hero__eyebrow text-[11px] leading-[18px] font-medium tracking-[0.2em] text-bronze uppercase md:text-xs"
            data-hero-el="eyebrow"
          >
            Alumínio e vidro sob medida
          </p>

          <h1
            id="hero-title"
            className="hero__title mt-2.5 flex flex-col font-display text-[length:clamp(2.5rem,13vw,3.5rem)] leading-none font-medium tracking-[-0.02em] text-paper md:mt-[clamp(12px,2vh,20px)] md:text-[length:clamp(2.75rem,min(6.4vw,11.5vh),6.5rem)]"
          >
            {TITLE_LINES.map((line) => (
              <span key={line.text} className="hero__title-line" data-hero-el="title-line">
                <span className={`hero__title-text ${"accent" in line ? "text-bronze" : ""}`}>
                  {line.text}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="hero__subtitle mt-5 text-base leading-6 text-paper md:mt-[clamp(14px,2.5vh,28px)] md:max-w-[440px] md:text-[length:clamp(1rem,1.25vw,1.125rem)] md:leading-[1.55]"
            data-hero-el="subtitle"
          >
            Design, funcionalidade e qualidade em esquadrias de alumínio e vidro, do projeto à
            instalação.
          </p>

          <hr
            className="hero__divider mt-6 h-px border-0 bg-white/28 md:mt-[clamp(20px,3.5vh,40px)] md:max-w-[440px]"
            data-hero-el="divider"
          />

          <Link
            href={SECTION_LINKS.projetos}
            className="hero__cta focus-ring mt-[19px] flex w-fit items-center gap-5 rounded-full md:mt-[clamp(20px,3.5vh,40px)]"
            data-hero-el="cta"
          >
            {/* Mesmo desenho de /icons/seta-circular.svg, em linha para animar seta e borda no hover */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="shrink-0">
              <rect
                className="hero__cta-circle"
                x="0.5"
                y="0.5"
                width="55"
                height="55"
                rx="27.5"
                stroke="white"
                strokeOpacity="0.7"
              />
              <path
                className="hero__cta-arrow"
                d="M20 28H36M30 34L36 28L30 22"
                stroke="#F3F0EA"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs leading-none font-medium tracking-[0.22em] text-paper uppercase">
              Ver projetos
            </span>
          </Link>
        </div>

        <div
          className="hero__grain pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        />

        <ScrollIndicator
          href={SECTION_LINKS.projetos}
          className="absolute right-[39.375px] bottom-[32.375px] z-20 md:right-(--gutter) md:left-auto md:bottom-[calc(var(--hero-pb)+24px)]"
        />
      </section>

      {/* Desktop com animação: rolagem extra do trecho em que a Hero fica parada */}
      <div ref={spacerRef} aria-hidden="true" />
    </>
  );
}
