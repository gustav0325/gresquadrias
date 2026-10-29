import Link from "next/link";
import type { ComponentProps } from "react";

import { NEW_TAB } from "@/config/navigation";

type BronzeButtonProps = Omit<ComponentProps<"a">, "href" | "children"> & {
  href: string;
  /** Texto em caixa-alta; a seta ↗ é acrescentada aqui. */
  label: string;
  /** Página do site (next/link): pré-carregada. */
  prefetch?: boolean;
  /** "dark": cápsula preta sobre fundo claro (CTA da /obras). */
  tone?: "bronze" | "dark";
};

const EASE = "ease-[cubic-bezier(0.33,1,0.68,1)]";

const TONE_CLASS = {
  bronze: "focus-ring bg-bronze text-ink hover:bg-[#b88b5c]",
  dark: "bg-ink-warm text-ivory outline-offset-3 outline-bronze-deep hover:bg-umber focus-visible:outline-2",
} as const;

/**
 * Cápsula bronze (ou preta, `tone="dark"`) com seta ↗ ("Pedir orçamento", "Ver últimas obras").
 * O tamanho vem de `className`. Hover (só com mouse, pelo `hover:` do Tailwind): fundo um tom
 * abaixo (bronze) ou acima (preto) e a seta sobe 4px para a direita. Links externos (WhatsApp)
 * abrem em nova aba.
 */
export function BronzeButton({
  href,
  label,
  prefetch,
  tone = "bronze",
  className = "",
  ...props
}: BronzeButtonProps) {
  const classes = `group rounded-full font-medium transition-colors duration-300 ${EASE} ${TONE_CLASS[tone]} motion-reduce:transition-none ${className}`;
  const content = (
    // Um só item flex: o espaço antes da seta não é descartado
    <span>
      {label}{" "}
      <span
        className={`inline-block transition-transform duration-300 ${EASE} group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none`}
      >
        ↗
      </span>
    </span>
  );

  if (/^https?:/.test(href)) {
    return (
      <a href={href} {...NEW_TAB} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={prefetch} className={classes} {...props}>
      {content}
    </Link>
  );
}
