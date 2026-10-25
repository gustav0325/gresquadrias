"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import type { Pergunta } from "@/data/faq";
import { prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

type FaqListProps = { perguntas: readonly Pergunta[] };

const semInscricao = () => () => {};
/** Espera depois da última animação antes de recalcular os gatilhos da página. */
const REFRESH_DELAY_MS = 150;

/** false no servidor e na hidratação, true depois: o HTML sem JS não recebe `inert`. */
const useHidratado = () =>
  useSyncExternalStore(
    semInscricao,
    () => true,
    () => false,
  );

/**
 * Perguntas frequentes em acordeão — Figma 101:234 / 101:862 ("–" aberta, "+" fechada).
 * Começa só com a primeira aberta; cada pergunta abre e fecha de forma independente.
 * A resposta abre na altura natural (grid-template-rows 0fr → 1fr, globals.css).
 * Sem JS (`html.js` ausente) todas as respostas ficam visíveis.
 *
 * Desempenho: nada roda por quadro durante a abertura (só a transição CSS). Os gatilhos da
 * página (Sobre, Contato, navbar) são recalculados UMA vez, 150 ms depois da última animação,
 * só se a altura da lista mudou; um novo clique cancela o recálculo pendente.
 */
export function FaqList({ perguntas }: FaqListProps) {
  const baseId = useId();
  const [abertas, setAbertas] = useState<ReadonlySet<number>>(() => new Set([0]));
  const hidratado = useHidratado();
  const listRef = useRef<HTMLDivElement>(null);
  const alturaRef = useRef(0);
  const refreshRef = useRef(0);

  useEffect(() => {
    alturaRef.current = listRef.current?.offsetHeight ?? 0;
    return () => window.clearTimeout(refreshRef.current);
  }, []);

  const agendarRefresh = () => {
    window.clearTimeout(refreshRef.current);
    refreshRef.current = window.setTimeout(() => {
      const altura = listRef.current?.offsetHeight ?? 0;
      if (altura === alturaRef.current) return;
      alturaRef.current = altura;
      ScrollTrigger.refresh();
    }, REFRESH_DELAY_MS);
  };

  const alternar = (i: number) => {
    // Novo clique: o recálculo pendente espera esta animação terminar
    window.clearTimeout(refreshRef.current);
    setAbertas((atual) => {
      const proximas = new Set(atual);
      if (!proximas.delete(i)) proximas.add(i);
      return proximas;
    });
    // Sem transição (reduced-motion) não há transitionend
    if (prefersReducedMotion()) agendarRefresh();
  };

  return (
    <div ref={listRef} data-faq-list>
      <div aria-hidden="true" className="h-px bg-line" data-faq-line />
      {perguntas.map(({ pergunta, resposta }, i) => {
        const aberta = abertas.has(i);
        const botaoId = `${baseId}-pergunta-${i}`;
        const painelId = `${baseId}-resposta-${i}`;
        return (
          <div key={pergunta}>
            <div className="py-5 md:py-7" data-faq-item>
              <h3>
                <button
                  type="button"
                  id={botaoId}
                  aria-expanded={aberta}
                  aria-controls={painelId}
                  onClick={() => alternar(i)}
                  className="focus-ring flex w-full cursor-pointer items-center justify-between rounded-sm text-left leading-[normal] md:gap-4"
                >
                  <span className="text-[16px] text-espresso md:text-[20px]">{pergunta}</span>
                  {/* Só o sinal visível ocupa espaço (largura como no Figma); ele entra com fade */}
                  <span
                    aria-hidden="true"
                    className="faq__icon shrink-0 text-[24px] text-bronze-deep md:text-[28px]"
                  >
                    <span className="faq__icon-open">–</span>
                    <span className="faq__icon-closed">+</span>
                  </span>
                </button>
              </h3>
              <div
                id={painelId}
                role="region"
                aria-labelledby={botaoId}
                inert={hidratado && !aberta}
                className="faq__panel"
                data-open={aberta}
                onTransitionEnd={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    event.propertyName === "grid-template-rows"
                  ) {
                    agendarRefresh();
                  }
                }}
              >
                <div className="overflow-hidden">
                  <p className="mt-2.5 max-w-[720px] text-[15px] leading-[1.6] text-taupe md:mt-3 md:text-[16px]">
                    {resposta}
                  </p>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="h-px bg-line" data-faq-line />
          </div>
        );
      })}
    </div>
  );
}
