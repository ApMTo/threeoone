import type { SVGProps } from "react";

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      aria-hidden
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="m1 1 12 12M13 1 1 13"
      />
    </svg>
  );
}
