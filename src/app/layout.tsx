import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Setas ← ↑ → ↓ ↗ do Inter: não fazem parte de nenhum subset do Google Fonts.
   Subset gerado pela API do Google Fonts (`text=`), licença OFL. */
const interArrows = localFont({
  variable: "--font-inter-arrows",
  src: [
    { path: "../fonts/inter-arrows-400.woff2", weight: "400" },
    { path: "../fonts/inter-arrows-500.woff2", weight: "500" },
  ],
  declarations: [{ prop: "unicode-range", value: "U+2190-2193, U+2197" }],
  display: "swap",
  adjustFontFallback: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

/* Itálico só do rodapé ("Acompanhe a GR"): fim da página, então sem preload */
const cormorantItalic = Cormorant_Garamond({
  variable: "--font-cormorant-italic",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
  preload: false,
});

/** Base das URLs absolutas (Open Graph): domínio de produção na Vercel, localhost fora dela. */
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GR Esquadrias",
  description:
    "Design, funcionalidade e qualidade em esquadrias de alumínio e vidro, do projeto à instalação.",
};

/* Antes da primeira pintura:
   - `html.js`: há JS (ex.: o FAQ fecha as respostas, que sem JS ficam todas abertas);
   - `html.js-ready`: esconde só os elementos das entradas (globals.css); não existe com
     reduced-motion.
   Se o React não marcar `html.hydrated` em 5 s (JS da página falhou), as duas saem e o
   conteúdo aparece como na versão sem JS. */
const JS_READY_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("js-ready");setTimeout(function(){d.classList.remove("js-ready");if(!d.classList.contains("hydrated"))d.classList.remove("js")},5000)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${interArrows.variable} ${cormorant.variable} ${cormorantItalic.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_READY_SCRIPT }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
        <Footer />
      </body>
    </html>
  );
}
