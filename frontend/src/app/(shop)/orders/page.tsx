"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/constants/routes";
import type { Order } from "@/entities/order";
import { useOrders } from "@/features/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/utils/format";
import { formatMoney } from "@/lib/utils/money";
import { ordersService } from "@/services/orders.service";

function statusLabel(status: Order["status"]): string {
  switch (status) {
    case "pending":
      return "Awaiting payment";
    case "processing":
      return "Paid / processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-2xl border border-brand-muted bg-white px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Order {order.orderNumber}</p>
          <p className="mt-1 text-[15px] font-medium text-zinc-900">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">
            {statusLabel(order.status)}
          </p>
          <p className="mt-1 text-[15px] font-semibold tabular-nums text-zinc-950">
            {formatMoney(order.total)}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3 border-t border-brand-muted/70 pt-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-zinc-900">
                {item.productName}
              </p>
              <p className="text-[13px] text-zinc-500">
                {item.sizeLabel ? `Size: ${item.sizeLabel}` : null}
                {item.sizeLabel ? " · " : null}
                Qty {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-[14px] tabular-nums text-zinc-900">
              {formatMoney(item.totalPrice)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl bg-brand-soft/60 px-3.5 py-2.5 text-[13px] text-zinc-700">
        {order.estimatedDelivery || "Estimated delivery: 7–14 days"}
      </p>
    </article>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const placed = searchParams.get("placed") === "1";
  const orderNumber = searchParams.get("order");
  const orderId = searchParams.get("id");
  const { data, isLoading, isError, refetch } = useOrders({ limit: 50 });

  const [syncState, setSyncState] = useState<
    "idle" | "syncing" | "paid" | "pending" | "error"
  >(placed && orderId ? "syncing" : "idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!placed || !orderId) return;

    let cancelled = false;

    (async () => {
      setSyncState("syncing");
      setSyncError(null);

      try {
        // After 3DS redirect, webhook or confirm may still be catching up.
        for (let attempt = 0; attempt < 10; attempt += 1) {
          if (cancelled) return;

          try {
            const order = await ordersService.confirmPayment(orderId);
            if (order.status !== "pending") {
              if (!cancelled) {
                setSyncState("paid");
                await queryClient.invalidateQueries({
                  queryKey: queryKeys.orders.all,
                });
                await refetch();
              }
              return;
            }
          } catch {
            // Payment may still be processing — keep polling briefly.
          }

          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        if (!cancelled) {
          setSyncState("pending");
          await refetch();
        }
      } catch (error) {
        if (!cancelled) {
          setSyncState("error");
          setSyncError(getErrorMessage(error));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placed, orderId, queryClient, refetch]);

  const orders = data?.data ?? [];
  const highlighted = orderNumber
    ? orders.find((order) => order.orderNumber === orderNumber)
    : undefined;

  return (
    <Container className="space-y-6 py-10">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900">
          Orders
        </h1>
        <p className="mt-2 text-[15px] text-zinc-600">
          Track your purchases and delivery estimates.
        </p>
      </div>

      {placed ? (
        <div className="rounded-2xl border border-brand-muted bg-brand-soft/50 px-5 py-4 text-[15px] text-zinc-800">
          {syncState === "syncing" ? (
            <>
              <p className="font-medium text-zinc-950">Confirming your payment…</p>
              <p className="mt-1 text-zinc-700">
                This usually takes a second. Please keep this page open.
              </p>
            </>
          ) : null}

          {syncState === "paid" ||
          (syncState === "idle" && highlighted?.status === "processing") ||
          (syncState === "pending" && highlighted?.status === "processing") ? (
            <>
              <p className="font-medium text-zinc-950">
                Thank you. Your payment went through.
              </p>
              {orderNumber ? (
                <p className="mt-1 text-zinc-700">
                  Order number:{" "}
                  <span className="font-medium">{orderNumber}</span>
                </p>
              ) : null}
              <p className="mt-2 text-zinc-700">
                Estimated delivery:{" "}
                <span className="font-medium">7–14 days</span>.
              </p>
            </>
          ) : null}

          {syncState === "pending" && highlighted?.status !== "processing" ? (
            <>
              <p className="font-medium text-zinc-950">Payment is still processing</p>
              {orderNumber ? (
                <p className="mt-1 text-zinc-700">
                  Order number:{" "}
                  <span className="font-medium">{orderNumber}</span>
                </p>
              ) : null}
              <p className="mt-2 text-zinc-700">
                If you were charged, refresh this page in a minute. Status will
                update to Paid / processing.
              </p>
            </>
          ) : null}

          {syncState === "error" ? (
            <>
              <p className="font-medium text-zinc-950">Could not confirm payment</p>
              <p className="mt-1 text-zinc-700">
                {syncError ?? "Refresh Orders or contact support if you were charged."}
              </p>
            </>
          ) : null}

          {syncState === "idle" && !orderId ? (
            <>
              <p className="font-medium text-zinc-950">Checkout finished</p>
              {orderNumber ? (
                <p className="mt-1 text-zinc-700">
                  Order number:{" "}
                  <span className="font-medium">{orderNumber}</span>
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {isLoading ? <Spinner label="Loading orders…" /> : null}
      {isError ? (
        <p className="text-sm text-red-600">Failed to load orders.</p>
      ) : null}

      {!isLoading && !isError && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-muted bg-white px-6 py-12 text-center">
          <p className="text-[15px] text-zinc-500">No orders yet.</p>
          <Link
            href={routes.products}
            className="mt-4 inline-flex text-[15px] font-medium text-brand underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : null}
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <Spinner label="Loading…" />
        </Container>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
