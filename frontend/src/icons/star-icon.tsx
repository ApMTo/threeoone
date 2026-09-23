import type { SVGProps } from "react";

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="13"
      fill="none"
      viewBox="0 0 14 13"
      aria-hidden
      {...props}
    >
      <path
        fill="currentColor"
        d="m7 0 1.572 4.837h5.085L9.543 7.826l1.572 4.837L7 9.674l-4.115 2.989 1.572-4.837L1.343 4.837h5.085L7 0Z"
      />
    </svg>
  );
}
