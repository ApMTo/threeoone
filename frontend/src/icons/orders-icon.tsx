import type { SVGProps } from "react";

export function OrdersIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M4.5 2.25A1.35 1.35 0 0 0 3.15 3.6v10.8c0 .746.604 1.35 1.35 1.35h9c.746 0 1.35-.604 1.35-1.35V3.6a1.35 1.35 0 0 0-1.35-1.35h-9ZM4.65 3.6h8.7v10.8h-8.7V3.6Zm1.8 2.25h5.1v1.35h-5.1V5.85Zm0 3.15h5.1v1.35h-5.1V9Zm0 3.15h3.6v1.35h-3.6v-1.35Z"
      />
    </svg>
  );
}
