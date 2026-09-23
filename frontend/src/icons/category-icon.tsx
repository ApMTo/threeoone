import type { SVGProps } from "react";

export function CategoryIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M3.15 3.15h4.95v4.95H3.15V3.15Zm1.35 1.35v2.25h2.25V4.5H4.5ZM9.9 3.15h4.95v4.95H9.9V3.15Zm1.35 1.35v2.25h2.25V4.5H11.25ZM3.15 9.9h4.95v4.95H3.15V9.9Zm1.35 1.35v2.25h2.25v-2.25H4.5ZM9.9 9.9h4.95v4.95H9.9V9.9Zm1.35 1.35v2.25h2.25v-2.25H11.25Z"
      />
    </svg>
  );
}
