import Image from "next/image";

import { type Obra, temParallax } from "@/data/obras";
import { scheduleRefresh } from "@/lib/reveal";

type WorkCardProps = {
  obra: Obra;
  /** Foto acima da dobra: pré-carregada em vez de lazy. */
  preload?: boolean;
  onOpen: (obra: Obra, opener: HTMLButtonElement) => void;
};

/**
 * Item da grade de /obras — Figma "Obra · …" (ex.: 123:28 vídeo, 124:13 foto).
 *
 * A mídia é um botão que abre a galeria. Camadas, cada uma com um único transform animado:
 * moldura (clip-path da revelação) › reveal (scale) › parallax (y) › <img>/<video> (scale do hover).
 * A moldura tem a proporção do Figma (sem layout shift); com parallax a camada interna tem 110%
 * da altura dela (5% de folga de cada lado), então nunca aparece área vazia.
 * Vídeos: `preload="none"` e capa sempre visível; o play/pause é do useVideoAutoplay.
 */
export function WorkCard({ obra, preload = false, onOpen }: WorkCardProps) {
  const { nome, categoria, video } = obra;
  // O nome acessível contém o texto visível do selo ("vídeo · 0:11")
  const label = video ? `Ampliar ${nome} (vídeo · ${video.duracao})` : `Ampliar foto: ${nome}`;

  return (
    <figure className="flex flex-col gap-4 md:gap-5" data-work-card>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(obra, event.currentTarget)}
        className="work-card__frame focus-ring relative block w-full cursor-zoom-in overflow-hidden bg-greige"
        style={{ aspectRatio: `${obra.largura} / ${obra.altura}` }}
        data-work-el="frame"
      >
        <span className="absolute inset-0" data-work-el="reveal">
          <span
            className={`absolute inset-x-0 ${temParallax(obra) ? "-top-[5%] -bottom-[5%]" : "inset-y-0"}`}
            data-work-el={temParallax(obra) ? "parallax" : undefined}
          >
            {video ? (
              <video
                muted
                loop
                playsInline
                preload="none"
                poster={obra.src}
                aria-label={nome}
                className="work-card__media absolute inset-0 size-full object-cover"
                data-autoplay
              >
                {video.webm && <source src={video.webm} type="video/webm" />}
                <source src={video.mp4} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={obra.src}
                alt={nome}
                fill
                quality={80}
                preload={preload}
                loading={preload ? undefined : "lazy"}
                sizes="(min-width: 768px) 46vw, calc(100vw - 40px)"
                onLoad={() => scheduleRefresh()}
                className="work-card__media object-cover"
              />
            )}
          </span>
        </span>

        {video && (
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink-warm/60 px-3.5 py-2 text-[11px] leading-[normal] font-medium tracking-[0.12em] text-paper md:bottom-5 md:left-5"
            data-reveal
            data-work-el="badge"
          >
            {/* ▶ desenhado: o caractere cai em fonte de emoji em alguns aparelhos */}
            <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor" className="shrink-0">
              <path d="M0 0.6v6.8a.5.5 0 0 0 .76.43l5.66-3.4a.5.5 0 0 0 0-.86L.76.17A.5.5 0 0 0 0 .6Z" />
            </svg>
            VÍDEO · {video.duracao}
          </span>
        )}
      </button>

      <figcaption
        className="flex flex-wrap items-center gap-x-2 text-[15px] leading-[normal] md:gap-x-2.5 md:text-[16px]"
        data-reveal
        data-work-el="caption"
      >
        <span className="text-espresso">{nome}</span>
        <Image
          src="/icons/ponto.svg"
          alt=""
          width={5}
          height={5}
          className="size-[5px] md:size-1.5"
        />
        <span className="text-taupe">{categoria}</span>
      </figcaption>
    </figure>
  );
}
