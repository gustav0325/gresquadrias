"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { NAV_LINKS, QUOTE_LINK } from "@/config/navigation";
import { gsap, HERO_INTRO_EVENT, type HeroIntroDetail, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Seções na ordem da página; a Hero ("inicio") não tem link. */
const SECTION_IDS = ["inicio", ...NAV_LINKS.map((link) => link.href.split("#")[1])];
/** Se a Hero não comandar a entrada (erro, foto travada), a navbar aparece mesmo assim. */
const INTRO_FALLBACK_MS = 4500;

/**
 * Navbar fixa em cápsula de vidro.
 * Desktop (lg+): logo, links e botão Orçamento — Figma 74:1064 (sobre a Hero) e 74:8 (fundo claro).
 * Mobile: logo + "Menu" — Figma 96:144 (sobre a Hero) e 74:154 (fundo claro).
 * Tom "dark" sobre a Hero e blocos `[data-nav-tone="dark"]`; "light" no resto da página.
 * Um ScrollTrigger por seção marca o link ativo (bronze #996e40 + linha).
 */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState("inicio");
  const [overDarkBlock, setOverDarkBlock] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(
    (_, contextSafe) => {
      const header = headerRef.current!;
      const nav = navRef.current!;
      // Linha de referência: meio da cápsula
      const probe = () => header.getBoundingClientRect().top + header.offsetHeight / 2;

      // Entrada: a Hero avisa quando a navbar deve entrar (0,3 s na timeline dela)
      let fallback = 0;
      const onIntro = contextSafe!((event: Event) => {
        const { timeScale } = (event as CustomEvent<HeroIntroDetail>).detail;
        window.clearTimeout(fallback);
        gsap.to(nav, {
          opacity: 1,
          y: 0,
          duration: 0.7 / timeScale,
          ease: "power3.out",
          overwrite: true,
          clearProps: "transform,opacity",
        });
      });
      if (document.documentElement.classList.contains("js-ready")) {
        gsap.set(nav, { opacity: 0, y: -24 });
        window.addEventListener(HERO_INTRO_EVENT, onIntro);
        fallback = window.setTimeout(
          () => onIntro(new CustomEvent<HeroIntroDetail>(HERO_INTRO_EVENT, { detail: { timeScale: 1 } })),
          INTRO_FALLBACK_MS,
        );
      }

      // Link ativo: cada seção vale do topo dela até o topo da seguinte (contínuo, inclusive com o pin)
      SECTION_IDS.forEach((id, i) => {
        const section = document.getElementById(id);
        if (!section) return;
        const next = document.getElementById(SECTION_IDS[i + 1] ?? "");
        ScrollTrigger.create({
          trigger: section,
          start: () => `top ${probe()}px`,
          endTrigger: next ?? section,
          end: () => `${next ? "top" : "bottom"} ${probe()}px`,
          onToggle: (self) => {
            if (self.isActive) setActiveId(id);
          },
        });
      });

      // Blocos escuros fora da Hero (ex.: CTA de Projetos)
      document.querySelectorAll<HTMLElement>('[data-nav-tone="dark"]').forEach((block) => {
        ScrollTrigger.create({
          trigger: block,
          start: () => `top ${probe()}px`,
          end: () => `bottom ${probe()}px`,
          onToggle: (self) => setOverDarkBlock(self.isActive),
        });
      });

      // Depois de sair do topo: cápsula um pouco mais sólida (globals.css)
      ScrollTrigger.create({ start: 1, end: "max", onToggle: (self) => setScrolled(self.isActive) });

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener(HERO_INTRO_EVENT, onIntro);
      };
    },
    { scope: headerRef },
  );

  const tone = activeId === "inicio" || overDarkBlock ? "dark" : "light";

  return (
    <header
      ref={headerRef}
      className="navbar fixed inset-x-(--gutter) top-4 z-50 lg:top-6"
      data-navbar
      data-tone={tone}
      data-scrolled={scrolled || undefined}
    >
      <nav
        ref={navRef}
        aria-label="Principal"
        className="flex h-[52px] items-center justify-between rounded-full border border-(--nav-border) bg-(--nav-bg) py-2.5 pr-(--nav-pad-r) pl-(--nav-pad-l) text-(--nav-fg) backdrop-blur-(--nav-blur) transition-[background-color,border-color,color,backdrop-filter] duration-300 lg:h-auto lg:py-2"
      >
        <Link href="/" className="focus-ring shrink-0 rounded-sm">
          <Image
            src="/images/brand/logo-gr.svg"
            alt="GR Esquadrias"
            width={151}
            height={43}
            preload
            className="navbar__logo navbar__logo--dark h-[26.66px] w-[93.62px] lg:h-[43px] lg:w-[151px]"
          />
          <Image
            src="/images/brand/logo-gr-fundo-claro.svg"
            alt="GR Esquadrias"
            width={151}
            height={43}
            className="navbar__logo navbar__logo--light h-[26.66px] w-[93.62px] lg:h-[43px] lg:w-[151px]"
          />
        </Link>

        <ul className="hidden items-center gap-11 text-base leading-[1.55] lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={activeId === link.href.split("#")[1] ? "location" : undefined}
                className="navbar__link focus-ring rounded-sm"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={QUOTE_LINK.href}
              className="navbar__quote btn-bronze focus-ring flex items-center gap-2.5 rounded-full py-[13px] pr-[30px] pl-[34px] text-(--nav-btn-fg)"
            >
              {QUOTE_LINK.label}
              {/* Caixa fixa de 16px como no Figma */}
              <span aria-hidden="true" className="navbar__quote-arrow inline-block w-4 text-center">
                ↗
              </span>
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="focus-ring rounded-sm text-[11px] font-medium tracking-[0.14em] uppercase lg:hidden"
        >
          Menu
        </button>
      </nav>
    </header>
  );
}
