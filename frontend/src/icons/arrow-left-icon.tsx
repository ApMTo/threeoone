import type { SVGProps } from "react";

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="14"
      fill="none"
      viewBox="0 0 8 14"
      aria-hidden
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M7 1 1 7l6 6"
      />
    </svg>
  );
}
