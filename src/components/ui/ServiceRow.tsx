import Image from "next/image";
import Link from "next/link";

import { MaskedWords } from "@/components/ui/MaskedWords";
import { NumberLabel } from "@/components/ui/NumberLabel";
import type { Servico } from "@/data/servicos";

type ServiceRowProps = {
  servico: Servico;
  /** Linhas pares (01, 03): fundo greige e foto à direita no desktop. */
  index: number;
  onImageLoad?: () => void;
};

/**
 * Linha de serviço — Figma 101:296 (desktop) e 101:917 (mobile).
 *
 * Foto em camadas, cada uma com um único transform animado:
 * moldura (clip-path da revelação) › reveal (scale) › parallax (y) › <img> (scale do hover).
 * A camada do parallax só ganha sobra de altura enquanto o parallax está ativo (Services.tsx).
 */
export function ServiceRow({ servico, index, onImageLoad }: ServiceRowProps) {
  const destaque = index % 2 === 0;
  const titulo = servico.titulo.join(" ");

  return (
    <article
      aria-labelledby={`servico-${servico.numero}`}
      className={`flex flex-col gap-7 px-(--gutter) py-12 lg:flex-row lg:items-center lg:gap-[clamp(48px,8.33vw,120px)] lg:py-20 ${destaque ? "bg-greige" : ""}`}
      data-service-row
    >
      <div
        className={`service-row__photo relative aspect-[4/3] w-full shrink-0 overflow-hidden lg:w-[47.62%] ${destaque ? "lg:order-last" : ""}`}
        data-service-el="photo"
      >
        <div className="absolute inset-0" data-service-el="reveal">
          <div className="absolute inset-0" data-service-el="parallax">
            <Image
              src={servico.imagem.src}
              alt={servico.imagem.alt}
              fill
              quality={85}
              sizes="(min-width: 1024px) 46vw, calc(100vw - 40px)"
              className="service-row__img object-cover"
              onLoad={onImageLoad}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-7 lg:flex-1" data-service-el="text">
        <NumberLabel numero={servico.numero} lineClassName="w-12 md:w-20" />

        <h3
          id={`servico-${servico.numero}`}
          aria-label={titulo}
          className="font-display text-[length:clamp(44px,4.44vw,64px)] leading-none font-medium tracking-[-0.02em] text-espresso"
          data-service-el="title"
        >
          <MaskedWords lines={servico.titulo} />
        </h3>

        <p
          className="text-[15px] leading-[1.6] text-taupe md:max-w-[520px] md:text-[17px]"
          data-reveal
          data-service-el="description"
        >
          {servico.descricao}
        </p>

        <p
          className="text-[11px] leading-[normal] font-medium tracking-[0.14em] text-taupe"
          data-reveal
          data-service-el="label"
        >
          APLICAÇÕES
        </p>

        <ul className="flex flex-wrap gap-2 md:gap-2.5" aria-label="Aplicações">
          {servico.aplicacoes.map((aplicacao) => (
            <li
              key={aplicacao}
              className="rounded-full border border-[rgb(26_18_10/0.16)] px-3.5 py-2 text-[13px] leading-[normal] text-espresso md:px-4 md:py-[9px]"
              data-reveal
              data-service-el="pill"
            >
              {aplicacao}
            </li>
          ))}
        </ul>

        <Link
          href={servico.orcamento.href}
          className="link-line focus-ring rounded-sm text-[14px] leading-[1.21] font-medium text-espresso [--link-line:var(--color-bronze-deep)]"
          data-reveal
          data-service-el="link"
        >
          {servico.orcamento.label} <span className="link-line__arrow">↗</span>
        </Link>
      </div>
    </article>
  );
}
