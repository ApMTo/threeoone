import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { routes } from "@/constants/routes";

const cards = [
  {
    href: routes.admin.products,
    title: "Products",
    description: "Create and edit catalog items, pricing, and availability.",
  },
  {
    href: routes.admin.categories,
    title: "Categories",
    description: "Organize the storefront taxonomy and navigation structure.",
  },
  {
    href: routes.admin.orders,
    title: "Orders",
    description: "Review incoming orders and fulfillment status.",
  },
] as const;

export default function AdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Manage catalog, categories, and orders from one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-brand-muted bg-white p-5 transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
          >
            <h2 className="font-fraunces text-xl font-semibold text-zinc-900 transition-colors group-hover:text-brand">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
