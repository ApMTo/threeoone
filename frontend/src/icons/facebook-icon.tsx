import type { SVGProps } from "react";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 6 12"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        d="M1.5 4H0v2h1.5v6H4V6h1.821L6 4H4v-.833c0-.478.096-.667.558-.667H6V0H4.096C2.298 0 1.5.792 1.5 2.308z"
      />
    </svg>
  );
}
