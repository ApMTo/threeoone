"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import type { ProductSectionItem } from "@/data/mock-products";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";

type ProductSectionProps = {
  title: string;
  products: ProductSectionItem[];
  className?: string;
};

export function ProductSection({ title, products, className }: ProductSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const card = scroller.querySelector<HTMLElement>("[data-product-card]");
    const delta = (card?.offsetWidth ?? scroller.clientWidth / 4) + 8;
    scroller.scrollBy({ left: direction * delta, behavior: "smooth" });
  };

  return (
    <section className={cn("w-full bg-white", className)}>
      <h2 className="mb-6 px-4 font-fraunces text-base font-semibold uppercase tracking-wide text-foreground sm:px-6">
        {title}
      </h2>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-2 overflow-x-auto scroll-smooth px-4 scrollbar-none sm:px-6"
        >
          {products.map((product) => (
            <article
              key={product.id}
              data-product-card
              className="w-[calc((100%-8px)/2)] shrink-0 sm:w-[calc((100%-16px)/3)] lg:w-[calc((100%-24px)/4)]"
            >
              <Link href={product.href} className="block">
                <div className="relative aspect-3/4 overflow-hidden bg-zinc-100">
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3 font-fraunces text-xs uppercase leading-tight text-foreground">
                  <span className="min-w-0 truncate">{product.name}</span>
                  <span className="shrink-0">{product.price}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 z-10 hidden items-center justify-between px-2 sm:flex sm:px-4">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => scrollByCard(-1)}
            className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-[#8a7a6a]/35 text-white backdrop-blur-md transition hover:bg-[#8a7a6a]/50"
          >
            <ArrowLeftIcon />
          </button>

          <button
            type="button"
            aria-label="Next products"
            onClick={() => scrollByCard(1)}
            className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-[#8a7a6a]/35 text-white backdrop-blur-md transition hover:bg-[#8a7a6a]/50"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
