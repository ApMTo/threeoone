import type { SVGProps } from "react";

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 3l18 18M10.6 10.65a2.5 2.5 0 0 0 3.54 3.54M9.4 5.2A9.8 9.8 0 0 1 12 5c6.02 0 8.85 3.78 9.88 5.29.15.23.23.35.27.56a1.8 1.8 0 0 1 0 .3c-.03.16-.08.26-.16.4M17.1 17.15C15.6 18.25 13.9 19 12 19c-6.02 0-8.85-3.78-9.88-5.29-.15-.23-.23-.35-.27-.56a1.8 1.8 0 0 1 0-.3c.04-.21.12-.33.27-.56.5-.74 1.56-2.1 3.2-3.24"
      />
    </svg>
  );
}
