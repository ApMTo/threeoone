import type { SVGProps } from "react";

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M2.25 2.25h5.25v5.25H2.25V2.25Zm1.5 1.5v2.25h2.25V3.75H3.75ZM10.5 2.25h5.25v5.25H10.5V2.25Zm1.5 1.5v2.25h2.25V3.75H12ZM2.25 10.5h5.25v5.25H2.25V10.5Zm1.5 1.5v2.25h2.25V12H3.75ZM10.5 10.5h5.25v5.25H10.5V10.5Zm1.5 1.5v2.25h2.25V12H12Z"
      />
    </svg>
  );
}
