import type { Categoria } from "@/data/projetos";

/**
 * Fotos e vídeos reais da página /obras — Figma "Obras - Desktop" (123:2), grade 123:25.
 * Os nomes são descritivos e provisórios: trocar aqui (viram legenda e texto alternativo).
 * Sem local, data ou cliente: a página mostra só mídia + "nome · categoria".
 */
export type Obra = {
  id: string;
  tipo: "foto" | "video";
  /** Legenda e alt/aria-label. */
  nome: string;
  categoria: Categoria;
  /** Coluna no desktop (2 = deslocada 120px para baixo). */
  coluna: 1 | 2;
  /** Ordem de leitura no mobile e na galeria (intercala as colunas). */
  ordem: number;
  /** Proporção da moldura: px do Figma, base 648px de largura. */
  largura: number;
  altura: number;
  /** Foto, ou capa (poster) do vídeo. */
  src: string;
  /** Sem áudio. `webm` é opcional: entra antes do mp4 quando existir. */
  video?: { mp4: string; webm?: string; duracao: string };
};

const FOTOS = "/obras/fotos";
const VIDEOS = "/obras/videos";

const video = (arquivo: string, duracao: string) => ({
  src: `${VIDEOS}/${arquivo}-poster.jpg`,
  video: { mp4: `${VIDEOS}/${arquivo}.mp4`, duracao },
});

/** Ordem de cima para baixo em cada coluna, como no Figma. */
export const OBRAS: readonly Obra[] = [
  // Coluna 1
  {
    id: "v01",
    tipo: "video",
    nome: "Instalação de ripado em fachada",
    categoria: "Estruturas",
    coluna: 1,
    ordem: 1,
    largura: 648,
    altura: 720,
    ...video("v01-instalacao-ripado", "0:11"),
  },
  {
    id: "p1",
    tipo: "foto",
    nome: "Janelas de alumínio no corredor",
    categoria: "Esquadrias",
    coluna: 1,
    ordem: 3,
    largura: 648,
    altura: 486,
    src: `${FOTOS}/p1-janelas-corredor.jpg`,
  },
  {
    id: "p7",
    tipo: "foto",
    nome: "Box de correr com perfil preto",
    categoria: "Vidros",
    coluna: 1,
    ordem: 5,
    largura: 648,
    altura: 648,
    src: `${FOTOS}/p7-box-correr-azulejo-azul.jpg`,
  },
  {
    id: "porta-preta",
    tipo: "foto",
    nome: "Porta de alumínio preta",
    categoria: "Esquadrias",
    coluna: 1,
    ordem: 7,
    largura: 648,
    altura: 640,
    src: `${FOTOS}/porta-preta.jpg`,
  },
  {
    id: "v02",
    tipo: "video",
    nome: "Detalhe do ripado de alumínio",
    categoria: "Estruturas",
    coluna: 1,
    ordem: 9,
    largura: 648,
    altura: 720,
    ...video("v02-detalhe-ripado", "0:13"),
  },
  {
    id: "p4",
    tipo: "foto",
    nome: "Box de vidro em canto",
    categoria: "Vidros",
    coluna: 1,
    ordem: 11,
    largura: 648,
    altura: 579,
    src: `${FOTOS}/p4-box-canto-preto.jpg`,
  },
  {
    id: "p8",
    tipo: "foto",
    nome: "Janelas com vidro canelado",
    categoria: "Vidros",
    coluna: 1,
    ordem: 13,
    largura: 648,
    altura: 517,
    src: `${FOTOS}/p8-janelas-vidro-canelado.jpg`,
  },
  {
    id: "p2",
    tipo: "foto",
    nome: "Envidraçamento com cobertura de vidro",
    categoria: "Vidros",
    coluna: 1,
    ordem: 15,
    largura: 648,
    altura: 450,
    src: `${FOTOS}/p2-envidracamento-cobertura.jpg`,
  },

  // Coluna 2 (deslocada)
  {
    id: "v04",
    tipo: "video",
    nome: "Persiana motorizada e porta de vidro",
    categoria: "Esquadrias",
    coluna: 2,
    ordem: 2,
    largura: 648,
    altura: 365,
    ...video("v04-persiana-vidro", "0:19"),
  },
  {
    id: "p3",
    tipo: "foto",
    nome: "Maxim-ar de alumínio preto",
    categoria: "Esquadrias",
    coluna: 2,
    ordem: 4,
    largura: 648,
    altura: 810,
    src: `${FOTOS}/p3-maxim-ar-preta.jpg`,
  },
  {
    id: "p9",
    tipo: "foto",
    nome: "Porta ripada amadeirada",
    categoria: "Estruturas",
    coluna: 2,
    ordem: 6,
    largura: 648,
    altura: 864,
    src: `${FOTOS}/p9-porta-ripada-amadeirada.jpg`,
  },
  {
    id: "porta-branca",
    tipo: "foto",
    nome: "Porta de alumínio branca com inox",
    categoria: "Esquadrias",
    coluna: 2,
    ordem: 8,
    largura: 648,
    altura: 640,
    src: `${FOTOS}/porta-branca.jpg`,
  },
  {
    id: "v03",
    tipo: "video",
    nome: "Porta e vidro na fachada",
    categoria: "Esquadrias",
    coluna: 2,
    ordem: 10,
    largura: 648,
    altura: 720,
    ...video("v03-fachada-portas", "0:06"),
  },
  {
    id: "p5",
    tipo: "foto",
    nome: "Cobertura de vidro",
    categoria: "Coberturas",
    coluna: 2,
    ordem: 12,
    largura: 648,
    altura: 810,
    src: `${FOTOS}/p5-cobertura-vidro.jpg`,
  },
  {
    id: "p6",
    tipo: "foto",
    nome: "Porta de correr de alumínio preto",
    categoria: "Esquadrias",
    coluna: 2,
    ordem: 14,
    largura: 648,
    altura: 549,
    src: `${FOTOS}/p6-porta-correr-preta-fachada.jpg`,
  },
];

/** Ordem de leitura (1 a 15): mobile e setas da galeria. */
export const OBRAS_EM_ORDEM = [...OBRAS].sort((a, b) => a.ordem - b.ordem);

/** Colunas do desktop, na ordem do Figma. */
export const COLUNAS = [1, 2].map((coluna) => OBRAS.filter((obra) => obra.coluna === coluna));

/** Vídeo horizontal (v04): a moldura já tem a proporção do vídeo, então não recebe parallax. */
export const temParallax = (obra: Obra) => !(obra.tipo === "video" && obra.largura > obra.altura);
