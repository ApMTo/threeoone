"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/layout/container";
import {
  ProductSection,
  type ProductSectionItem,
} from "@/components/products/product-section";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import type { Category } from "@/entities/category";
import type { ProductSummary } from "@/entities/product";
import { useCategories } from "@/features/categories";
import { useProducts } from "@/features/products";
import { ArrowLeftIcon } from "@/icons";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";

type CategoryGroup = {
  id: string;
  slug: string;
  name: string;
  products: ProductSummary[];
  subcategories: Array<{
    id: string;
    slug: string;
    name: string;
    products: ProductSummary[];
  }>;
};

function toSectionItem(product: ProductSummary): ProductSectionItem {
  return {
    id: product.id,
    name: product.name,
    price: formatMoney(product.price),
    imageSrc: product.images[0] || product.imageUrl || null,
    href: routes.product(product.slug),
    colors: product.colors.map((color) => ({
      id: color.id,
      hex: color.hex,
      name: color.name,
    })),
  };
}

function buildCategoryGroups(
  roots: Category[],
  products: ProductSummary[],
): CategoryGroup[] {
  const rootById = new Map(roots.map((root) => [root.id, root]));
  const childToRoot = new Map<string, Category>();

  for (const root of roots) {
    for (const child of root.children ?? []) {
      childToRoot.set(child.id, root);
    }
  }

  const groups = new Map<string, CategoryGroup>();

  const ensureGroup = (root: Category): CategoryGroup => {
    let group = groups.get(root.id);
    if (!group) {
      group = {
        id: root.id,
        slug: root.slug,
        name: root.name,
        products: [],
        subcategories: (root.children ?? []).map((child) => ({
          id: child.id,
          slug: child.slug,
          name: child.name,
          products: [],
        })),
      };
      groups.set(root.id, group);
    }
    return group;
  };

  for (const product of products) {
    const parentId = product.category?.parentId ?? null;
    const root =
      (parentId ? rootById.get(parentId) : undefined) ??
      childToRoot.get(product.categoryId) ??
      (product.category && !product.category.parentId
        ? rootById.get(product.category.id)
        : undefined);

    if (!root) continue;

    const group = ensureGroup(root);
    group.products.push(product);

    const subcategory = group.subcategories.find(
      (item) => item.id === product.categoryId,
    );
    if (subcategory) {
      subcategory.products.push(product);
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      subcategories: group.subcategories.filter((item) => item.products.length > 0),
    }))
    .filter((group) => group.products.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
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
  );
}

export function ProductsCatalog() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category")?.trim() || null;

  const {
    data: roots = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories(true);
  const {
    data: productsPage,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts({ limit: 100 });

  const products = productsPage?.data ?? [];
  const groups = useMemo(
    () => buildCategoryGroups(roots, products),
    [roots, products],
  );

  const activeGroup = useMemo(() => {
    if (!categorySlug) return null;

    const rootMatch = groups.find((group) => group.slug === categorySlug);
    if (rootMatch) {
      return {
        kind: "root" as const,
        group: rootMatch,
        products: rootMatch.products,
        title: rootMatch.name,
      };
    }

    for (const group of groups) {
      const sub = group.subcategories.find((item) => item.slug === categorySlug);
      if (sub) {
        return {
          kind: "sub" as const,
          group,
          products: sub.products,
          title: sub.name,
          parent: group,
        };
      }
    }

    return null;
  }, [categorySlug, groups]);

  const isLoading = categoriesLoading || productsLoading;
  const isError = categoriesError || productsError;

  return (
    <Container className="py-10">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        {categorySlug ? (
          <Link
            href={routes.products}
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-3 w-1.5" />
            All products
          </Link>
        ) : null}

        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
          {activeGroup ? activeGroup.title : "Products"}
        </h1>
        <p className="mt-2 text-[15px] text-zinc-500">
          {activeGroup
            ? `${activeGroup.products.length} piece${activeGroup.products.length === 1 ? "" : "s"} in this collection.`
            : "Browse the latest pieces from the collection."}
        </p>
      </div>

      {isLoading ? <Spinner label="Loading products…" /> : null}

      {isError ? (
        <p className="text-sm text-red-600">Something went wrong.</p>
      ) : null}

      {!isLoading && !isError && products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-[15px] text-zinc-500">
            No products yet. An admin can add them in the dashboard.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && products.length > 0 && groups.length === 0 ? (
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">
            Showing all products. Assign categories in admin to group them.
          </p>
          <ProductGrid products={products} />
        </div>
      ) : null}

      {!isLoading && !isError && groups.length > 0 && !categorySlug ? (
        <div className="flex flex-col gap-12">
          {groups.length > 1 ? (
            <nav className="flex flex-wrap gap-2" aria-label="Categories">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={routes.productsCategory(group.slug)}
                  className="border border-zinc-200 px-3 py-1.5 font-fraunces text-xs uppercase tracking-wide text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
                >
                  {group.name}
                </Link>
              ))}
            </nav>
          ) : null}

          {groups.map((group) => (
            <ProductSection
              key={group.id}
              title={group.name}
              href={routes.productsCategory(group.slug)}
              products={group.products.map(toSectionItem)}
              padded={false}
              className="bg-transparent"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && categorySlug && !activeGroup ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-[15px] text-zinc-500">
            No products in this category.
          </p>
          <Link
            href={routes.products}
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Back to all products
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && activeGroup ? (
        <div className="space-y-8">
          {activeGroup.kind === "root" && activeGroup.group.subcategories.length > 1 ? (
            <nav className="flex flex-wrap gap-2" aria-label="Subcategories">
              <Link
                href={routes.productsCategory(activeGroup.group.slug)}
                className={cn(
                  "border px-3 py-1.5 font-fraunces text-xs uppercase tracking-wide transition",
                  "border-zinc-900 bg-zinc-900 text-white",
                )}
              >
                All
              </Link>
              {activeGroup.group.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={routes.productsCategory(sub.slug)}
                  className="border border-zinc-200 px-3 py-1.5 font-fraunces text-xs uppercase tracking-wide text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
                >
                  {sub.name}
                </Link>
              ))}
            </nav>
          ) : null}

          {activeGroup.kind === "sub" && activeGroup.parent ? (
            <nav className="flex flex-wrap gap-2" aria-label="Subcategories">
              <Link
                href={routes.productsCategory(activeGroup.parent.slug)}
                className="border border-zinc-200 px-3 py-1.5 font-fraunces text-xs uppercase tracking-wide text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
              >
                All
              </Link>
              {activeGroup.parent.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={routes.productsCategory(sub.slug)}
                  className={cn(
                    "border px-3 py-1.5 font-fraunces text-xs uppercase tracking-wide transition",
                    sub.slug === categorySlug
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900",
                  )}
                >
                  {sub.name}
                </Link>
              ))}
            </nav>
          ) : null}

          <ProductGrid products={activeGroup.products} />
        </div>
      ) : null}
    </Container>
  );
}
