"use client";

import { useRef } from "react";

import { MaskedWords } from "@/components/ui/MaskedWords";
import { CONTATO, CONTATO_TEXTOS } from "@/data/contato";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { clearReveal, REVEALED, WORD_HIDDEN_Y, wordLines } from "@/lib/reveal";

const NOVA_ABA = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Seção Contato da Home — Figma "5 · Contato + rodapé": desktop 101:541 e mobile 101:1147.
 * O rodapé é um componente à parte (layout), único no site.
 *
 * Animações: cabeçalho (disparo único) e a faixa de contatos + mapa numa timeline só, curta
 * (~1,6 s; tudo clicável desde o início). No mobile cada contato entra sozinho e o mapa depois.
 * O mapa é revelado por wrappers (clip-path fora, scale dentro), nunca no iframe; no fim os
 * estilos saem e ele fica estático e interativo.
 */
export function Contact() {
  const { telefone, email, endereco, horario, whatsapp } = CONTATO;
  const { titulo } = CONTATO_TEXTOS;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!entrancesEnabled()) return;
      const q = gsap.utils.selector(sectionRef);
      const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;
      const k = desktop ? 1 : 0.75;
      const line = (targets: gsap.TweenTarget) =>
        gsap.set(targets, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });

      // Cabeçalho: eyebrow e linha → título linha por linha → apoio
      const eyebrow = q('[data-contact-el="eyebrow-text"]');
      const eyebrowLine = q('[data-contact-el="eyebrow-line"]');
      const lines = wordLines(q('[data-contact-el="title"]')[0]);
      const lead = q('[data-contact-el="lead"]');
      gsap.set(eyebrow, { opacity: 0, y: 14 * k });
      line(eyebrowLine);
      gsap.set(lines.flat(), { opacity: 1, yPercent: WORD_HIDDEN_Y });
      gsap.set(lead, { opacity: 0, y: 20 * k });
      const header = gsap.timeline({
        scrollTrigger: {
          trigger: q('[data-contact-el="header"]')[0],
          start: "top 80%",
          once: true,
        },
        onComplete: clearReveal([eyebrow, eyebrowLine, lines.flat(), lead]),
      });
      header
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, 0)
        .to(eyebrowLine, { scaleX: 1, duration: 0.7 * k, ease: "power3.out" }, 0);
      lines.forEach((words, i) =>
        header.to(words, { yPercent: 0, duration: 0.9 * k, ease: "power3.out" }, 0.15 + i * 0.15),
      );
      header.to(lead, { opacity: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0.45);

      // Faixa: contatos (com as linhas) → botão → links; o mapa começa junto
      const cells = q("[data-contact-cell]");
      const cellLines = q("[data-contact-line]");
      const button = q('[data-contact-el="whatsapp"]');
      const links = q('[data-contact-el="secondary"]');
      const map = q('[data-contact-el="map"]');
      const mapInner = q('[data-contact-el="map-inner"]');
      gsap.set(cells, { opacity: 0, y: 18 * k });
      line(cellLines);
      gsap.set(button, { opacity: 0, y: 20 * k });
      gsap.set(links, { opacity: 0, y: 10 * k });
      gsap.set(map, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(mapInner, { scale: desktop ? 1.05 : 1.03 });

      const revealMap = (tl: gsap.core.Timeline, at: number) =>
        tl
          .to(map, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 * k, ease: "power3.out" }, at)
          .to(mapInner, { scale: 1, duration: 1.1 * k, ease: "power3.out" }, at);
      // Fim do mapa: sem transform nem clip-path (estático e interativo)
      const releaseMap = () => gsap.set([map, mapInner], REVEALED);

      if (desktop) {
        const band = gsap.timeline({
          scrollTrigger: {
            trigger: q('[data-contact-el="band"]')[0],
            start: "top 70%",
            once: true,
          },
          onComplete: () => {
            clearReveal([cells, cellLines, button, links])();
            releaseMap();
          },
        });
        band
          .to(cells, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 0)
          .to(cellLines, { scaleX: 1, duration: 0.65, stagger: 0.1, ease: "power2.out" }, 0)
          .to(button, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.35)
          .to(links, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 0.6);
        revealMap(band, 0.4);
        return;
      }

      // Mobile: a linha do topo da lista entra com o primeiro contato; cada contato sozinho
      const listLine = q('[data-contact-el="list-line"]');
      cells.forEach((cell, i) => {
        const cellLine = cell.querySelectorAll("[data-contact-line]");
        const lineTargets = i === 0 ? [...listLine, ...cellLine] : [...cellLine];
        gsap
          .timeline({
            scrollTrigger: { trigger: cell, start: "top 85%", once: true },
            onComplete: clearReveal([cell, lineTargets]),
          })
          .to(cell, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power3.out" }, 0)
          .to(lineTargets, { scaleX: 1, duration: 0.65 * k, ease: "power2.out" }, 0);
      });
      gsap
        .timeline({
          scrollTrigger: { trigger: button[0], start: "top 90%", once: true },
          onComplete: clearReveal([button, links]),
        })
        .to(button, { opacity: 1, y: 0, duration: 0.7 * k, ease: "power3.out" }, 0)
        .to(links, { opacity: 1, y: 0, duration: 0.5 * k, stagger: 0.1, ease: "power2.out" }, 0.2);
      const mapTl = gsap.timeline({
        scrollTrigger: { trigger: map[0], start: "top 85%", once: true },
        onComplete: releaseMap,
      });
      revealMap(mapTl, 0);
    },
    { scope: sectionRef },
  );

  const linhas = [
    {
      rotulo: "TELEFONE / WHATSAPP",
      valor: (
        <a href={telefone.href} className="focus-ring rounded-sm">
          {telefone.exibicao}
        </a>
      ),
    },
    {
      rotulo: "E-MAIL",
      valor: (
        <a href={email.href} className="focus-ring rounded-sm">
          {email.exibicao}
        </a>
      ),
    },
    { rotulo: "ENDEREÇO", valor: endereco.linha1, complemento: endereco.linha2 },
    { rotulo: "HORÁRIO DE ATENDIMENTO", valor: horario.linha1, complemento: horario.linha2 },
  ];

  return (
    <section
      ref={sectionRef}
      id="contato"
      aria-labelledby="contato-title"
      className="contact relative isolate overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-white absolute -top-20 -left-[100px] size-[520px] md:-left-[200px] md:h-[860px] md:w-[1100px]" />
        <div className="glow-sand-1 absolute top-[492px] -left-[60px] h-[460px] w-[520px] md:top-[407px] md:left-[calc(33.33%+60px)] md:h-[800px] md:w-[1000px]" />
      </div>

      {/* Cabeçalho */}
      <header
        className="flex flex-col gap-5 px-(--gutter) pt-[116px] pb-10 md:gap-0 md:pt-[max(clamp(88px,13vh,132px),calc(var(--nav-offset)+24px))] md:pb-[clamp(40px,7vh,72px)]"
        data-contact-el="header"
      >
        <p className="flex items-center gap-3 md:gap-4">
          <span
            className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-text md:text-[12px]"
            data-reveal
            data-contact-el="eyebrow-text"
          >
            {CONTATO_TEXTOS.eyebrow}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-12 bg-line md:w-20"
            data-reveal
            data-contact-el="eyebrow-line"
          />
        </p>
        <h2
          id="contato-title"
          aria-label={`${titulo.linha1} ${titulo.linha2} ${titulo.destaque}`}
          className="font-display text-[44px] leading-none font-medium tracking-[-0.02em] text-espresso md:mt-[clamp(12px,2vh,20px)] md:text-[length:clamp(2.75rem,min(7.2vw,11.5vh),6.25rem)]"
          data-contact-el="title"
        >
          <MaskedWords
            lines={[titulo.linha1, `${titulo.linha2} ${titulo.destaque}`]}
            accent={titulo.destaque}
            accentClassName="text-bronze-deep"
            lineBreaks="md"
          />
        </h2>
        <p
          className="text-[15px] leading-[1.55] text-taupe md:mt-[clamp(16px,2.5vh,28px)] md:max-w-[560px] md:text-[20px] md:leading-[1.5]"
          data-reveal
          data-contact-el="lead"
        >
          {CONTATO_TEXTOS.apoio}
        </p>
      </header>

      {/* Contatos + mapa — desktop: uma tela (.contact__band), conteúdo abaixo da navbar fixa */}
      <div
        className="contact__band bg-greige px-(--gutter) py-[clamp(40px,6vh,64px)] lg:flex lg:items-center lg:pt-[calc(var(--nav-offset)+clamp(8px,1.5vh,16px))] lg:pb-[clamp(20px,4vh,48px)]"
        data-contact-el="band"
      >
        {/* Figma 101:603: contatos e mapa em colunas iguais (640 + 64 + 640 em 1440) */}
        <div className="grid grid-cols-1 gap-9 lg:w-full lg:grid-cols-2 lg:gap-[clamp(32px,4.44vw,64px)]">
          {/* Desktop: grade 2×2 com hairline em cima de cada célula; o mapa estica até a altura da coluna */}
          <div className="lg:self-center" data-contact-el="info">
            {/* As linhas finas são elementos próprios sobre bordas transparentes de 1px:
                mesma aparência e mesmo layout, mas animáveis com scaleX */}
            <address className="relative not-italic">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-line lg:hidden"
                data-reveal
                data-contact-el="list-line"
              />
              <dl className="grid grid-cols-1 border-t border-transparent lg:grid-cols-2 lg:gap-x-8 lg:border-t-0">
                {linhas.map((linha) => (
                  <div
                    key={linha.rotulo}
                    className="relative flex min-w-0 flex-col gap-2 border-b border-transparent py-5 leading-[normal] md:py-7 lg:gap-2.5 lg:border-t lg:border-b-0 lg:py-12"
                    data-reveal
                    data-contact-cell
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-px bg-line lg:-top-px lg:bottom-auto"
                      data-contact-line
                    />
                    <dt className="text-[11px] font-medium tracking-[0.14em] text-bronze-text-greige">
                      {linha.rotulo}
                    </dt>
                    <dd className="contact__value text-[20px] text-espresso [overflow-wrap:anywhere] md:text-[26px] lg:text-[length:clamp(1rem,1.53vw,1.375rem)]">
                      {linha.valor}
                    </dd>
                    {linha.complemento && (
                      <dd className="text-[14px] text-taupe-text md:text-[16px] lg:text-[14px]">
                        {linha.complemento}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </address>

            <div className="flex flex-col gap-6 pt-7 md:pt-10 lg:gap-7 lg:pt-16">
              <a
                href={whatsapp}
                {...NOVA_ABA}
                aria-label="Chamar no WhatsApp (abre em nova aba)"
                className="group focus-ring flex w-full items-center justify-center rounded-full bg-bronze py-[22px] text-[12px] leading-[normal] font-medium tracking-[0.14em] text-ink transition-colors duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] hover:bg-[#b88b5c] motion-reduce:transition-none"
                data-reveal
                data-contact-el="whatsapp"
              >
                {/* Um só item flex: o espaço antes da seta não é descartado */}
                <span>
                  CHAMAR NO WHATSAPP{" "}
                  <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none">
                    ↗
                  </span>
                </span>
              </a>
              <p className="flex flex-wrap gap-x-8 gap-y-3 text-[14px] leading-[normal] font-medium text-espresso">
                <a
                  href={email.href}
                  aria-label={`Enviar e-mail para ${email.exibicao}`}
                  className="contact__link focus-ring rounded-sm underline decoration-1 underline-offset-[3px]"
                  data-reveal
                  data-contact-el="secondary"
                >
                  Enviar e-mail{" "}
                  <span className="link-line__arrow underline decoration-1 underline-offset-[3px]">
                    ↗
                  </span>
                </a>
                <a
                  href={endereco.comoChegar}
                  {...NOVA_ABA}
                  aria-label="Como chegar — abre o Google Maps em nova aba"
                  className="contact__link focus-ring rounded-sm underline decoration-1 underline-offset-[3px]"
                  data-reveal
                  data-contact-el="secondary"
                >
                  Como chegar{" "}
                  <span className="link-line__arrow underline decoration-1 underline-offset-[3px]">
                    ↗
                  </span>
                </a>
              </p>
            </div>
          </div>

          <div
            className="contact__map relative h-[340px] overflow-hidden border border-[rgb(26_18_10/0.16)] bg-[#f5f1ea] md:h-[440px] lg:h-auto lg:self-stretch"
            data-contact-el="map"
          >
            <div className="absolute inset-0" data-contact-el="map-inner">
              <iframe
                src={endereco.mapaEmbed}
                title="Mapa — GR Esquadrias"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 z-10" />
    </section>
  );
}
