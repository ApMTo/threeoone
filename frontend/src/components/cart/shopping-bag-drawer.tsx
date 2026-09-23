"use client";

import Link from "next/link";
import { useEffect } from "react";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { CloseIcon } from "@/icons";
import { formatMoney } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import { useCartStore, type LocalCartItem } from "@/store/cart.store";
import { useUiStore } from "@/store/ui.store";

const FREE_SHIPPING_THRESHOLD = 100;

function BagItemRow({ item }: { item: LocalCartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return (
    <li className="flex gap-4 border-b border-zinc-200 py-5">
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:size-[100px]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-zinc-200" />
        )}
        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-md bg-zinc-950 text-[11px] font-medium text-white tabular-nums">
          {item.quantity}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[13px] font-semibold tracking-wide text-zinc-950 uppercase">
            {item.productName}
          </p>
          <p className="shrink-0 text-[13px] font-medium text-zinc-950 tabular-nums">
            {formatMoney(item.unitPrice)}
          </p>
        </div>

        <p className="mt-1 text-[13px] text-zinc-500">Size: {item.sizeLabel}</p>

        <div className="mt-auto flex items-center justify-end gap-4 pt-3 text-[15px] text-zinc-900">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
            className="inline-flex size-7 items-center justify-center transition hover:opacity-60"
          >
            −
          </button>
          <span className="min-w-4 text-center tabular-nums">{item.quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
            className="inline-flex size-7 items-center justify-center transition hover:opacity-60"
          >
            +
          </button>
        </div>
      </div>
    </li>
  );
}

export function ShoppingBagDrawer() {
  const isOpen = useUiStore((state) => state.isBagOpen);
  const closeBag = useUiStore((state) => state.closeBag);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.unitPrice.amount * item.quantity, 0),
  );
  const currency = items[0]?.unitPrice.currency ?? "USD";

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBag();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeBag, isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close shopping bag"
        onClick={closeBag}
        className={cn(
          "absolute inset-0 bg-zinc-950/35 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-6">
          <h2 className="text-[17px] font-medium tracking-tight text-zinc-950">
            Shopping Bag
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeBag}
            className="inline-flex size-9 items-center justify-center text-zinc-950 transition hover:opacity-60"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6">
          <div className="border-b border-zinc-200 py-6">
            <p className="text-[17px] font-semibold text-zinc-950">
              Spend {formatMoney({ amount: FREE_SHIPPING_THRESHOLD, currency })}
            </p>
            <p className="mt-1 text-[14px] text-zinc-500">
              Free Shipping and a gift from {siteConfig.name}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="py-10 text-center text-[15px] text-zinc-500">
              Your bag is empty.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <BagItemRow key={item.lineId} item={item} />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-zinc-100 p-5 sm:p-6">
          <Link
            href={routes.checkout}
            onClick={closeBag}
            className={cn(
              "flex h-14 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-medium text-white transition",
              items.length === 0
                ? "pointer-events-none opacity-40"
                : "hover:bg-brand/90",
            )}
            aria-disabled={items.length === 0}
          >
            Check Out {formatMoney({ amount: subtotal, currency })}
          </Link>
        </div>
      </aside>
    </div>
  );
}
