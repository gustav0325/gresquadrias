"use client";

import Image from "next/image";
import { type PointerEvent, useRef } from "react";

import { NEW_TAB } from "@/config/navigation";
import { CONTATO } from "@/data/contato";
import { entrancesEnabled, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { clearReveal, scheduleRefresh } from "@/lib/reveal";
import { scrollToSection } from "@/lib/smooth-scroll";

/** Micro-movimento do ícone no hover: inclina e volta ao ângulo 0 (0,4 s no total). */
function tiltIcon(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover)").matches) return;
  if (prefersReducedMotion()) return;
  const icon = event.currentTarget.querySelector("svg");
  const degrees = Number(event.currentTarget.dataset.tilt);
  gsap
    .timeline({ defaults: { duration: 0.2, ease: "power2.out" } })
    .fromTo(icon, { rotation: 0 }, { rotation: degrees, overwrite: true })
    .to(icon, { rotation: 0, ease: "power2.inOut" });
}

/** Saída no meio do movimento: volta ao 0 suavemente, sem pulo. */
function settleIcon(event: PointerEvent<HTMLAnchorElement>) {
  const icon = event.currentTarget.querySelector("svg");
  gsap.to(icon, { rotation: 0, duration: 0.2, ease: "power2.out", overwrite: true });
}

const SOCIAL_CLASS =
  "footer-social flex size-12 shrink-0 items-center justify-center border border-bronze md:size-14";

/**
 * Rodapé escuro, único do site (layout.tsx: Home e /obras) — Figma "Rodapé (escuro)"
 * 145:2 (desktop), 145:63 (mobile), 145:82 (Obras).
 * Bloco principal: logo (só md+), "Acompanhe a GR" e os ícones; bloco inferior: © e "Voltar ao
 * topo" (Lenis global). Hover dos ícones em globals.css (.footer-social).
 *
 * Entrada: os dois blocos sobem em sequência ao chegar ao rodapé. Estados iniciais só sob
 * `html.js-ready`.
 */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (entrancesEnabled()) {
        const blocks = gsap.utils.selector(footerRef)("[data-footer-block]");
        gsap.set(blocks, { opacity: 0, y: 16 });
        gsap.to(blocks, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 92%", once: true },
          onComplete: clearReveal(blocks),
        });
      }
      scheduleRefresh();
    },
    { scope: footerRef },
  );

  const toTop = () => scrollToSection(null, { immediate: prefersReducedMotion() });

  return (
    <footer ref={footerRef} className="border-t border-bronze/50 bg-ink-warm" data-footer>
      <div
        className="flex items-center justify-between gap-6 px-(--gutter) pt-11 pb-9 md:pt-16 md:pb-14"
        data-reveal
        data-footer-block
      >
        <div className="hidden h-[75px] w-[300px] shrink-0 pt-[4.5px] md:block">
          <Image
            src="/images/brand/logo-gr.svg"
            alt="GR Esquadrias"
            width={227}
            height={65}
            className="h-[64.5px] w-[226.5px]"
          />
        </div>

        <div className="flex w-full items-center justify-between gap-6 md:w-auto">
          <p className="font-display-italic text-[18px] leading-[normal] text-paper-dim italic">
            Acompanhe a GR
          </p>
          <ul className="flex gap-2.5 md:gap-4">
            <li>
              <a
                href={CONTATO.whatsapp}
                {...NEW_TAB}
                aria-label="WhatsApp"
                className={SOCIAL_CLASS}
                data-tilt="6"
                onPointerEnter={tiltIcon}
                onPointerLeave={settleIcon}
              >
                <span aria-hidden="true" className="footer-social__fill" />
                {/* Ícone escolhido no Figma (148:2 / 148:8) */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 23.8851 24"
                  fill="currentColor"
                  className="footer-social__icon h-[22px] w-[21.9px] md:h-6 md:w-[23.9px]"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.415 14.382C17.117 14.233 15.656 13.515 15.384 13.415C15.112 13.315 14.914 13.267 14.715 13.565C14.517 13.862 13.948 14.531 13.775 14.729C13.601 14.928 13.428 14.952 13.131 14.804C12.834 14.654 11.876 14.341 10.741 13.329C9.858 12.541 9.261 11.568 9.088 11.27C8.915 10.973 9.069 10.812 9.218 10.664C9.352 10.531 9.515 10.317 9.664 10.144C9.813 9.97103 9.862 9.84603 9.961 9.64703C10.061 9.44903 10.011 9.27603 9.936 9.12703C9.862 8.97803 9.268 7.51503 9.02 6.92003C8.779 6.34103 8.534 6.42003 8.352 6.41003C8.178 6.40203 7.98 6.40003 7.782 6.40003C7.584 6.40003 7.262 6.47403 6.99 6.77203C6.717 7.06903 5.95 7.78803 5.95 9.25103C5.95 10.713 7.014 12.126 7.163 12.325C7.312 12.524 9.258 15.525 12.239 16.812C12.949 17.118 13.502 17.301 13.933 17.437C14.645 17.664 15.293 17.632 15.805 17.555C16.375 17.47 17.563 16.836 17.811 16.142C18.059 15.448 18.058 14.853 17.984 14.729C17.91 14.605 17.712 14.531 17.414 14.382M11.992 21.785H11.988C10.2174 21.7854 8.47937 21.3094 6.956 20.407L6.596 20.193L2.854 21.175L3.853 17.527L3.618 17.153C2.62809 15.5774 2.10424 13.7538 2.107 11.893C2.109 6.44303 6.543 2.00903 11.996 2.00903C13.2948 2.00509 14.5814 2.25934 15.781 2.75702C16.9807 3.2547 18.0694 3.98587 18.984 4.90803C19.9045 5.82433 20.6341 6.91412 21.1305 8.11431C21.6269 9.3145 21.8803 10.6012 21.876 11.9C21.874 17.35 17.44 21.785 11.992 21.785ZM20.404 3.48803C19.3021 2.3793 17.9913 1.50013 16.5474 0.901413C15.1035 0.302696 13.5551 -0.0036753 11.992 3.32698e-05C5.438 3.32698e-05 0.102 5.33503 0.1 11.892C0.096774 13.9788 0.644198 16.0295 1.687 17.837L0 24L6.304 22.346C8.04817 23.2954 10.0022 23.7932 11.988 23.794H11.993C18.547 23.794 23.883 18.459 23.885 11.901C23.8899 10.3383 23.5848 8.79011 22.9875 7.34603C22.3902 5.90196 21.5124 4.59067 20.405 3.48803"
                  />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={CONTATO.instagram}
                {...NEW_TAB}
                aria-label="Instagram"
                className={SOCIAL_CLASS}
                data-tilt="4"
                onPointerEnter={tiltIcon}
                onPointerLeave={settleIcon}
              >
                <span aria-hidden="true" className="footer-social__fill" />
                {/* Lucide "instagram" (Figma 145:54), traço 1,5 */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 22 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="footer-social__icon size-5 md:size-[22px]"
                >
                  <path d="M6.41667 1.83333H15.5833C18.1146 1.83333 20.1667 3.88536 20.1667 6.41667V15.5833C20.1667 18.1146 18.1146 20.1667 15.5833 20.1667H6.41667C3.88536 20.1667 1.83333 18.1146 1.83333 15.5833V6.41667C1.83333 3.88536 3.88536 1.83333 6.41667 1.83333Z" />
                  <path d="M14.6667 10.4225C14.7798 11.1854 14.6495 11.9645 14.2943 12.6491C13.9391 13.3337 13.3771 13.8888 12.6882 14.2355C11.9993 14.5823 11.2186 14.703 10.4571 14.5804C9.6957 14.4579 8.99228 14.0984 8.44694 13.5531C7.90159 13.0077 7.54209 12.3043 7.41956 11.5429C7.29704 10.7814 7.41773 10.0007 7.76447 9.31184C8.1112 8.62295 8.66634 8.06093 9.3509 7.70572C10.0355 7.35051 10.8146 7.22021 11.5775 7.33333C12.3557 7.44873 13.0761 7.81134 13.6324 8.36761C14.1887 8.92389 14.5513 9.64432 14.6667 10.4225Z" />
                  <path d="M16.0417 5.95833H16.0517" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="px-(--gutter)" data-reveal data-footer-block>
        <div aria-hidden="true" className="h-px bg-white/12" />
        <div className="flex items-center justify-between gap-6 pt-6 pb-9 text-[13px] leading-[normal] md:pt-7 md:pb-10 md:text-[14px]">
          <p className="text-paper-dim">© 2026 GR Esquadrias</p>
          {/* Botão (não âncora): rola com o Lenis global; padding vertical = área de toque de 45px */}
          <button
            type="button"
            onClick={toTop}
            className="footer__top -my-3.5 cursor-pointer py-3.5 font-medium text-bronze"
          >
            <span className="footer__top-label">
              Voltar ao topo <span className="footer__arrow">↑</span>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
