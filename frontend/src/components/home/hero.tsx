import Image from "next/image";
import Link from "next/link";

import heroImage from "../../../public/hero.png";
import { routes } from "@/constants/routes";

export function Hero() {
  return (
    <section className="relative isolate h-[calc(100dvh-5rem)] w-full overflow-hidden">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 flex items-end justify-center px-4 pb-16 sm:px-0 sm:pb-20">
        <Link
          href={routes.products}
          className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#E6E8E7] bg-white/10 px-12 py-3.75 text-base leading-none text-white backdrop-blur-md transition hover:bg-white/15 sm:w-auto"
        >
          Shop now
        </Link>
      </div>
    </section>
  );
}
