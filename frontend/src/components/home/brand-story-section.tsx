import Link from "next/link";

import { routes } from "@/constants/routes";
import { StarIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";

type BrandStorySectionProps = {
  className?: string;
};

export function BrandStorySection({ className }: BrandStorySectionProps) {
  return (
    <section className={cn("w-full bg-black px-4 py-16 text-white sm:px-6 sm:py-20", className)}>
      <div className="mx-auto flex max-w-175 flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-1.5" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }, (_, index) => (
            <StarIcon key={index} className="size-[22px] text-white" />
          ))}
        </div>

        <h2 className="font-fraunces text-[20px] leading-snug">
          Where Heritage Meets Modern Luxury
        </h2>

        <div className="mt-6 space-y-4 text-left font-fraunces text-xs leading-relaxed text-white/95">
          <p>
            Founded in 2018 by Garen Tchobanian, AZAT MARD was built on a clear purpose - to create
            more than clothing.
          </p>
          <p>
            Shaped by Armenian heritage and expressed through a modern lens, each piece carries
            meaning, identity, and intent.
          </p>
          <p>
            AZAT MARD - <em className="italic">Free People.</em>
          </p>
          <p>A global brand, driven by culture and carried by its community.</p>
        </div>

        <Link
          href={routes.products}
          className="mt-10 inline-flex w-full items-center justify-center border border-white px-8 py-3.5 text-sm uppercase tracking-wide text-white transition hover:bg-white hover:text-black sm:w-auto"
        >
          Join the Movement
        </Link>
      </div>
    </section>
  );
}
