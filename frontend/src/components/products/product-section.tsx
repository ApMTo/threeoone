"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";

export type ProductSectionItem = {
  id: string;
  name: string;
  price: string;
  imageSrc: string | null;
  href: string;
  colors?: Array<{ id: string; hex: string; name?: string | null }>;
};

type ProductSectionProps = {
  title: string;
  products: ProductSectionItem[];
  /** When set, title arrow navigates to this category view */
  href?: string;
  /** Horizontal padding for full-bleed home sections. Off when nested in Container. */
  padded?: boolean;
  className?: string;
};

export function ProductSection({
  title,
  products,
  href,
  padded = true,
  className,
}: ProductSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const padX = padded ? "px-4 sm:px-6" : undefined;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      setCanScroll(scroller.scrollWidth > scroller.clientWidth + 1);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, [products]);

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const card = scroller.querySelector<HTMLElement>("[data-product-card]");
    const delta = (card?.offsetWidth ?? scroller.clientWidth / 4) + 8;
    scroller.scrollBy({ left: direction * delta, behavior: "smooth" });
  };

  return (
    <section className={cn("w-full bg-white", className)}>
      <div className={cn("mb-6 flex items-center justify-between gap-4", padX)}>
        <h2 className="font-fraunces text-base font-semibold uppercase tracking-wide text-foreground">
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            aria-label={`View all ${title}`}
            className="inline-flex size-9 items-center justify-center text-foreground transition hover:opacity-70"
          >
            <ArrowRightIcon className="h-3.5 w-2" />
          </Link>
        ) : null}
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          className={cn("flex gap-2 overflow-x-auto scroll-smooth scrollbar-none", padX)}
        >
          {products.map((product) => {
            const colors = product.colors ?? [];

            return (
              <article
                key={product.id}
                data-product-card
                className="w-[calc((100%-8px)/2)] shrink-0 sm:w-[calc((100%-16px)/3)] lg:w-[calc((100%-24px)/4)]"
              >
                <Link href={product.href} className="group block">
                  <div className="relative aspect-3/4 overflow-hidden bg-zinc-100">
                    {product.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageSrc}
                        alt={product.name}
                        className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="flex size-full items-end p-4"
                        style={{
                          background: `linear-gradient(160deg, ${colors[0]?.hex || "#d6d3d1"} 0%, #f5f5f4 75%)`,
                        }}
                      >
                        <div className="flex gap-1.5">
                          {colors.slice(0, 4).map((color) => (
                            <span
                              key={color.id}
                              className="size-4 rounded-full border border-white/70 shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-3 font-fraunces text-xs uppercase leading-tight text-foreground">
                    <span className="min-w-0 truncate">{product.name}</span>
                    <span className="shrink-0">{product.price}</span>
                  </div>
                  {colors.length > 0 ? (
                    <div className="mt-2 flex items-center gap-1.5">
                      {colors.slice(0, 5).map((color) => (
                        <span
                          key={color.id}
                          title={color.name || color.hex}
                          className="size-3.5 rounded-full border border-zinc-200"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  ) : null}
                </Link>
              </article>
            );
          })}
        </div>

        {canScroll ? (
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
        ) : null}
      </div>
    </section>
  );
}
