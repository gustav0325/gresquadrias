import { WHATSAPP_URL } from "@/lib/whatsapp";

/**
 * Destinos de navegação do site.
 * A Home do Figma ("Home - Desktop") reúne Projetos, Serviços, Sobre e Contato
 * como seções de uma única página, por isso os links apontam para âncoras.
 */
export const SECTION_LINKS = {
  projetos: "/#projetos",
  servicos: "/#servicos",
  sobre: "/#sobre",
  contato: "/#contato",
} as const;

/** Páginas próprias (fora da Home). */
export const PAGE_LINKS = {
  obras: "/obras",
} as const;

/** Ordem do Figma: âncoras da Home primeiro, "Obras" (página) por último. */
export const NAV_LINKS = [
  { label: "Projetos", href: SECTION_LINKS.projetos },
  { label: "Serviços", href: SECTION_LINKS.servicos },
  { label: "Sobre", href: SECTION_LINKS.sobre },
  { label: "Contato", href: SECTION_LINKS.contato },
  { label: "Obras", href: PAGE_LINKS.obras },
] as const;

/** Id da seção de um link âncora ("/#servicos" → "servicos"); `undefined` para páginas. */
export const sectionId = (href: string) => href.split("#")[1] as string | undefined;

/** CTAs comerciais (orçamento) abrem o WhatsApp oficial em nova aba. */
export const QUOTE_LINK = { label: "Orçamento", href: WHATSAPP_URL } as const;

export const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;
