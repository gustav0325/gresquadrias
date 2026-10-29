"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { NAV_LINKS, NEW_TAB, QUOTE_LINK, sectionId } from "@/config/navigation";
import {
  entrancesEnabled,
  gsap,
  HERO_INTRO_EVENT,
  type HeroIntroDetail,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";
import { lockPage } from "@/lib/page-lock";
import { scrollToSection } from "@/lib/smooth-scroll";

/** Seções da Home na ordem da página; a Hero ("inicio") não tem link. */
const SECTION_IDS = ["inicio", ...NAV_LINKS.flatMap((link) => sectionId(link.href) ?? [])];
/** Se a Hero não comandar a entrada (erro, foto travada), a navbar aparece mesmo assim. */
const INTRO_FALLBACK_MS = 4500;
/** A entrada da navbar acontece uma única vez por carregamento da página. */
let introPlayed = false;
/** Mesmo breakpoint do `lg:` (64rem): a partir dele o menu mobile não existe. */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * Navbar fixa em cápsula de vidro.
 * Desktop (lg+): logo, links e botão Orçamento — Figma 74:1064 (sobre a Hero) e 74:8 (fundo claro).
 * Mobile: logo + "Menu" — Figma 96:144 (sobre a Hero) e 74:154 (fundo claro).
 * Tom "dark" sobre a Hero e blocos `[data-nav-tone="dark"]`; "light" no resto da página e nas
 * páginas sem Hero (/obras).
 * Link ativo (bronze #996e40 + linha): na Home, a seção visível (um ScrollTrigger por seção);
 * fora dela, o link da página atual ("Obras" em /obras).
 * Links âncora fora da Home navegam para "/#secao" (o SmoothScroll rola até ela na chegada).
 *
 * Menu mobile (o Figma não tem o estado aberto): painel logo abaixo da cápsula, com o mesmo
 * vidro, os links e o botão Orçamento. É modal: trava a página, prende o foco na navbar e fecha
 * com Esc, toque fora, o próprio botão ou ao seguir um link.
 */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeId, setActiveId] = useState("inicio");
  const [overDarkBlock, setOverDarkBlock] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** Ao fechar, devolve o foco ao botão (Esc, toque fora, botão); não ao seguir um link. */
  const restoreFocus = useRef(false);
  const menuWasOpened = useRef(false);

  const closeMenu = useCallback((returnFocus: boolean) => {
    restoreFocus.current = returnFocus;
    setMenuOpen(false);
  }, []);

  // O SmoothScroll já libera a página antes de rolar; aqui cobre a navegação nativa (reduced-motion)
  const onMenuLink = () => {
    lockPage(false);
    closeMenu(false);
  };

  // Logo já na Home: volta ao topo (em vez de uma navegação para a mesma rota)
  const onLogo = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isHome || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    lockPage(false);
    closeMenu(false);
    scrollToSection(null);
  };

  const ariaCurrent = (href: string) => {
    const id = sectionId(href);
    if (id) return isHome && activeId === id ? ("location" as const) : undefined;
    return pathname === href ? ("page" as const) : undefined;
  };

  // Menu aberto: página travada, Esc fecha, Tab circula pela navbar, desktop fecha
  useEffect(() => {
    if (!menuOpen) return;
    const header = headerRef.current!;
    const menuButton = menuButtonRef.current;
    lockPage(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(header.querySelectorAll<HTMLElement>("a[href], button")).filter(
        (el) => el.getClientRects().length > 0,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) closeMenu(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      lockPage(false);
      if (restoreFocus.current) menuButton?.focus();
      restoreFocus.current = false;
    };
  }, [menuOpen, closeMenu]);

  // Abertura: painel desce 8px e aparece (0,45 s, power3.out), itens em sequência (0,07 s)
  useGSAP(
    () => {
      const panel = menuRef.current!;
      const layers = [panel, scrimRef.current!];
      const items = panel.querySelectorAll("[data-menu-item]");
      const reduced = prefersReducedMotion();
      gsap.killTweensOf([...layers, ...items]);

      if (menuOpen) {
        menuWasOpened.current = true;
        // Já visível (visibility) no início: o foco no primeiro link precisa disso
        if (reduced) {
          gsap.set(layers, { autoAlpha: 1, y: 0 });
          gsap.set(items, { opacity: 1, y: 0 });
        } else {
          gsap.fromTo(
            layers,
            { opacity: 0, visibility: "visible" },
            { opacity: 1, duration: 0.45, ease: "power3.out" },
          );
          gsap.fromTo(panel, { y: -8 }, { y: 0, duration: 0.45, ease: "power3.out" });
          gsap.fromTo(
            items,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.07, delay: 0.05 },
          );
        }
        panel.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
      } else if (menuWasOpened.current) {
        if (reduced) gsap.set(layers, { autoAlpha: 0 });
        else gsap.to(layers, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
      }
    },
    { dependencies: [menuOpen] },
  );

  useGSAP(
    (context) => {
      const header = headerRef.current!;
      const nav = navRef.current!;
      // Linha de referência: meio da cápsula
      const probe = () => header.getBoundingClientRect().top + header.offsetHeight / 2;

      // Entrada: dona única é este componente; a Hero só avisa quando começar (0,3 s na
      // timeline dela). Roda uma vez: estados claro/escuro, link ativo e refresh nunca a refazem.
      // A tween é criada FORA de qualquer contexto do GSAP (ignore): o aviso chega por um
      // callback da timeline da Hero, que o GSAP executa no contexto dela; registrada lá, a
      // tween seria desfeita por um revert de matchMedia ao redimensionar (navbar sumia).
      let fallback = 0;
      const onIntro = (event: Event) => {
        if (introPlayed) return;
        introPlayed = true;
        const { timeScale } = (event as CustomEvent<HeroIntroDetail>).detail;
        window.clearTimeout(fallback);
        context.ignore(() => {
          gsap.fromTo(
            nav,
            { opacity: 0, y: -24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7 / timeScale,
              ease: "power3.out",
              immediateRender: false,
              overwrite: "auto",
              // Fica visível inline (o CSS de espera pode ainda existir); só o transform sai
              clearProps: "transform",
            },
          );
        });
      };
      if (entrancesEnabled() && !introPlayed) {
        gsap.set(nav, { opacity: 0, y: -24 });
        window.addEventListener(HERO_INTRO_EVENT, onIntro);
        // Página sem Hero (/obras aberta direto): entra logo, sem esperar o aviso
        fallback = window.setTimeout(
          () =>
            onIntro(
              new CustomEvent<HeroIntroDetail>(HERO_INTRO_EVENT, { detail: { timeScale: 1 } }),
            ),
          isHome ? INTRO_FALLBACK_MS : 0,
        );
      } else if (entrancesEnabled()) {
        // Navbar remontada ao trocar de página: a entrada já aconteceu; visível mesmo se o CSS
        // de espera (`html.js-ready`) ainda existir
        gsap.set(nav, { opacity: 1 });
      }

      // Rotas anteriores continuam no DOM, escondidas (cacheComponents → <Activity hidden>):
      // gatilhos só em elementos da página visível. Um gatilho em elemento com display: none
      // nunca tem posição e faz o ScrollTrigger.refresh() entrar em recursão.
      const rendered = (el: Element | null): el is HTMLElement =>
        el instanceof HTMLElement && el.getClientRects().length > 0;

      // Link ativo (só na Home): cada seção vale do topo dela até o topo da seguinte
      // (contínuo, inclusive com o pin)
      (isHome ? SECTION_IDS : []).forEach((id, i) => {
        const section = document.getElementById(id);
        if (!rendered(section)) return;
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
      [...document.querySelectorAll('[data-nav-tone="dark"]')].filter(rendered).forEach((block) => {
        ScrollTrigger.create({
          trigger: block,
          start: () => `top ${probe()}px`,
          end: () => `bottom ${probe()}px`,
          onToggle: (self) => setOverDarkBlock(self.isActive),
        });
      });

      // Depois de sair do topo: cápsula um pouco mais sólida (globals.css)
      ScrollTrigger.create({
        start: 1,
        end: "max",
        onToggle: (self) => setScrolled(self.isActive),
      });

      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener(HERO_INTRO_EVENT, onIntro);
        // Página escondida e mostrada de novo (Activity): o estado volta a vir dos gatilhos novos
        setOverDarkBlock(false);
      };
    },
    { scope: headerRef },
  );

  const tone = (isHome && activeId === "inicio") || overDarkBlock ? "dark" : "light";

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
        <Link href="/" onClick={onLogo} className="focus-ring shrink-0 rounded-sm">
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
                aria-current={ariaCurrent(link.href)}
                className="navbar__link focus-ring rounded-sm"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={QUOTE_LINK.href}
              {...NEW_TAB}
              className="navbar__quote btn-bronze focus-ring flex items-center gap-2.5 rounded-full py-[13px] pr-[30px] pl-[34px] text-(--nav-btn-fg)"
            >
              {QUOTE_LINK.label}
              {/* Caixa fixa de 16px como no Figma */}
              <span aria-hidden="true" className="navbar__quote-arrow inline-block w-4 text-center">
                ↗
              </span>
            </a>
          </li>
        </ul>

        {/* -m-3 p-3: área de toque de ~37px sem mudar a posição do texto */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
          className="focus-ring -m-3 touch-manipulation rounded-sm p-3 text-[11px] font-medium tracking-[0.14em] uppercase lg:hidden"
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </nav>

      {/* Fundo do menu: escurece a página e fecha ao toque (fixed: a header não tem transform) */}
      <div
        ref={scrimRef}
        className="navbar__scrim invisible fixed inset-0 -z-10 touch-none opacity-0 lg:hidden"
        aria-hidden="true"
        onClick={() => closeMenu(true)}
      />

      <div
        ref={menuRef}
        id="menu-mobile"
        inert={!menuOpen}
        className="invisible absolute inset-x-0 top-full mt-2 touch-none rounded-[26px] border border-(--nav-border) bg-(--nav-menu-bg) px-(--nav-pad-l) pt-2 pb-(--nav-pad-l) text-(--nav-fg) opacity-0 backdrop-blur-(--nav-blur) lg:hidden"
      >
        <ul className="text-base leading-[1.55]">
          {NAV_LINKS.map((link, i) => (
            <li
              key={link.href}
              className={i > 0 ? "border-t border-(--nav-border)" : undefined}
              data-menu-item
            >
              <Link
                href={link.href}
                onClick={onMenuLink}
                aria-current={ariaCurrent(link.href)}
                className="focus-ring block rounded-sm py-3 aria-[current]:text-(--nav-active)"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2" data-menu-item>
          <a
            href={QUOTE_LINK.href}
            {...NEW_TAB}
            onClick={onMenuLink}
            className="navbar__quote btn-bronze focus-ring flex items-center justify-center gap-2.5 rounded-full py-[13px] text-(--nav-btn-fg)"
          >
            {QUOTE_LINK.label}
            <span aria-hidden="true" className="navbar__quote-arrow inline-block w-4 text-center">
              ↗
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
