"use client";

import { Spinner } from "@/components/ui/spinner";
import type { Order, OrderItem, OrderStatus } from "@/entities/order";
import { useOrders, useUpdateOrderStatus } from "@/features/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { formatMoney } from "@/lib/utils/money";

function statusLabel(status: OrderStatus): string {
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

function statusClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200/80";
    case "processing":
      return "bg-sky-50 text-sky-800 ring-sky-200/80";
    case "shipped":
      return "bg-violet-50 text-violet-800 ring-violet-200/80";
    case "delivered":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
    case "cancelled":
      return "bg-zinc-100 text-zinc-600 ring-zinc-200";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

function nextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "processing":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered"];
    default:
      return [];
  }
}

function ProductThumb({ item }: { item: OrderItem }) {
  return (
    <div
      className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200/80"
      title={`${item.productName}${item.sizeLabel ? ` · ${item.sizeLabel}` : ""} ×${item.quantity}`}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-brand-soft text-[10px] font-medium text-brand">
          {item.productName.slice(0, 2).toUpperCase()}
        </div>
      )}
      {item.quantity > 1 ? (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-medium text-white">
          {item.quantity}
        </span>
      ) : null}
    </div>
  );
}

function ProductsCell({ items }: { items: OrderItem[] }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex shrink-0 -space-x-2">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={item.id}
            className="relative"
            style={{ zIndex: items.length - index }}
          >
            <ProductThumb item={item} />
          </div>
        ))}
        {items.length > 3 ? (
          <div className="relative z-0 flex size-12 items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200/80">
            +{items.length - 3}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 space-y-1">
        {items.map((item) => (
          <div key={item.id} className="min-w-0">
            <p className="truncate text-[13px] font-medium text-zinc-900">
              {item.productName}
            </p>
            <p className="truncate text-[12px] text-zinc-500">
              {item.sizeLabel ? `Size ${item.sizeLabel}` : "—"}
              {item.colorName ? ` · ${item.colorName}` : ""}
              {" · "}×{item.quantity}
              {" · "}
              {formatMoney(item.totalPrice)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOrderList() {
  const { data, isLoading, isError } = useOrders({ limit: 50 });
  const orders = data?.data ?? [];

  if (isLoading) {
    return <Spinner label="Loading orders…" />;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load orders.</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-muted bg-white px-6 py-16 text-center">
        <p className="text-[15px] text-zinc-500">
          No orders yet. They will appear here after checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-muted bg-white shadow-sm shadow-brand-muted/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-muted bg-brand-soft/50 text-[12px] font-semibold tracking-wide text-zinc-500 uppercase">
              <th className="px-4 py-3.5 sm:px-5">Order</th>
              <th className="px-4 py-3.5 sm:px-5">Products</th>
              <th className="px-4 py-3.5 sm:px-5">Customer</th>
              <th className="px-4 py-3.5 sm:px-5">Ship to</th>
              <th className="px-4 py-3.5 sm:px-5">Status</th>
              <th className="px-4 py-3.5 text-right sm:px-5">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const options = nextStatuses(order.status);

  return (
    <tr className="border-b border-brand-muted/70 align-top last:border-b-0 hover:bg-brand-soft/25">
      <td className="px-4 py-4 sm:px-5">
        <p className="font-medium text-zinc-900">{order.orderNumber}</p>
        <p className="mt-0.5 text-[12px] text-zinc-500">
          {formatDate(order.createdAt)}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">
          {order.items.length} item{order.items.length === 1 ? "" : "s"}
        </p>
      </td>

      <td className="px-4 py-4 sm:px-5">
        <ProductsCell items={order.items} />
      </td>

      <td className="px-4 py-4 sm:px-5">
        <p className="text-[13px] font-medium text-zinc-900">
          {order.customer?.fullName ?? order.shippingAddress.fullName}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-zinc-500">
          {order.customer?.email ?? "—"}
        </p>
      </td>

      <td className="max-w-[200px] px-4 py-4 sm:px-5">
        <p className="text-[13px] text-zinc-800">
          {order.shippingAddress.city}
          {order.shippingAddress.state
            ? `, ${order.shippingAddress.state}`
            : ""}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-zinc-500">
          {order.shippingAddress.line1}
          {order.shippingAddress.postalCode
            ? ` · ${order.shippingAddress.postalCode}`
            : ""}
        </p>
        <p className="mt-0.5 text-[12px] text-zinc-400">
          {order.shippingAddress.country}
        </p>
      </td>

      <td className="px-4 py-4 sm:px-5">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
            statusClass(order.status),
          )}
        >
          {statusLabel(order.status)}
        </span>
        {options.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {options.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: order.id, status })}
                className="rounded-lg border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-700 transition hover:border-brand hover:text-brand disabled:opacity-50"
              >
                Mark {statusLabel(status).toLowerCase()}
              </button>
            ))}
          </div>
        ) : null}
        {updateStatus.isError ? (
          <p className="mt-1 text-[11px] text-red-600">
            {getErrorMessage(updateStatus.error, "Update failed")}
          </p>
        ) : null}
      </td>

      <td className="px-4 py-4 text-right sm:px-5">
        <p className="text-[14px] font-semibold tabular-nums text-zinc-950">
          {formatMoney(order.total)}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400">
          ship {formatMoney(order.shippingCost)}
        </p>
      </td>
    </tr>
  );
}
