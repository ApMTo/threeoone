import type { SVGProps } from "react";
import { useId } from "react";

export function BurgerMenuIcon(props: SVGProps<SVGSVGElement>) {
  const uid = useId();
  const maskTop = `${uid}-top`;
  const maskMid = `${uid}-mid`;
  const maskBot = `${uid}-bot`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="13"
      fill="none"
      viewBox="0 0 16 13"
      aria-hidden
      {...props}
    >
      <mask id={maskTop} fill="#fff">
        <path d="M0 0h16v1H0z" />
      </mask>
      <path fill="currentColor" d="M0 0v1h16v-2H0z" mask={`url(#${maskTop})`} />
      <mask id={maskMid} fill="#fff">
        <path d="M0 6h16v1H0z" />
      </mask>
      <path fill="currentColor" d="M0 6v1h16V5H0z" mask={`url(#${maskMid})`} />
      <mask id={maskBot} fill="#fff">
        <path d="M0 12h16v1H0z" />
      </mask>
      <path fill="currentColor" d="M0 12v1h16v-2H0z" mask={`url(#${maskBot})`} />
    </svg>
  );
}
