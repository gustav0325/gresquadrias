import { Fragment } from "react";

type MaskedWordsProps = {
  /** Uma string por linha, respeitando as quebras do Figma. */
  lines: readonly string[];
  /** Palavra exibida em bronze (ex.: "sua."). */
  accent?: string;
  /** Classe de cor da palavra em destaque. */
  accentClassName?: string;
  /**
   * Onde as linhas quebram: sempre; só no mobile ("O que / fazemos.");
   * ou só a partir de md (título corrido no mobile, como em Sobre).
   */
  lineBreaks?: "always" | "mobile" | "md";
};

const LINE_CLASS = { always: "block", mobile: "block md:inline", md: "md:block" } as const;

/**
 * Título com cada palavra dentro de uma máscara (alvo: `[data-word]`).
 * Animando juntas as palavras de cada `[data-line]`, a revelação é linha por linha.
 * Use dentro de um heading com `aria-label` contendo o texto completo.
 */
export function MaskedWords({
  lines,
  accent,
  accentClassName = "text-bronze",
  lineBreaks = "always",
}: MaskedWordsProps) {
  return (
    <span aria-hidden="true">
      {lines.map((line, l) => (
        <Fragment key={line}>
          {/* Entre linhas em bloco o espaço some; entre linhas em linha ele separa as palavras */}
          {l > 0 && " "}
          <span className={LINE_CLASS[lineBreaks]} data-line>
            {line.split(" ").map((word, i, words) => (
              <Fragment key={`${word}-${i}`}>
                <span className="word-mask">
                  <span className={`word ${word === accent ? accentClassName : ""}`} data-word>
                    {word}
                  </span>
                </span>
                {i < words.length - 1 && " "}
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
