import type { ReactNode } from "react";
import Image from "next/image";

type AuthPageShellProps = {
  imageSrc: string;
  imageAlt?: string;
  children: ReactNode;
};

export function AuthPageShell({
  imageSrc,
  imageAlt = "",
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col lg:flex-row">
      <div className="relative min-h-60 flex-1 lg:hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 -mt-10 flex shrink-0 flex-col items-center rounded-t-4xl bg-white px-6 pt-8 pb-10 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] lg:mt-0 lg:w-1/2 lg:justify-center lg:rounded-none lg:px-12 lg:py-0 lg:shadow-none">
        {children}
      </div>

      <div className="relative hidden min-h-dvh w-1/2 overflow-hidden p-6 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-[28px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
