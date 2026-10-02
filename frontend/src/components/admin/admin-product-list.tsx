"use client";

import Link from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import {
  useArchiveProduct,
  useProducts,
  useUpdateProductStatus,
} from "@/features/products";
import { getErrorMessage } from "@/lib/api/errors";
import { formatMoney } from "@/lib/utils/money";

export function AdminProductList() {
  const { data, isLoading, isError } = useProducts({
    limit: 50,
    includeInactive: true,
  });
  const archiveProduct = useArchiveProduct();
  const updateStatus = useUpdateProductStatus();

  if (isLoading) {
    return <Spinner label="Loading products…" />;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load products.</p>;
  }

  const products = data?.data ?? [];

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-muted bg-white px-6 py-12 text-center">
        <p className="text-[15px] text-zinc-500">
          No products yet. Create the first one above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-muted bg-white">
      <ul className="divide-y divide-brand-muted/80">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="size-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                style={
                  product.images[0]
                    ? undefined
                    : { backgroundColor: product.colors[0]?.hex || "#e7e5e4" }
                }
              >
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">{product.name}</p>
                <p className="text-sm text-zinc-500">
                  {product.category ? product.category.name : "Uncategorized"} ·{" "}
                  {formatMoney(product.price)} · {product.stock} in stock ·{" "}
                  <span className="capitalize">{product.status}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1.5">
                {product.colors.slice(0, 4).map((color) => (
                  <div key={color.id} className="flex items-center gap-2">
                    <span
                      title={color.name || color.hex}
                      className="size-4 rounded-full border border-zinc-200"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {color.sizes.map((size) => (
                        <span
                          key={size.id}
                          className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-zinc-700"
                        >
                          {size.label}:{size.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={routes.product(product.slug)}
                className="text-sm font-medium text-brand hover:underline"
              >
                View
              </Link>
              {product.status === "archived" ? (
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ id: product.id, status: "active" })
                  }
                  className="text-sm font-medium text-zinc-700 hover:text-brand disabled:opacity-50"
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  disabled={archiveProduct.isPending}
                  onClick={() => archiveProduct.mutate(product.id)}
                  className="text-sm font-medium text-zinc-700 hover:text-red-600 disabled:opacity-50"
                >
                  Archive
                </button>
              )}
            </div>
            {archiveProduct.isError || updateStatus.isError ? (
              <p className="w-full text-xs text-red-600">
                {getErrorMessage(
                  archiveProduct.error ?? updateStatus.error,
                  "Action failed",
                )}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
