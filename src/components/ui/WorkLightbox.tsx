"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import type { Obra } from "@/data/obras";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { lockPage } from "@/lib/page-lock";

type WorkLightboxProps = {
  /** Na ordem de leitura (1 a 15). */
  obras: readonly Obra[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Chamado depois da saída: o pai desmonta a galeria. */
  onClose: () => void;
  /** Botão da grade que abriu a galeria: recebe o foco de volta ao fechar. */
  opener: HTMLElement | null;
};

/** Distância mínima (px) de um swipe lateral. */
const SWIPE_PX = 50;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Galeria em tela cheia de /obras (o Figma não tem esse estado).
 * Fundo #0c0a09 a 96%; foto inteira (contain) ou vídeo com controles; legenda, contador
 * "03 / 15", anterior/próxima em ciclo. Esc fecha, ←/→ navegam, Tab fica preso aqui dentro,
 * swipe lateral no toque. A página fica travada (lockPage: rolagem nativa, Lenis e `inert`);
 * por isso é renderizada fora do <main> (portal no <body>).
 */
export function WorkLightbox({ obras, index, onIndexChange, onClose, opener }: WorkLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const obra = obras[index];

  const go = useCallback(
    (step: number) => onIndexChange((index + step + obras.length) % obras.length),
    [index, obras.length, onIndexChange],
  );

  // Saída: fundo some (0,25 s) e só então o pai desmonta a galeria
  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (closing.current || !dialog) return;
    closing.current = true;
    if (prefersReducedMotion()) onClose();
    else gsap.to(dialog, { opacity: 0, duration: 0.25, ease: "power2.out", onComplete: onClose });
  }, [onClose]);

  // Abertura: fundo aparece (0,3 s)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(dialogRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    },
    { scope: dialogRef },
  );

  // Cada mídia (ao abrir e ao navegar): 0,98 → 1
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        mediaRef.current,
        { scale: 0.98, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out", clearProps: "transform,opacity" },
      );
    },
    { scope: dialogRef, dependencies: [index] },
  );

  // Página travada enquanto aberta; ao fechar, o foco volta ao item de origem
  useEffect(() => {
    const dialog = dialogRef.current;
    lockPage(true);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      gsap.killTweensOf(dialog);
      lockPage(false);
      opener?.focus({ preventScroll: true });
    };
  }, [opener]);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      // No vídeo com foco, as setas avançam/voltam o próprio vídeo
      const onVideo = event.target instanceof HTMLVideoElement;
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !onVideo) {
        event.preventDefault();
        go(event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>("button, video[controls]"),
      ).filter((el) => el.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !dialog.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, requestClose]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const navButton =
    "focus-ring flex size-11 items-center justify-center rounded-full border border-white/22 text-[18px] transition-colors duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none lg:size-12";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de obras"
      className="work-lightbox fixed inset-0 z-60 flex flex-col bg-ink-warm/96 text-paper"
    >
      <div className="flex items-center justify-between px-(--gutter) pt-4 lg:pt-6">
        <p className="text-[12px] leading-none font-medium tracking-[0.14em] tabular-nums">
          {pad(index + 1)} / {pad(obras.length)}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          aria-label="Fechar galeria"
          className={`work-lightbox__button ${navButton}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Toque no fundo (fora da mídia) também fecha */}
      <div
        className="relative min-h-0 flex-1 px-(--gutter) py-4 lg:py-6"
        onClick={(event) => event.target === event.currentTarget && requestClose()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={mediaRef}
          className="pointer-events-none relative flex size-full items-center justify-center"
        >
          {obra.video ? (
            // Tamanho natural como limite: o vídeo (~480p) nunca é esticado além dele
            <video
              key={obra.id}
              controls
              autoPlay
              muted
              playsInline
              poster={obra.src}
              aria-label={obra.nome}
              className="pointer-events-auto max-h-full max-w-full bg-black"
            >
              {obra.video.webm && <source src={obra.video.webm} type="video/webm" />}
              <source src={obra.video.mp4} type="video/mp4" />
            </video>
          ) : (
            <Image
              key={obra.id}
              src={obra.src}
              alt={obra.nome}
              fill
              quality={80}
              sizes="100vw"
              className="object-contain"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-(--gutter) pb-5 lg:pb-8">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 text-[14px] leading-[normal] md:gap-x-2.5 md:text-[16px]" aria-live="polite">
          <span>{obra.nome}</span>
          <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-bronze md:size-1.5" />
          <span className="text-[#a8a196]">{obra.categoria}</span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Obra anterior"
            className={`work-lightbox__button ${navButton}`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próxima obra"
            className={`work-lightbox__button ${navButton}`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
