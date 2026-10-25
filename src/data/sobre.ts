import { QUOTE_LINK } from "@/config/navigation";

/** Seção Sobre da Home — textos do Figma "4 · Sobre" (101:455 / 101:1069). */

export const SOBRE = {
  eyebrow: "SOBRE",
  /** Duas linhas no desktop; a última palavra da 2ª linha vai em bronze. */
  titulo: {
    linha1: "Mais do que esquadrias.",
    linha2: "Detalhes que transformam",
    destaque: "espaços.",
  },
  numero: {
    valor: 15,
    prefixo: "+",
    rotulo: "ANOS DE MERCADO",
    ariaLabel: "Mais de 15 anos de mercado",
  },
  paragrafo:
    "A GR Esquadrias faz esquadrias de alumínio, vidros e coberturas sob medida. Cada obra é pensada para unir estética, funcionalidade e precisão, do projeto à instalação.",
  /** Removida do desktop no Figma atualizado; continua no layout mobile. */
  apoio: { texto: "Experiência e atenção ao detalhe em cada obra.", desktop: false },
  link: { label: "Solicite um orçamento", href: QUOTE_LINK.href },
  pilares: [
    {
      titulo: "Sob medida",
      descricao: "Soluções pensadas para o seu espaço, no tamanho exato do vão.",
    },
    {
      titulo: "Alumínio e vidro",
      descricao: "Esquadrias, vidros e coberturas, com o acabamento adequado a cada serviço.",
    },
    {
      titulo: "Do projeto à instalação",
      descricao:
        "Da visita e medição até a instalação final, cada etapa com atenção ao detalhe.",
    },
  ],
} as const;
