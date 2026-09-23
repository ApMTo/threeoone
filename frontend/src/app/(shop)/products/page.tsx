"use client";

import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import { useProducts } from "@/features/products";
import { formatMoney } from "@/lib/utils/money";

export default function ProductsPage() {
  const { data, isLoading, isError } = useProducts({ limit: 48 });

  return (
    <Container className="py-10">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
          Products
        </h1>
        <p className="mt-2 text-[15px] text-zinc-500">
          Browse the latest pieces from the collection.
        </p>
      </div>

      {isLoading ? <Spinner label="Loading products…" /> : null}

      {isError ? (
        <p className="text-sm text-red-600">
          Could not load products. Make sure the API is running.
        </p>
      ) : null}

      {!isLoading && !isError && (data?.data.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-[15px] text-zinc-500">
            No products yet. An admin can add them in the dashboard.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && data && data.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {data.data.map((product) => {
            const imageSrc = product.images[0] || product.imageUrl || null;

            return (
              <article key={product.id}>
                <Link href={routes.product(product.slug)} className="group block">
                  <div className="relative aspect-3/4 overflow-hidden bg-zinc-100">
                    {imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="flex size-full items-end p-4"
                        style={{
                          background: `linear-gradient(160deg, ${product.colors[0]?.hex || "#d6d3d1"} 0%, #f5f5f4 75%)`,
                        }}
                      >
                        <div className="flex gap-1.5">
                          {product.colors.slice(0, 4).map((color) => (
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
                    <span className="shrink-0">{formatMoney(product.price)}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    {product.colors.slice(0, 5).map((color) => (
                      <span
                        key={color.id}
                        title={color.name || color.hex}
                        className="size-3.5 rounded-full border border-zinc-200"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </Container>
  );
}
