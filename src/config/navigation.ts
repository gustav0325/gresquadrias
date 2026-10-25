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

export const QUOTE_LINK = { label: "Orçamento", href: SECTION_LINKS.contato } as const;
