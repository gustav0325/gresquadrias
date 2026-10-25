import { QUOTE_LINK } from "@/config/navigation";

/** Serviços da Home — textos do Figma "3 · Serviços" (101:234). */

export type Servico = {
  numero: string;
  /** Duas linhas, com a quebra do Figma. */
  titulo: readonly [string, string];
  descricao: string;
  aplicacoes: readonly string[];
  orcamento: { label: string; href: string };
  imagem: { src: string; alt: string };
};

export const SERVICOS: readonly Servico[] = [
  {
    numero: "01",
    titulo: ["Esquadrias", "de alumínio"],
    descricao:
      "Portas, janelas e sistemas em alumínio sob medida, desenvolvidos para integrar ambientes, valorizar a arquitetura e atender às necessidades de cada projeto.",
    aplicacoes: ["Salas", "Quartos", "Varandas", "Fachadas"],
    orcamento: { label: "Orçar esquadrias", href: QUOTE_LINK.href },
    imagem: {
      src: "/images/servicos/01-esquadrias-de-aluminio.png",
      alt: "Porta de correr em alumínio preto com vidro, aberta para o jardim",
    },
  },
  {
    numero: "02",
    titulo: ["Vidros temperados", "e laminados"],
    descricao:
      "Soluções em vidro para diferentes ambientes e propostas arquitetônicas, com especificação do material conforme a aplicação e os requisitos de cada projeto.",
    aplicacoes: ["Guarda-corpos", "Divisórias", "Portas", "Fechamentos de varanda"],
    orcamento: { label: "Orçar vidros", href: QUOTE_LINK.href },
    imagem: {
      src: "/images/servicos/02-vidros-temperados-e-laminados.png",
      alt: "Cobertura de vidro com perfil de alumínio no alto de um edifício, com a cidade ao fundo",
    },
  },
  {
    numero: "03",
    titulo: ["Coberturas", "termoacústicas"],
    descricao:
      "Coberturas sob medida para ambientes que precisam de proteção e conforto. A escolha dos materiais e das soluções construtivas considera as necessidades de cada espaço.",
    aplicacoes: ["Áreas gourmet", "Garagens", "Corredores externos", "Pergolados"],
    orcamento: { label: "Orçar coberturas", href: QUOTE_LINK.href },
    imagem: {
      src: "/images/servicos/03-coberturas-termoacusticas.png",
      alt: "Cobertura termoacústica com estrutura metálica preta sobre área de churrasqueira",
    },
  },
  {
    numero: "04",
    titulo: ["Estruturas e", "projetos especiais"],
    descricao:
      "Estruturas personalizadas em alumínio e soluções desenvolvidas para demandas específicas, respeitando as características arquitetônicas de cada projeto.",
    aplicacoes: ["Ripados", "Áreas de lazer", "Espaços comerciais", "Projetos especiais"],
    orcamento: { label: "Orçar estruturas", href: QUOTE_LINK.href },
    imagem: {
      src: "/images/servicos/04-estruturas-e-projetos-especiais.png",
      alt: "Fachada com porta ripada preta e janela de alumínio com vidro",
    },
  },
];

export type Etapa = { numero: string; titulo: string; descricao: string };

/** "Como trabalhamos" — etapas do processo. */
export const ETAPAS: readonly Etapa[] = [
  { numero: "01", titulo: "Visita e medição", descricao: "Levantamento das informações do espaço." },
  { numero: "02", titulo: "Projeto", descricao: "Definição da solução e dos detalhes técnicos." },
  { numero: "03", titulo: "Fabricação", descricao: "Produção conforme as especificações aprovadas." },
  { numero: "04", titulo: "Instalação", descricao: "Montagem e ajustes no local." },
];
