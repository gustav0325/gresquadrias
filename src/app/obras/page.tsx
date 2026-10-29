import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Works } from "@/components/sections/Works";

const TITLE = "Últimas obras | GR Esquadrias";
const DESCRIPTION =
  "Fotos e vídeos de obras recentes da GR Esquadrias: esquadrias de alumínio, vidros, coberturas e estruturas sob medida.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "pt_BR",
    siteName: "GR Esquadrias",
    url: "/obras",
    images: [
      {
        url: "/obras/fotos/p9-porta-ripada-amadeirada.jpg",
        width: 1500,
        height: 2000,
        alt: "Porta ripada amadeirada",
      },
    ],
  },
};

export default function ObrasPage() {
  return (
    <>
      <Navbar />
      <main>
        <Works />
      </main>
    </>
  );
}
