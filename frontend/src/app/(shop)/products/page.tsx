"use client";

import { Suspense } from "react";

import { ProductsCatalog } from "@/components/products/products-catalog";
import { Container } from "@/components/layout/container";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <Spinner label="Loading products…" />
        </Container>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
