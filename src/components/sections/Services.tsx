"use client";

import { useRef } from "react";

import { FaqList } from "@/components/ui/FaqList";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { NumberLabel } from "@/components/ui/NumberLabel";
import { ServiceRow } from "@/components/ui/ServiceRow";
import { FAQ } from "@/data/faq";
import { ETAPAS, SERVICOS } from "@/data/servicos";
import { entrancesEnabled, gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { clearReveal, WORD_HIDDEN_Y, wordLines } from "@/lib/reveal";
import { WHATSAPP_URL } from "@/lib/whatsapp";

/** Sobra da camada do parallax (cada lado, % da moldura) — só enquanto o parallax está ativo. */
const PARALLAX_BLEED = "-5%";
/** Deslocamento do parallax (% da camada, que tem 110% da moldura): ±21px numa foto de 480px. */
const PARALLAX_PERCENT = 4;
/** "Como trabalhamos" no desktop: duração de cada parte de uma etapa (fração do scroll ~1). */
const STEP_DURATION = 0.12;

/**
 * Seção Serviços da Home — Figma "3 · Serviços":
 * desktop 101:234 e mobile 101:862.
 * Inclui as linhas de serviço, "Como trabalhamos" e "Perguntas frequentes".
 *
 * Animações (uma vez, ao entrar na tela): cabeçalho; em cada serviço, o texto em sequência e a
 * foto (máscara + zoom-out); "Como trabalhamos"; FAQ. Parallax das fotos só no desktop.
 * Estados iniciais só sob `html.js-ready`.
 */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current!;
      const q = gsap.utils.selector(section);

      // Entradas só com movimento permitido e com o estado de espera ativo (html.js-ready)
      const revealOn = entrancesEnabled();
      if (revealOn) {
        // Mobile: entradas mais curtas e zoom menor
        const desktop = window.matchMedia(MOTION_QUERIES.desktop).matches;
        const k = desktop ? 1 : 0.75;
        const once = (trigger: Element | undefined, start: string, targets: gsap.TweenTarget[]) =>
          gsap.timeline({
            scrollTrigger: { trigger, start, once: true },
            onComplete: clearReveal(targets),
          });
        const hideLines = (lines: Element[]) =>
          gsap.set(lines, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
        // Leituras de layout antes de qualquer escrita: as linhas reais de todos os títulos
        // são medidas de uma vez (medir depois de cada gsap.set forçaria um layout por título)
        const titleLines = new Map<Element, HTMLElement[][]>(
          q('[data-masked-title], [data-service-el="title"]').map((t) => [t, wordLines(t)] as const),
        );
        const hideWords = (title: Element | undefined) => {
          const lines = (title && titleLines.get(title)) || wordLines(title);
          gsap.set(lines.flat(), { opacity: 1, yPercent: WORD_HIDDEN_Y });
          return lines;
        };
        const revealWords = (
          tl: gsap.core.Timeline,
          lines: HTMLElement[][],
          at: number,
          duration: number,
          stagger: number,
        ) =>
          lines.forEach((words, i) =>
            tl.to(
              words,
              { yPercent: 0, duration: duration * k, ease: "power3.out" },
              at + i * stagger,
            ),
          );

        // Eyebrow + título com máscara + texto (cabeçalho e FAQ seguem o mesmo desenho)
        const editorialHeader = (root: Element | undefined, start: string) => {
          if (!root) return;
          const text = root.querySelectorAll("[data-eyebrow-text]");
          const rule = [...root.querySelectorAll("[data-eyebrow-line]")];
          const lines = hideWords(root.querySelector("[data-masked-title]") ?? undefined);
          const lead = root.querySelectorAll("[data-lead]");
          gsap.set(text, { opacity: 0, y: 16 * k });
          const tl = once(root, start, [text, rule, lines.flat(), lead]);
          tl.to(text, { opacity: 1, y: 0, duration: 0.6 * k, ease: "power2.out" }, 0);
          revealWords(tl, lines, 0.1, 0.9, 0.14);
          // Linha do eyebrow e texto de apoio só existem no cabeçalho da seção (não no FAQ)
          if (rule.length) {
            hideLines(rule);
            tl.to(rule, { scaleX: 1, duration: 0.6 * k, ease: "power3.out" }, 0.05);
          }
          if (lead.length) {
            gsap.set(lead, { opacity: 0, y: 20 * k });
            tl.to(lead, { opacity: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0.35);
          }
          return tl;
        };

        editorialHeader(q('[data-services-el="header"]')[0], "top 80%");

        // Serviços: texto em sequência (número → título → descrição → aplicações → link)
        q("[data-service-row]").forEach((row) => {
          const text = row.querySelector('[data-service-el="text"]') ?? undefined;
          const number = row.querySelectorAll("[data-number]");
          const numberLine = [...row.querySelectorAll("[data-number-line]")];
          const lines = hideWords(row.querySelector('[data-service-el="title"]') ?? undefined);
          const description = row.querySelectorAll('[data-service-el="description"]');
          const label = row.querySelectorAll('[data-service-el="label"]');
          const pills = row.querySelectorAll('[data-service-el="pill"]');
          const link = row.querySelectorAll('[data-service-el="link"]');
          gsap.set(number, { opacity: 0, y: 18 * k });
          hideLines(numberLine);
          gsap.set(description, { opacity: 0, y: 20 * k });
          gsap.set(label, { opacity: 0 });
          gsap.set(pills, { opacity: 0, y: 10 * k });
          gsap.set(link, { opacity: 0, y: 12 * k });

          const titleEnd = 0.12 + (lines.length - 1) * 0.12 + 0.85 * k;
          const descriptionAt = titleEnd - 0.3;
          const pillsAt = descriptionAt + 0.3;
          const tl = once(text, "top 75%", [
            number,
            numberLine,
            lines.flat(),
            description,
            label,
            pills,
            link,
          ]);
          tl.to(number, { opacity: 1, y: 0, duration: 0.5 * k, ease: "power2.out" }, 0).to(
            numberLine,
            { scaleX: 1, duration: 0.6 * k, ease: "power3.out" },
            0.05,
          );
          revealWords(tl, lines, 0.12, 0.85, 0.12);
          tl.to(
            description,
            { opacity: 1, y: 0, duration: 0.65 * k, ease: "power2.out" },
            descriptionAt,
          )
            .to(label, { opacity: 1, duration: 0.5 * k, ease: "power2.out" }, pillsAt - 0.1)
            .to(
              pills,
              { opacity: 1, y: 0, duration: 0.5 * k, stagger: 0.08, ease: "power2.out" },
              pillsAt,
            )
            .to(
              link,
              { opacity: 1, y: 0, duration: 0.5 * k, ease: "power2.out" },
              pillsAt + pills.length * 0.08 + 0.1,
            );

          // Foto: moldura abre de baixo para cima e a foto assenta (1.05 → 1)
          const frame = row.querySelector('[data-service-el="photo"]') ?? undefined;
          const reveal = row.querySelector('[data-service-el="reveal"]');
          gsap.set(frame ?? [], { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(reveal, { scale: desktop ? 1.05 : 1.03 });
          once(frame, "top 85%", [frame ?? [], reveal])
            .to(
              frame ?? [],
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1 * k, ease: "power3.out" },
              0,
            )
            .to(reveal, { scale: 1, duration: 1.1 * k, ease: "power3.out" }, 0);
        });

        // Como trabalhamos: eyebrow e título (disparo único); as etapas ficam com o scroll (abaixo)
        const process = q('[data-services-el="process"]')[0];
        if (process) {
          const eyebrow = process.querySelectorAll("[data-eyebrow-text]");
          const lines = hideWords(process.querySelector("[data-masked-title]") ?? undefined);
          gsap.set(eyebrow, { opacity: 0 });
          const tl = once(process, "top 75%", [eyebrow, lines.flat()]);
          tl.to(eyebrow, { opacity: 1, duration: 0.6 * k, ease: "power2.out" }, 0);
          revealWords(tl, lines, 0.1, 0.85, 0.14);
        }

        // FAQ: cabeçalho como o da seção, linhas e perguntas em sequência, rodapé por último
        const faq = q('[data-services-el="faq"]')[0];
        const faqHeader = editorialHeader(faq, "top 80%");
        if (faq && faqHeader) {
          const rules = [...faq.querySelectorAll("[data-faq-line]")];
          const items = faq.querySelectorAll("[data-faq-item]");
          const footer = faq.querySelectorAll("[data-faq-footer]");
          hideLines(rules);
          gsap.set(items, { opacity: 0, y: 12 * k });
          gsap.set(footer, { opacity: 0 });
          faqHeader
            .to(rules, { scaleX: 1, duration: 0.6 * k, stagger: 0.08, ease: "power3.out" }, 0.3)
            .to(
              items,
              { opacity: 1, y: 0, duration: 0.6 * k, stagger: 0.08, ease: "power2.out" },
              0.35,
            )
            .to(
              footer,
              { opacity: 1, duration: 0.6 * k, ease: "power2.out" },
              0.35 + items.length * 0.08 + 0.2,
            )
            .eventCallback(
              "onComplete",
              clearReveal([
                ...faq.querySelectorAll("[data-eyebrow-text], [data-word]"),
                rules,
                items,
                footer,
              ]),
            );
        }
      }

      // Parallax das fotos (desktop): a camada ganha 5% de sobra em cima e embaixo só aqui
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.desktop, () => {
        q('[data-service-el="parallax"]').forEach((layer) => {
          gsap.set(layer, { top: PARALLAX_BLEED, bottom: PARALLAX_BLEED });
          gsap.fromTo(
            layer,
            { yPercent: -PARALLAX_PERCENT },
            {
              yPercent: PARALLAX_PERCENT,
              ease: "none",
              scrollTrigger: {
                trigger: layer.closest('[data-service-el="photo"]'),
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });
      });

      // Como trabalhamos — etapas. Desktop: "carregam" da esquerda para a direita presas ao
      // scroll (preenchimento bronze + cada etapa quando o preenchimento chega à sua coluna).
      // Mobile (empilhadas): cada etapa entra sozinha, sem movimento horizontal.
      if (revealOn) {
        const steps = q("[data-step]");
        const fill = q("[data-process-fill]");
        const parts = (step: Element) => ({
          number: step.querySelectorAll("[data-number]"),
          line: step.querySelectorAll("[data-number-line]"),
          title: step.querySelectorAll("[data-step-title]"),
          text: step.querySelectorAll("[data-step-text]"),
        });

        mm.add(MOTION_QUERIES.desktop, () => {
          const list = q("[data-steps]")[0];
          const listBox = list.getBoundingClientRect();
          // Posição horizontal de cada coluna (0, ~26%, ~52%, ~78% da largura), medida antes
          // de qualquer escrita
          const columns = steps.map(
            (step) => (step.getBoundingClientRect().left - listBox.left) / listBox.width,
          );
          gsap.set(fill, { scaleX: 0, transformOrigin: "0% 50%" });
          const tl = gsap.timeline({
            defaults: { ease: "none", duration: STEP_DURATION },
            scrollTrigger: {
              trigger: list,
              start: "top 80%",
              end: "top 35%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
          steps.forEach((step, i) => {
            const { number, line, title, text } = parts(step);
            gsap.set([number, line, title, text], { opacity: 0, x: -16 });
            gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
            const at = columns[i];
            tl.to([number, line], { opacity: 1, x: 0 }, at)
              .to(line, { scaleX: 1 }, at)
              .to(title, { opacity: 1, x: 0 }, at + 0.03)
              .to(text, { opacity: 1, x: 0 }, at + 0.13);
          });
          // O preenchimento acompanha a timeline inteira: chega ao fim junto com a etapa 04
          tl.to(fill, { scaleX: 1, duration: tl.duration() }, 0);
        });

        mm.add(MOTION_QUERIES.mobile, () => {
          gsap.set(fill, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.to(fill, {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: fill[0], start: "top 85%", once: true },
          });
          steps.forEach((step) => {
            const { number, line, title, text } = parts(step);
            gsap.set([number, title, text], { opacity: 0, y: 12 });
            gsap.set(line, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" });
            gsap
              .timeline({
                scrollTrigger: { trigger: step, start: "top 85%", once: true },
                onComplete: clearReveal([number, line, title, text]),
              })
              .to(
                [number, title, text],
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" },
                0,
              )
              .to(line, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 0.05);
          });
        });
      }

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="servicos"
      aria-labelledby="servicos-title"
      className="services relative isolate overflow-hidden"
    >
      {/* Brilhos atrás de tudo: as faixas greige os cobrem, como no Figma */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-white absolute -top-20 -left-[100px] size-[520px] md:-left-[200px] md:h-[860px] md:w-[1100px]" />
        <div className="glow-sand-1 absolute top-[2047px] -left-[60px] h-[460px] w-[520px] md:top-[1466px] md:left-[calc(33.33%+60px)] md:h-[800px] md:w-[1000px]" />
        <div className="glow-sand-2 absolute top-[3627px] -left-[100px] h-[460px] w-[520px] md:top-[3246px] md:-left-[250px] md:h-[800px] md:w-[1000px]" />
      </div>

      {/* Cabeçalho */}
      <header
        className="px-(--gutter) pt-[116px] pb-14 md:pt-[max(clamp(88px,13vh,132px),calc(var(--nav-offset)+24px))] md:pb-24"
        data-services-el="header"
      >
        <p className="flex items-center gap-3 md:gap-4" data-services-el="eyebrow">
          <span
            className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-deep md:text-[12px]"
            data-reveal
            data-eyebrow-text
          >
            SERVIÇOS
          </span>
          <span
            aria-hidden="true"
            className="h-px w-12 bg-line md:w-20"
            data-reveal
            data-eyebrow-line
          />
        </p>
        <h2
          id="servicos-title"
          aria-label="O que fazemos."
          className="mt-5 font-display text-[length:clamp(64px,8.33vw,120px)] leading-none font-medium tracking-[-0.02em] text-espresso md:mt-[clamp(12px,2vh,20px)] md:text-[length:clamp(2.5rem,min(5.5vw,9.5vh),4.5rem)]"
          data-masked-title
        >
          <MaskedWords lines={["O que", "fazemos."]} lineBreaks="mobile" />
        </h2>
        <p
          className="mt-5 text-[15px] leading-[1.55] text-taupe md:mt-[clamp(16px,2.5vh,28px)] md:max-w-[560px] md:text-[20px] md:leading-[1.5]"
          data-reveal
          data-lead
        >
          Soluções sob medida em alumínio e vidro, integrando funcionalidade, estética e
          arquitetura.
        </p>
      </header>

      {SERVICOS.map((servico, i) => (
        <ServiceRow key={servico.numero} servico={servico} index={i} />
      ))}

      {/* Como trabalhamos */}
      <section
        aria-labelledby="processo-title"
        className="flex flex-col gap-8 px-(--gutter) py-[72px] md:gap-14 md:py-[120px]"
        data-services-el="process"
      >
        <div className="flex flex-col gap-8 md:gap-5">
          <p
            className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-deep md:text-[12px]"
            data-reveal
            data-eyebrow-text
          >
            NOSSO PROCESSO
          </p>
          <h2
            id="processo-title"
            aria-label="Como trabalhamos."
            className="font-display text-[length:clamp(48px,5.56vw,80px)] leading-none font-medium tracking-[-0.02em] text-espresso"
            data-masked-title
          >
            <MaskedWords lines={["Como", "trabalhamos."]} lineBreaks="mobile" />
          </h2>
        </div>

        {/* Trilho (linha do Figma) + preenchimento bronze de 1px por cima, animado com scaleX */}
        <div aria-hidden="true" className="relative h-px bg-line">
          <span className="process__fill absolute inset-0 bg-bronze" data-process-fill />
        </div>

        <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4" data-steps>
          {ETAPAS.map((etapa) => (
            <li key={etapa.numero} className="flex flex-col items-start gap-2.5 md:gap-4" data-step>
              <NumberLabel numero={etapa.numero} lineClassName="w-12 md:w-[60px]" />
              <h3
                className="text-[18px] leading-[normal] font-medium text-espresso md:text-[20px]"
                data-reveal
                data-step-title
              >
                {etapa.titulo}
              </h3>
              <p
                className="text-[15px] leading-[1.55] text-taupe md:max-w-[260px] md:text-[16px]"
                data-reveal
                data-step-text
              >
                {etapa.descricao}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Perguntas frequentes */}
      <section
        aria-labelledby="faq-title"
        className="flex flex-col gap-8 bg-greige px-(--gutter) py-[72px] md:gap-12 md:py-[120px]"
        data-services-el="faq"
      >
        <div className="flex flex-col gap-8 md:h-[126px] md:gap-5">
          <p
            className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-bronze-deep md:text-[12px]"
            data-reveal
            data-eyebrow-text
          >
            DÚVIDAS FREQUENTES
          </p>
          <h2
            id="faq-title"
            aria-label="Perguntas frequentes."
            className="font-display text-[length:clamp(48px,5.56vw,80px)] leading-none font-medium tracking-[-0.02em] text-espresso"
            data-masked-title
          >
            <MaskedWords lines={["Perguntas", "frequentes."]} lineBreaks="mobile" />
          </h2>
        </div>

        <FaqList perguntas={FAQ} />

        <p
          className="flex flex-col items-start gap-2 text-[14px] leading-[1.21] md:flex-row md:items-center md:gap-5 md:text-[16px]"
          data-reveal
          data-faq-footer
        >
          <span className="text-taupe">Não encontrou sua dúvida?</span>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm font-medium text-bronze-deep"
          >
            Falar no WhatsApp ↗
          </a>
        </p>
      </section>

      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 z-10" />
    </section>
  );
}
