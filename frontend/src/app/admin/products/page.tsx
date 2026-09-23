"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { AdminProductList } from "@/components/admin/admin-product-list";

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Create catalog items with colors, sizes, and stock."
      />

      <div className="space-y-8">
        <AdminProductForm />
        <div>
          <h2 className="mb-3 font-fraunces text-xl font-semibold text-zinc-900">
            Catalog
          </h2>
          <AdminProductList />
        </div>
      </div>
    </>
  );
}
