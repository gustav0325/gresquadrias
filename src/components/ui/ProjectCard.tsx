import Image from "next/image";

import { type Projeto, projetoAlt } from "@/data/projetos";

type ProjectCardProps = {
  projeto: Projeto;
  /** Card da coluna deslocada no desktop. */
  offset?: boolean;
};

/**
 * Card de obra — Figma 101:156 (desktop) e 101:803 (mobile).
 *
 * Foto em camadas, cada uma com um único transform animado:
 * moldura (clip-path da revelação) › reveal (scale) › parallax (y) › <img> (scale do hover).
 * O parallax tem 112,5% da altura da moldura: a foto 4:3 preenche essa caixa exatamente,
 * então o enquadramento é o mesmo da moldura 3:2 e sobram 6,25% de cada lado para o deslocamento.
 *
 * As setas do Figma (←/→) não têm ação no protótipo e cada obra tem uma foto: não são exibidas.
 */
export function ProjectCard({ projeto, offset = false }: ProjectCardProps) {
  return (
    <article
      className="project-card relative flex flex-col gap-4 md:gap-5"
      data-project-card
      data-offset={offset || undefined}
    >
      <div className="project-card__frame relative aspect-[3/2] overflow-hidden" data-card-el="frame">
        <div className="absolute inset-0" data-card-el="reveal">
          <div className="absolute inset-x-0 -top-[6.25%] -bottom-[6.25%]" data-card-el="parallax">
            <Image
              src={projeto.fotos[0]}
              alt={projetoAlt(projeto)}
              fill
              quality={80}
              loading="lazy"
              sizes="(min-width: 768px) 46vw, calc(100vw - 40px)"
              className="project-card__img object-cover"
            />
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-4 leading-[normal] md:gap-y-2"
        data-card-el="caption"
      >
        <p className="col-span-2 flex flex-wrap items-center gap-x-2 text-[15px] md:col-span-1 md:gap-x-2.5 md:text-[16px]">
          <span className="text-espresso" data-card-reveal>
            {projeto.id}. {projeto.titulo}
          </span>
          <span className="flex items-center gap-x-2 md:gap-x-2.5" data-card-reveal>
            <Image
              src="/icons/ponto.svg"
              alt=""
              width={5}
              height={5}
              className="size-[5px] md:size-1.5"
            />
            <span className="text-taupe">{projeto.categoria}</span>
          </span>
        </p>

        <p className="col-start-1 row-start-2 text-[13px] text-taupe md:text-[14px]" data-card-reveal>
          {projeto.local} | {projeto.data}
        </p>

        {/* Sem destino até a página /projetos/[slug] existir (evita 404); visual e hover mantidos */}
        <a
          role="link"
          aria-disabled="true"
          aria-label={`Ver projeto ${projeto.id} — ${projeto.titulo} (página em breve)`}
          className="link-line col-start-2 row-start-2 justify-self-end text-[13px] leading-[1.21] font-medium text-bronze-deep md:col-start-1 md:row-start-3 md:justify-self-start md:text-[14px]"
          data-card-reveal
        >
          Ver projeto <span className="link-line__arrow">↗</span>
        </a>
      </div>
    </article>
  );
}
