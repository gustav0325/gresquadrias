import Link from "next/link";

/** Texto em volta do selo: 2 × "ROLE A TELA | " = 28 posições. */
const SEAL_CHARS = Array.from("ROLE A TELA | ROLE A TELA | ");

type ScrollIndicatorProps = {
  href: string;
  className?: string;
};

/**
 * Selo circular "Role a tela" — Figma 98:23 (desktop) e 98:45 (mobile).
 * A seta central só existe na versão mobile do Figma.
 */
export function ScrollIndicator({ href, className = "" }: ScrollIndicatorProps) {
  return (
    <Link
      href={href}
      aria-label="Role a tela"
      className={`scroll-seal focus-ring block size-[77.25px] rounded-full font-medium text-[9px] text-paper md:size-[89.9px] md:text-[8.68px] ${className}`}
      data-hero-el="scroll"
    >
      <span className="scroll-seal__ring relative block size-full" aria-hidden="true">
        {SEAL_CHARS.map((char, i) => (
          <span
            key={i}
            className={`scroll-seal__char ${char === "|" ? "text-bronze" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {char}
          </span>
        ))}
      </span>
      <span
        className="scroll-seal__arrow absolute inset-0 flex items-center justify-center text-[18px] font-normal md:hidden"
        aria-hidden="true"
      >
        ↓
      </span>
    </Link>
  );
}
