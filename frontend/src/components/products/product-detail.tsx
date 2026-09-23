"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/entities/product";
import { routes } from "@/constants/routes";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";
import { useCartStore } from "@/store/cart.store";
import { useUiStore } from "@/store/ui.store";

const BENEFITS = [
  "Express Worldwide Shipping",
  "14-Day Returns",
  "Duties Covered to US & EU",
] as const;

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openBag = useUiStore((state) => state.openBag);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const activeColor = useMemo(() => {
    return (
      product.colors.find((color) => color.id === selectedColorId) ??
      product.colors[0] ??
      null
    );
  }, [product.colors, selectedColorId]);

  const availableSizes = activeColor?.sizes ?? [];

  const gallery = useMemo(() => {
    if (product.images.length > 0) {
      return product.images;
    }
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    return [] as string[];
  }, [product.imageUrl, product.images]);

  useEffect(() => {
    setImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (!activeColor) {
      setSelectedSizeId(null);
      return;
    }

    const stillValid = availableSizes.some((size) => size.id === selectedSizeId);
    if (!stillValid) {
      const firstInStock = availableSizes.find((size) => size.quantity > 0);
      setSelectedSizeId(firstInStock?.id ?? availableSizes[0]?.id ?? null);
    }
  }, [activeColor, availableSizes, selectedSizeId]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedColorId, selectedSizeId]);

  const activeSize = availableSizes.find((size) => size.id === selectedSizeId);
  const maxQuantity = activeSize?.quantity ?? 0;
  const canAdd = Boolean(activeColor && activeSize && maxQuantity > 0);

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity, quantity]);

  const showPrev = () => {
    if (gallery.length <= 1) return;
    setImageIndex((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const showNext = () => {
    if (gallery.length <= 1) return;
    setImageIndex((current) => (current + 1) % gallery.length);
  };

  const decreaseQty = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQty = () => {
    if (maxQuantity <= 0) return;
    setQuantity((current) => Math.min(maxQuantity, current + 1));
  };

  const handleAddToBag = () => {
    if (!canAdd || !activeColor || !activeSize) return;

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sizeId: activeSize.id,
      sizeLabel: activeSize.label,
      colorId: activeColor.id,
      colorName: activeColor.name,
      unitPrice: product.price,
      quantity,
      imageUrl: gallery[0] ?? product.imageUrl ?? null,
    });
    openBag();
  };

  return (
    <div className="bg-white text-zinc-900">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:py-12">
        <section className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-zinc-100">
            {gallery[imageIndex] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[imageIndex]}
                alt={product.name}
                className="absolute inset-0 size-full object-contain object-center p-2 sm:p-4"
              />
            ) : (
              <div
                className="absolute inset-0 transition-colors duration-500"
                style={{
                  background: `linear-gradient(145deg, ${activeColor?.hex || "#d6d3d1"} 0%, #fafaf9 72%)`,
                }}
              />
            )}

            {gallery.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={showPrev}
                  className="absolute top-1/2 left-3 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-zinc-800 shadow-sm transition hover:bg-white"
                >
                  <ArrowLeftIcon className="h-4 w-2.5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={showNext}
                  className="absolute top-1/2 right-3 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-zinc-800 shadow-sm transition hover:bg-white"
                >
                  <ArrowRightIcon className="h-4 w-2.5" />
                </button>
              </>
            ) : null}
          </div>
        </section>

        <section className="flex flex-col lg:pt-4">
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <p className="font-fraunces text-xl text-zinc-900 sm:text-2xl">{product.name}</p>
            <p className="mt-1 text-[15px] text-zinc-500">{formatMoney(product.price)}</p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {product.colors.map((color) => {
                const selected = color.id === activeColor?.id;
                const outOfStock = color.quantity <= 0;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    title={color.name || color.hex}
                    aria-label={color.name || color.hex}
                    aria-pressed={selected}
                    className={cn(
                      "size-7 rounded-[4px] transition",
                      selected
                        ? "ring-2 ring-brand ring-offset-2 ring-offset-white"
                        : "ring-1 ring-zinc-300",
                      outOfStock && "opacity-40",
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected = size.id === selectedSizeId;
                const disabled = size.quantity <= 0;

                return (
                  <button
                    key={size.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl text-sm font-medium transition",
                      selected
                        ? "bg-brand text-white"
                        : "border border-zinc-200 bg-white text-zinc-900 hover:border-brand/40",
                      disabled && "cursor-not-allowed opacity-35",
                    )}
                  >
                    {size.label}
                  </button>
                );
              })}
            </div>

            {activeSize ? (
              <p className="mt-3 text-sm text-zinc-500">
                {activeSize.quantity > 0 ? (
                  <>
                    <span className="font-medium text-zinc-800">{activeSize.quantity}</span>
                    {" in stock"}
                    {activeSize.quantity <= 3 ? (
                      <span className="text-brand"> · low stock</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            ) : null}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm text-zinc-600">Quantity</span>
              <div className="inline-flex h-11 items-center rounded-xl border border-zinc-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={!canAdd || quantity <= 1}
                  onClick={decreaseQty}
                  className="flex size-11 items-center justify-center text-lg text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>
                <span className="min-w-10 text-center text-sm font-medium tabular-nums text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!canAdd || quantity >= maxQuantity}
                  onClick={increaseQty}
                  className="flex size-11 items-center justify-center text-lg text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 font-fraunces text-[13px] text-zinc-600">
              <p>Model is 175cm & wears Size M</p>
              <button
                type="button"
                className="shrink-0 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-900 hover:decoration-zinc-900"
              >
                Size Chart
              </button>
            </div>

            <div className="mt-8 rounded-sm border border-zinc-200 bg-brand-soft/40 px-5 py-5">
              <ul className="space-y-3">
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 font-fraunces text-[15px] leading-none text-zinc-900"
                  >
                    <CheckIcon className="size-3.5 shrink-0 text-brand" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={handleAddToBag}
              className={cn(
                "mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-[15px] font-medium text-white transition",
                "hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              Add to bag
            </button>

            <p className="mt-4 text-center text-xs text-zinc-400">
              <Link
                href={routes.products}
                className="underline-offset-2 hover:text-zinc-700 hover:underline"
              >
                Back to products
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
