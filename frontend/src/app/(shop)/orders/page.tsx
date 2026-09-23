"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { routes } from "@/constants/routes";

function OrdersContent() {
  const searchParams = useSearchParams();
  const placed = searchParams.get("placed") === "1";

  return (
    <Container className="space-y-4 py-10">
      <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
        Orders
      </h1>

      {placed ? (
        <div className="rounded-2xl border border-brand-muted bg-brand-soft/50 px-5 py-4 text-[15px] text-zinc-800">
          Thanks — your checkout details were received. Order history will show
          here once payments are connected.
        </div>
      ) : (
        <p className="text-zinc-600">
          Your order history will appear here after you complete checkout.
        </p>
      )}

      <Link
        href={routes.products}
        className="inline-flex text-[15px] font-medium text-brand underline-offset-4 hover:underline"
      >
        Continue shopping
      </Link>
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <p className="text-zinc-600">Loading…</p>
        </Container>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
