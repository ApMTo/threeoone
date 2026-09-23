import type { SVGProps } from "react";

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 15 15"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.224 0a6.224 6.224 0 0 0 0 12.448 6.2 6.2 0 0 0 3.906-1.378l3.122 3.122a.6.6 0 0 0 .849-.849l-3.122-3.122A6.224 6.224 0 0 0 6.224 0Zm0 1.2a5.024 5.024 0 1 0 0 10.048 5.024 5.024 0 0 0 0-10.048Z"
      />
    </svg>
  );
}
