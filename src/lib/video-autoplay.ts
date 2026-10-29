import { type RefObject, useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/gsap";

/** No máximo dois vídeos tocando ao mesmo tempo. */
const MAX_PLAYING = 2;

type NetworkInformation = { saveData?: boolean };

/** Sem autoplay com reduced-motion ou economia de dados: fica só a capa. */
const autoplayAllowed = () =>
  !prefersReducedMotion() &&
  !(navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData;

/**
 * Vídeos da grade (`video[data-autoplay]` dentro de `root`), todos com `preload="none"`:
 * - a ~1 tela de distância passam a `preload="metadata"`;
 * - com ≥ 50% visível tocam (mudos, em loop); fora da tela pausam;
 * - no máximo MAX_PLAYING ao mesmo tempo: quem já toca continua, o próximo espera a vez.
 * `paused` (ex.: galeria aberta) pausa todos; ao voltar, os visíveis retomam.
 */
export function useVideoAutoplay(root: RefObject<HTMLElement | null>, paused: boolean) {
  const sync = useRef<(paused: boolean) => void>(() => {});

  useEffect(() => {
    const container = root.current;
    if (!container || !autoplayAllowed()) return;
    const videos = Array.from(container.querySelectorAll<HTMLVideoElement>("video[data-autoplay]"));

    const visible = new Set<HTMLVideoElement>();
    let playing: HTMLVideoElement[] = [];
    let isPaused = false;

    const update = () => {
      const candidates = isPaused
        ? []
        : [...playing.filter((v) => visible.has(v)), ...[...visible].filter((v) => !playing.includes(v))];
      const next = candidates.slice(0, MAX_PLAYING);
      playing.filter((v) => !next.includes(v)).forEach((v) => v.pause());
      next.forEach((v) => {
        if (v.paused) v.play().catch(() => {});
      });
      playing = next;
    };
    sync.current = (value) => {
      isPaused = value;
      update();
    };

    const near = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const video = entry.target as HTMLVideoElement;
          if (video.preload === "none") video.preload = "metadata";
          near.unobserve(video);
        }),
      { rootMargin: "100% 0px" },
    );
    const inView = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) visible.add(video);
          else visible.delete(video);
        });
        update();
      },
      { threshold: [0, 0.5] },
    );
    videos.forEach((video) => {
      near.observe(video);
      inView.observe(video);
    });

    return () => {
      near.disconnect();
      inView.disconnect();
      videos.forEach((video) => video.pause());
      sync.current = () => {};
    };
  }, [root]);

  useEffect(() => sync.current(paused), [paused]);
}
