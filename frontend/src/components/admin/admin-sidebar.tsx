"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { useCurrentUser, useLogout } from "@/features/auth";
import {
  BurgerMenuIcon,
  CategoryIcon,
  DashboardIcon,
  LogoutIcon,
  OrdersIcon,
  PackageIcon,
} from "@/icons";
import { cn } from "@/lib/utils/cn";

const navItems = [
  {
    href: routes.admin.root,
    label: "Dashboard",
    icon: DashboardIcon,
    match: (pathname: string) => pathname === routes.admin.root,
  },
  {
    href: routes.admin.products,
    label: "Products",
    icon: PackageIcon,
    match: (pathname: string) => pathname.startsWith(routes.admin.products),
  },
  {
    href: routes.admin.categories,
    label: "Categories",
    icon: CategoryIcon,
    match: (pathname: string) => pathname.startsWith(routes.admin.categories),
  },
  {
    href: routes.admin.orders,
    label: "Orders",
    icon: OrdersIcon,
    match: (pathname: string) => pathname.startsWith(routes.admin.orders),
  },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Admin">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
              active
                ? "bg-brand text-white shadow-sm shadow-brand/20"
                : "text-zinc-700 hover:bg-brand-muted/70 hover:text-zinc-900",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0",
                active ? "text-white" : "text-brand group-hover:text-brand",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    onNavigate?.();
    try {
      await logout.mutateAsync();
    } finally {
      router.replace(routes.login);
    }
  };

  return (
    <div className="border-t border-brand-muted/80 p-4">
      <div className="mb-3 rounded-xl bg-white/70 px-3 py-2.5">
        <p className="truncate text-sm font-medium text-zinc-900">
          {user?.fullName ?? "Admin"}
        </p>
        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-zinc-700 transition-colors hover:bg-white hover:text-zinc-900 disabled:opacity-60"
      >
        <LogoutIcon className="size-[18px] text-brand" />
        {logout.isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <Link href={routes.admin.root} className="flex min-w-0 flex-col">
        <span className="font-fraunces text-xl font-semibold tracking-tight text-zinc-900">
          {siteConfig.name}
        </span>
        <span className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
          Admin
        </span>
      </Link>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-muted bg-brand-soft lg:flex">
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      <div className="flex items-center justify-between border-b border-brand-muted bg-brand-soft px-4 py-3 lg:hidden">
        <SidebarBrand />
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex size-10 items-center justify-center rounded-xl text-zinc-800 transition-colors hover:bg-brand-muted/60"
        >
          <BurgerMenuIcon />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-zinc-900/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-brand-soft shadow-xl">
            <SidebarBrand />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
