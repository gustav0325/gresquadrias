/** Disparado quando a página trava ou destrava; o SmoothScroll pausa/retoma o Lenis. */
export const PAGE_LOCK_EVENT = "gr:page-lock";

/**
 * Trava a página atrás de um menu modal (menu mobile da navbar): sem rolagem
 * (`html.page-locked`, globals.css) e conteúdo `inert` (sem foco, toque ou leitor de tela).
 * Idempotente: destravar uma página já livre não faz nada.
 */
export function lockPage(locked: boolean) {
  const root = document.documentElement;
  if (root.classList.contains("page-locked") === locked) return;
  root.classList.toggle("page-locked", locked);
  document.querySelectorAll<HTMLElement>("body > main, body > footer").forEach((el) => {
    el.inert = locked;
  });
  window.dispatchEvent(new CustomEvent<boolean>(PAGE_LOCK_EVENT, { detail: locked }));
}
