"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { BurgerMenuIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "@/icons";
import { useCartStore } from "@/store/cart.store";
import { useUiStore } from "@/store/ui.store";

export function Header() {
  const openBag = useUiStore((state) => state.openBag);
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="border-b border-zinc-200 bg-white">
      <Container className="relative flex h-20 items-center justify-between">
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center text-foreground"
        >
          <BurgerMenuIcon />
        </button>

        <Link
          href={routes.home}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <img
            src="/logo.svg"
            alt={siteConfig.name}
            width={212}
            height={45}
            className="w-auto"
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex size-10 items-center justify-center text-foreground"
          >
            <SearchIcon />
          </button>

          <Link
            href={routes.account}
            aria-label="Account"
            className="inline-flex size-10 items-center justify-center text-foreground"
          >
            <UserIcon />
          </Link>

          <button
            type="button"
            onClick={openBag}
            aria-label={`Shopping bag, ${itemCount} items`}
            className="inline-flex h-10 items-center text-foreground"
          >
            <span className="inline-flex size-10 items-center justify-center">
              <ShoppingBagIcon />
            </span>
            <span className="-ml-1.5 min-w-3 text-sm leading-none tabular-nums">
              {itemCount}
            </span>
          </button>
        </div>
      </Container>
    </header>
  );
}
