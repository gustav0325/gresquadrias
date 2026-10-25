/**
 * Obras da GR Esquadrias — fonte única para a Home e para /projetos/[slug].
 * A ordem do array é a ordem de leitura (mobile) e define o zigue-zague no desktop:
 * posições pares na coluna 1, ímpares na coluna 2 (deslocada).
 */

export const CATEGORIAS = ["Esquadrias", "Vidros", "Coberturas", "Estruturas"] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type Projeto = {
  id: string;
  titulo: string;
  categoria: Categoria;
  local: string;
  /** Mês/ano da obra, como exibido: "MM/AAAA" */
  data: string;
  /** Fotografias da obra; a primeira é a capa. No Figma cada obra tem uma foto. */
  fotos: readonly string[];
  slug: string;
  /** Texto da página da obra — ainda não definido no Figma, por isso ausente. */
  descricao?: string;
};

export const PROJETOS: Projeto[] = [
  {
    id: "GR001",
    titulo: "Varanda com ripado",
    categoria: "Estruturas",
    local: "Condomínio Vitta, Cotia – SP",
    data: "12/2024",
    fotos: ["/images/projetos/gr001-varanda-com-ripado.jpg"],
    slug: "varanda-com-ripado",
  },
  {
    id: "GR002",
    titulo: "Canto de vidro",
    categoria: "Vidros",
    local: "Condomínio Vitta, Cotia – SP",
    data: "09/2026",
    fotos: ["/images/projetos/gr002-canto-de-vidro.jpg"],
    slug: "canto-de-vidro",
  },
  {
    id: "GR003",
    titulo: "Porta de correr com pátio",
    categoria: "Esquadrias",
    local: "Condomínio Vitta, Cotia – SP",
    data: "05/2026",
    fotos: ["/images/projetos/gr003-porta-de-correr-com-patio.jpg"],
    slug: "porta-de-correr-com-patio",
  },
  {
    id: "GR004",
    titulo: "Veneziana preta",
    categoria: "Estruturas",
    local: "Condomínio Vitta, Cotia – SP",
    data: "02/2026",
    fotos: ["/images/projetos/gr004-veneziana-preta.jpg"],
    slug: "veneziana-preta",
  },
  {
    id: "GR005",
    titulo: "Cobertura de vidro",
    categoria: "Coberturas",
    local: "Casa residencial, Osasco – SP",
    data: "06/2024",
    fotos: ["/images/projetos/gr005-cobertura-de-vidro.jpg"],
    slug: "cobertura-de-vidro",
  },
];

/**
 * TODO: rota /projetos/[slug] — a página da obra ainda não foi desenhada.
 * Enquanto ela não existir, nenhum link aponta para cá (evita 404).
 */
export const projetoHref = (projeto: Projeto) => `/projetos/${projeto.slug}`;

/** "Varanda com ripado — Condomínio Vitta, Cotia" (sem a UF) */
export const projetoAlt = (projeto: Projeto) =>
  `${projeto.titulo} — ${projeto.local.replace(/\s+–\s+[A-Z]{2}$/, "")}`;
