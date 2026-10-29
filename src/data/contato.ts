/** Dados de contato — usados na seção Contato e no rodapé. O link do WhatsApp vem de @/lib/whatsapp. */

import { WHATSAPP_URL } from "@/lib/whatsapp";

const ENDERECO_COMPLETO = "Rua Augusta Magalhães, 87, Vila Água Funda, São Paulo - SP";

/** E-mail oficial da empresa: único lugar do projeto onde ele é escrito. */
export const EMAIL = "gustavogresquadrias@gmail.com";

export const CONTATO = {
  telefone: { exibicao: "+55 (11) 94397-7964", href: "tel:+5511943977964" },
  email: { exibicao: EMAIL, href: `mailto:${EMAIL}` },
  endereco: {
    linha1: "Rua Augusta Magalhães, 87",
    linha2: "Vila Água Funda, São Paulo – SP",
    comoChegar:
      "https://www.google.com/maps/search/?api=1&query=Rua+Augusta+Magalh%C3%A3es,+87,+Vila+%C3%81gua+Funda,+S%C3%A3o+Paulo",
    mapaEmbed: `https://www.google.com/maps?q=${encodeURIComponent(ENDERECO_COMPLETO)}&output=embed`,
  },
  horario: { linha1: "Das 8h às 18h", linha2: "Seg - Sex" },
  whatsapp: WHATSAPP_URL,
  instagram: "https://www.instagram.com/gresquadrias",
} as const;

export const CONTATO_TEXTOS = {
  eyebrow: "CONTATO",
  titulo: { linha1: "Tem um projeto", linha2: "em", destaque: "mente?" },
  apoio:
    "Compartilhe sua ideia com a nossa equipe. Vamos conversar sobre as soluções para o seu espaço.",
} as const;
