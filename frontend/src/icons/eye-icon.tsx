import type { SVGProps } from "react";

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M2.12 12.71c-.15-.23-.23-.35-.27-.56a1.8 1.8 0 0 1 0-.3c.04-.21.12-.33.27-.56C3.15 9.78 5.98 6 12 6s8.85 3.78 9.88 5.29c.15.23.23.35.27.56a1.8 1.8 0 0 1 0 .3c-.04.21-.12.33-.27.56C20.85 14.22 18.02 18 12 18s-8.85-3.78-9.88-5.29Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      />
    </svg>
  );
}
