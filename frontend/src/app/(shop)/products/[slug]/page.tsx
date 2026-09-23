"use client";

import Link from "next/link";
import { use } from "react";

import { ProductDetail } from "@/components/products/product-detail";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import { useProductBySlug } from "@/features/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useProductBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Spinner label="Loading product…" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="font-fraunces text-2xl font-semibold text-zinc-900">
          Product not found
        </h1>
        <Link href={routes.products} className="text-sm text-brand underline">
          Back to products
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
