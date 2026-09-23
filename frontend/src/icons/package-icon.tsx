import type { SVGProps } from "react";

export function PackageIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8.47 1.66a1.35 1.35 0 0 1 1.06 0l5.4 2.25c.5.21.82.7.82 1.24v7.7a1.35 1.35 0 0 1-.82 1.24l-5.4 2.25a1.35 1.35 0 0 1-1.06 0l-5.4-2.25a1.35 1.35 0 0 1-.82-1.24v-7.7c0-.54.32-1.03.82-1.24l5.4-2.25ZM3.75 5.8v6.9l4.5 1.88V7.68L3.75 5.8Zm5.25 1.88v6.9l4.5-1.88V5.8L9 7.68Zm-.53-4.52L4.2 4.85 9 6.85l4.8-2 4.27-1.69L9 3.16Z"
      />
    </svg>
  );
}
