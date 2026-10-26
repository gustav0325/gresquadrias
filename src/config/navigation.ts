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

export const NAV_LINKS = [
  { label: "Projetos", href: SECTION_LINKS.projetos },
  { label: "Serviços", href: SECTION_LINKS.servicos },
  { label: "Sobre", href: SECTION_LINKS.sobre },
  { label: "Contato", href: SECTION_LINKS.contato },
] as const;

/** CTAs comerciais (orçamento) abrem o WhatsApp oficial em nova aba. */
export const QUOTE_LINK = { label: "Orçamento", href: WHATSAPP_URL } as const;

export const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;
