import type { SVGProps } from "react";

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.2 2.25a.9.9 0 0 1 .9.9v1.8a.9.9 0 1 1-1.8 0V4.05H3.9v9.9h2.4V12.15a.9.9 0 1 1 1.8 0v1.8a.9.9 0 0 1-.9.9H3a.9.9 0 0 1-.9-.9V3.15A.9.9 0 0 1 3 2.25h4.2Zm4.14 3.186a.9.9 0 0 1 1.272-.036l2.7 2.55a.9.9 0 0 1 0 1.3l-2.7 2.55a.9.9 0 1 1-1.236-1.308L12.63 9.9H8.1a.9.9 0 1 1 0-1.8h4.53l-1.226-1.158a.9.9 0 0 1-.036-1.272Z"
      />
    </svg>
  );
}
