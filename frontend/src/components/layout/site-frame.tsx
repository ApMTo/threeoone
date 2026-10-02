"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ShoppingBagDrawer } from "@/components/cart/shopping-bag-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { routes } from "@/constants/routes";

const bareRoutes = [
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
  routes.admin.root,
] as const;
const checkoutRoutes = [routes.checkout] as const;

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBare = bareRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isCheckout = checkoutRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isBare) {
    return <main className="min-h-full">{children}</main>;
  }

  if (isCheckout) {
    return (
      <>
        <main className="min-h-full">{children}</main>
        <ShoppingBagDrawer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ShoppingBagDrawer />
    </>
  );
}
