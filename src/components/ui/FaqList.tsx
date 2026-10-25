"use client";

import { useId, useState, useSyncExternalStore } from "react";

import type { Pergunta } from "@/data/faq";
import { prefersReducedMotion } from "@/lib/gsap";
import { scheduleRefresh } from "@/lib/reveal";

type FaqListProps = { perguntas: readonly Pergunta[] };

const semInscricao = () => () => {};
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
 */
export function FaqList({ perguntas }: FaqListProps) {
  const baseId = useId();
  const [abertas, setAbertas] = useState<ReadonlySet<number>>(() => new Set([0]));
  const hidratado = useHidratado();

  const alternar = (i: number) => {
    setAbertas((atual) => {
      const proximas = new Set(atual);
      if (!proximas.delete(i)) proximas.add(i);
      return proximas;
    });
    // Sem transição (reduced-motion) não há transitionend: recalcula logo
    if (prefersReducedMotion()) scheduleRefresh(0);
  };

  return (
    <div data-faq-list>
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
                  if (event.propertyName === "grid-template-rows") scheduleRefresh(0);
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
