type NumberLabelProps = {
  numero: string;
  /** Largura da linha ao lado do número (ex.: "w-12 md:w-20"). */
  lineClassName: string;
};

/** Número em Cormorant bronze + linha fina — serviços e etapas do processo. */
export function NumberLabel({ numero, lineClassName }: NumberLabelProps) {
  return (
    <p className="flex items-center gap-3 md:gap-4" data-number-label>
      <span
        className="font-display text-[28px] leading-[normal] font-medium text-bronze-deep md:text-[32px]"
        data-number
      >
        {numero}
      </span>
      <span aria-hidden="true" className={`h-px bg-line ${lineClassName}`} data-number-line />
    </p>
  );
}
