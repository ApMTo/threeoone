import type { SVGProps } from "react";

export function UserIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M9 2.7a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM5.85 4.95a3.15 3.15 0 1 1 6.3 0 3.15 3.15 0 0 1-6.3 0ZM9 9.9a5.85 5.85 0 0 0-5.85 5.85h-.9A6.75 6.75 0 0 1 9 9a6.75 6.75 0 0 1 6.75 6.75h-.9A5.85 5.85 0 0 0 9 9.9Z"
      />
    </svg>
  );
}
